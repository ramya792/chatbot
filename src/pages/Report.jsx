import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertTriangle, Lightbulb, ArrowRight, Home } from 'lucide-react';
import './Report.css';

export default function Report() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const historyStr = localStorage.getItem(`interviewVerse_history_${currentUser.id}`);
    if (historyStr) {
      const history = JSON.parse(historyStr);
      setReport(history[parseInt(id)]);
    }
  }, [id, currentUser.id]);

  if (!report) {
    return (
      <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Report not found</h2>
        <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const getScoreClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  };

  return (
    <div className="report-container animate-fade-in">
      <div className="report-header">
        <h1>Interview Performance Report</h1>
        <p>{report.type.toUpperCase()} - {report.personality} | {new Date(report.date).toLocaleDateString()}</p>
      </div>

      <div className="score-cards">
        <div className="score-card glass-panel">
          <h3>Overall Score</h3>
          <div className={`score-circle ${getScoreClass(report.overallScore)}`}>
            {report.overallScore}%
          </div>
        </div>
        <div className="score-card glass-panel">
          <h3>Communication</h3>
          <div className={`score-circle ${getScoreClass(report.communicationScore)}`}>
            {report.communicationScore}%
          </div>
        </div>
        <div className="score-card glass-panel">
          <h3>Technical Info</h3>
          <div className={`score-circle ${getScoreClass(report.technicalScore)}`}>
            {report.technicalScore}%
          </div>
        </div>
        <div className="score-card glass-panel">
          <h3>Confidence</h3>
          <div className={`score-circle ${getScoreClass(report.confidenceScore)}`}>
            {report.confidenceScore}%
          </div>
        </div>
      </div>

      <div className="report-summary">
        <h2>Executive Summary</h2>
        <p>{report.summary}</p>
      </div>

      <div className="report-details">
        <div className="detail-section glass-panel">
          <h2><CheckCircle className="icon-check" size={24} /> Strengths</h2>
          <div className="detail-list">
            {report.strengths?.map((item, idx) => (
              <div key={idx} className="detail-item">
                <CheckCircle className="icon-check" size={20} style={{ flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-section glass-panel">
          <h2><AlertTriangle className="icon-warn" size={24} /> Weaknesses</h2>
          <div className="detail-list">
            {report.weaknesses?.map((item, idx) => (
              <div key={idx} className="detail-item">
                <AlertTriangle className="icon-warn" size={20} style={{ flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="detail-section glass-panel" style={{ marginBottom: '48px' }}>
        <h2><Lightbulb className="icon-info" size={24} /> Areas for Improvement</h2>
        <div className="detail-list">
          {report.improvementAreas?.map((item, idx) => (
            <div key={idx} className="detail-item">
              <Lightbulb className="icon-info" size={20} style={{ flexShrink: 0 }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="report-actions">
        <Link to="/dashboard" className="btn btn-secondary btn-lg">
          <Home size={20} /> Dashboard
        </Link>
        <Link to="/setup" className="btn btn-primary btn-lg">
          Practice Again <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
}
