import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, MessageSquare, Brain, Target, BarChart } from 'lucide-react';
import './Home.css';

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="home-page">
      <header className="hero container">
        <div className="hero-content animate-fade-in">
          <h1 className="hero-title">
            Master Your Next Interview with <span className="text-gradient">AI</span>
          </h1>
          <p className="hero-subtitle">
            Practice realistic interviews, improve communication skills, and get personalized feedback from your AI interview coach.
          </p>
          <div className="hero-actions">
            {currentUser ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard <ArrowRight size={20} />
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-lg">
                Start Practicing Free <ArrowRight size={20} />
              </Link>
            )}
          </div>
        </div>
        
        <div className="hero-visual glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="mock-chat">
            <div className="chat-bubble ai">
              Hello! I'm your AI interviewer. Let's start with your self-introduction.
            </div>
            <div className="chat-bubble user">
              Hi, I'm a computer science student passionate about web development...
            </div>
            <div className="chat-bubble ai highlight">
              Great start! How did you handle a challenging bug in your recent project?
            </div>
          </div>
        </div>
      </header>

      <section className="features container">
        <h2 className="section-title text-center">Why InterviewVerse AI?</h2>
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon"><Brain size={32} /></div>
            <h3>Dynamic AI Personas</h3>
            <p>Practice with friendly HRs, strict technical interviewers, or startup founders.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon"><MessageSquare size={32} /></div>
            <h3>Voice & Text Practice</h3>
            <p>Speak your answers naturally and get feedback on clarity and communication.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon"><Target size={32} /></div>
            <h3>Visual Learning Mode</h3>
            <p>Stuck on a concept? The AI explains it using simple diagrams and analogies.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon"><BarChart size={32} /></div>
            <h3>Detailed Progress</h3>
            <p>Track your confidence, technical score, and communication improvements.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
