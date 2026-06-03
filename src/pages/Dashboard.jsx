import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Target, TrendingUp, Award, Play } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load history from local storage
    const historyStr = localStorage.getItem(`interviewVerse_history_${currentUser.id}`);
    if (historyStr) {
      setHistory(JSON.parse(historyStr));
    }
  }, [currentUser.id]);

  const avgScore = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.overallScore, 0) / history.length) 
    : 0;

  return (
    <div className="container dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <h1>Welcome back, {currentUser.name.split(' ')[0]}!</h1>
        <p>Here is your interview practice progress.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon"><Activity size={24} /></div>
          <div className="stat-info">
            <h3>{history.length}</h3>
            <p>Interviews Completed</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon"><Target size={24} /></div>
          <div className="stat-info">
            <h3>{avgScore}%</h3>
            <p>Average Score</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <h3>{history.length > 0 ? history[history.length - 1].overallScore : 0}%</h3>
            <p>Latest Score</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="section-card glass-panel">
          <h2><Award size={20} /> Recent Interviews</h2>
          
          {history.length === 0 ? (
            <div className="empty-state">
              <p>You haven't practiced any interviews yet.</p>
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/setup')}
              >
                Start Practice <Play size={16} />
              </button>
            </div>
          ) : (
            <div className="history-list">
              {history.slice().reverse().map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-info">
                    <h4>{item.type} - {item.personality}</h4>
                    <p>{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <div className="history-score">{item.overallScore}%</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section-card glass-panel">
          <h2>Strengths & Weaknesses</h2>
          {history.length === 0 ? (
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Complete an interview to see your analysis.
            </p>
          ) : (
            <div className="traits-list">
              {history[history.length - 1].strengths?.slice(0,2).map((s, i) => (
                <div key={`s-${i}`} className="trait-item strength">
                  <span>{s}</span>
                </div>
              ))}
              {history[history.length - 1].weaknesses?.slice(0,2).map((w, i) => (
                <div key={`w-${i}`} className="trait-item weakness">
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
