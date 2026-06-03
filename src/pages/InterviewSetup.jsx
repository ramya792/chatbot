import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, User, Building2, ArrowRight, ArrowLeft, Play } from 'lucide-react';
import './InterviewSetup.css';

const INTERVIEW_TYPES = [
  { id: 'hr', title: 'HR Interview', desc: 'Behavioral and situational questions.' },
  { id: 'technical', title: 'Technical', desc: 'Core subject knowledge and coding.' },
  { id: 'communication', title: 'Communication', desc: 'Focus on clarity, grammar, and fluency.' },
  { id: 'self-intro', title: 'Self Introduction', desc: 'Perfect your elevator pitch.' },
  { id: 'aptitude', title: 'Aptitude Practice', desc: 'Logical and quantitative reasoning.' }
];

const PERSONALITIES = [
  { id: 'friendly', title: 'Friendly HR', desc: 'Supportive and encouraging.' },
  { id: 'strict', title: 'Strict HR', desc: 'Formal and detail-oriented.' },
  { id: 'tech', title: 'Technical Expert', desc: 'Deep dives into concepts.' },
  { id: 'recruiter', title: 'Corporate Recruiter', desc: 'Focuses on cultural fit.' },
  { id: 'startup', title: 'Startup Founder', desc: 'Looks for passion and versatility.' }
];

const COMPANIES = [
  { id: 'google', title: 'Google Style', desc: 'Algorithm & scale focused.' },
  { id: 'microsoft', title: 'Microsoft Style', desc: 'System design & core logic.' },
  { id: 'startup', title: 'Startup Style', desc: 'Fast-paced & product focused.' },
  { id: 'corporate', title: 'Corporate Style', desc: 'Standard enterprise interview.' },
  { id: 'general', title: 'General', desc: 'Standard mixed interview.' }
];

export default function InterviewSetup() {
  const [step, setStep] = useState(1);
  const [setupData, setSetupData] = useState({
    type: '',
    personality: '',
    company: 'general'
  });
  const navigate = useNavigate();

  const handleSelect = (key, value) => {
    setSetupData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !setupData.type) return;
    if (step === 2 && !setupData.personality) return;
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Navigate to interview session with state
      navigate('/interview', { state: { setupData } });
    }
  };

  return (
    <div className="setup-container animate-fade-in">
      <div className="setup-header">
        <h1>Customize Your Interview</h1>
        <p>Step {step} of 3</p>
      </div>

      {step === 1 && (
        <div className="setup-section">
          <h2>
            <span className="setup-section-icon"><Briefcase size={24} /></span>
            Select Interview Type
          </h2>
          <div className="options-grid">
            {INTERVIEW_TYPES.map(type => (
              <div 
                key={type.id} 
                className={`option-card ${setupData.type === type.id ? 'selected' : ''}`}
                onClick={() => handleSelect('type', type.id)}
              >
                <h3>{type.title}</h3>
                <p>{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="setup-section">
          <h2>
            <span className="setup-section-icon"><User size={24} /></span>
            Choose Interviewer Personality
          </h2>
          <div className="options-grid">
            {PERSONALITIES.map(person => (
              <div 
                key={person.id} 
                className={`option-card ${setupData.personality === person.id ? 'selected' : ''}`}
                onClick={() => handleSelect('personality', person.id)}
              >
                <h3>{person.title}</h3>
                <p>{person.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="setup-section">
          <h2>
            <span className="setup-section-icon"><Building2 size={24} /></span>
            Select Company Mode (Optional)
          </h2>
          <div className="options-grid">
            {COMPANIES.map(company => (
              <div 
                key={company.id} 
                className={`option-card ${setupData.company === company.id ? 'selected' : ''}`}
                onClick={() => handleSelect('company', company.id)}
              >
                <h3>{company.title}</h3>
                <p>{company.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="setup-actions">
        {step > 1 ? (
          <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
            <ArrowLeft size={18} /> Back
          </button>
        ) : <div></div>}
        
        <button 
          className="btn btn-primary" 
          onClick={handleNext}
          disabled={
            (step === 1 && !setupData.type) || 
            (step === 2 && !setupData.personality)
          }
        >
          {step === 3 ? (
            <>Start Interview <Play size={18} /></>
          ) : (
            <>Next Step <ArrowRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
}
