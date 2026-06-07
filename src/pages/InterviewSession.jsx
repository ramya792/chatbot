import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Mic, MicOff, Volume2, VolumeX, Bot } from 'lucide-react';
import { generateAIResponse, generateReport } from '../utils/ai';
import { useAuth } from '../context/AuthContext';
import './InterviewSession.css';

export default function InterviewSession() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const setupData = location.state?.setupData;

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [interimResult, setInterimResult] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  const handleScroll = () => {
    const chatArea = document.querySelector('.chat-area');
    if (!chatArea) return;
    
    if (document.activeElement === textareaRef.current) {
      // When typing, try to keep the latest AI question visible
      const aiMessages = document.querySelectorAll('.message.ai');
      if (aiMessages.length > 0) {
        const lastAiMessage = aiMessages[aiMessages.length - 1];
        // Calculate the relative position instead of using scrollIntoView
        chatArea.scrollTo({
          top: lastAiMessage.offsetTop - 20, // 20px padding
          behavior: 'smooth'
        });
        return;
      }
    }
    // Default: scroll to the very bottom safely
    chatArea.scrollTo({
      top: chatArea.scrollHeight,
      behavior: 'smooth'
    });
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
    handleScroll();
  };

  const getVoices = () => {
    return new Promise((resolve) => {
      let voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        resolve(voices);
        return;
      }
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      };
    });
  };

  // Ensure user has setup data
  useEffect(() => {
    if (!setupData) {
      navigate('/setup');
      return;
    }
    
    // Prevent background scrolling on mobile to keep fixed layout stable
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [setupData, navigate]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setStatusMessage('Listening...');
      };

      recognition.onsoundend = () => {
        setStatusMessage('Processing...');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript.trim()) {
          setInputValue(prev => {
            const newValue = prev + (prev.trim() ? ' ' : '') + finalTranscript.trim();
            setTimeout(adjustTextareaHeight, 0); 
            return newValue;
          });
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        if (event.error !== 'no-speech') {
           setStatusMessage('');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        setStatusMessage('');
      };

      recognitionRef.current = recognition;
    }

    // Start interview by triggering the AI to introduce itself
    startInterview();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    handleScroll();
  }, [messages, isTyping]);

  const startInterview = async () => {
    setIsTyping(true);
    setStatusMessage('Generating response...');
    // Initial empty message list will cause AI to greet based on system prompt
    const initialGreeting = await generateAIResponse([], setupData);
    const newMsg = { role: 'ai', content: initialGreeting };
    setMessages([newMsg]);
    setIsTyping(false);
    setStatusMessage('');
    console.log("AI response generated");
    speak(initialGreeting, false); // auto-play
  };

  const speak = async (text, isManual = false) => {
    if (!('speechSynthesis' in window)) {
      console.error("Speech synthesis is not supported in this browser.");
      return;
    }

    // If it's an automatic speak and sound is disabled, do nothing
    if (!isManual && !soundEnabled) return;

    // Clean text for speech (remove markdown asterisks and code block markers)
    const cleanText = text.replace(/[*#`]/g, '').replace(/\[INTERVIEW_COMPLETE\]/g, '');
    if (!cleanText.trim()) return;

    window.speechSynthesis.cancel(); // Stop current speaking
    console.log("Speech synthesis started");
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(cleanText);

    try {
      const voices = await getVoices();
      if (voices.length > 0) {
        // Try to find a good English voice, fallback to first available
        const engVoice = voices.find(v => v.lang.startsWith('en-') && v.name.includes('Google'))
          || voices.find(v => v.lang.startsWith('en-'))
          || voices[0];
        if (engVoice) utterance.voice = engVoice;
      }
    } catch (e) {
      console.error("Error setting voice", e);
    }

    utterance.onend = () => {
      console.log("Speech synthesis completed");
      setIsSpeaking(false);
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleSound = () => {
    if (soundEnabled) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSoundEnabled(false);
    } else {
      setSoundEnabled(true);
      const lastAiMsg = [...messages].reverse().find(m => m.role === 'ai');
      if (lastAiMsg) {
        speak(lastAiMsg.content, true); // manual play ignores soundEnabled
      }
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    if (isRecording) {
      toggleRecording();
    }

    const userMessage = { role: 'user', content: inputValue.trim() };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
    }
    setIsTyping(true);
    setStatusMessage('Generating response...');

    try {
      const aiResponseContent = await generateAIResponse(updatedMessages, setupData);

      const aiMsg = { role: 'ai', content: aiResponseContent };
      const newMessages = [...updatedMessages, aiMsg];
      setMessages(newMessages);
      console.log("AI response generated");

      speak(aiResponseContent, false); // auto-play

      // Check for interview completion flag
      if (aiResponseContent.includes('[INTERVIEW_COMPLETE]')) {
        handleEndInterview(newMessages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
      setStatusMessage('');
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setStatusMessage('');
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Failed to start recognition:", e);
      }
    }
  };

  const handleEndInterview = async (finalMessages) => {
    try {
      const report = await generateReport(finalMessages);

      // Add metadata
      report.type = setupData.type;
      report.personality = setupData.personality;
      report.date = new Date().toISOString();

      // Save to local storage
      const historyStr = localStorage.getItem(`interviewVerse_history_${currentUser.id}`) || '[]';
      const history = JSON.parse(historyStr);
      history.push(report);
      localStorage.setItem(`interviewVerse_history_${currentUser.id}`, JSON.stringify(history));

      // Navigate to report using the index as ID
      navigate(`/report/${history.length - 1}`);
    } catch (err) {
      alert("Failed to generate report. Ending session.");
      navigate('/dashboard');
    }
  };

  const renderMessageContent = (content) => {
    // Simple parser for basic visual learning elements (code blocks to pre tags)
    // In a real app we'd use react-markdown
    const cleanContent = content.replace('\\[INTERVIEW_COMPLETE\\]', '');
    return <div dangerouslySetInnerHTML={{ __html: cleanContent.replace(/```([\s\S]*?)```/g, '<pre>$1</pre>').replace(/\n/g, '<br/>') }} />;
  };

  if (!setupData) return null;

  return (
    <div className="session-container animate-fade-in" ref={containerRef}>
      <div className="session-header">
        <div className="session-meta">
          <h2><Bot size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
            {setupData.company.charAt(0).toUpperCase() + setupData.company.slice(1)} - {setupData.type.toUpperCase()}
          </h2>
          <p>Interviewer: {setupData.personality}</p>
        </div>
        <div className="session-controls">
          <button
            className={`btn btn-secondary ${!soundEnabled ? 'active' : ''}`}
            style={{ padding: '8px' }}
            onClick={handleToggleSound}
            title={soundEnabled ? "Mute and stop speaking" : "Unmute and read aloud"}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} color="red" />}
          </button>
          <button
            className="btn btn-primary"
            style={{ marginLeft: '12px' }}
            onClick={() => handleEndInterview(messages)}
          >
            End Interview
          </button>
        </div>
      </div>

      <div className="chat-area">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">
              {renderMessageContent(msg.content)}
            </div>
            <div className="message-meta">
              {msg.role === 'ai' ? 'AI Interviewer' : 'You'}
            </div>
          </div>
        ))}


        {(isTyping || statusMessage) && (
          <div className="status-indicator">
            {isTyping ? (
              <div className="typing-indicator" style={{ marginBottom: '10px' }}>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            ) : null}
            {statusMessage && <div className="status-text">{statusMessage}</div>}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="input-area">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Type your answer here or use the microphone..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            adjustTextareaHeight();
          }}
          onFocus={() => {
            setTimeout(() => {
              window.scrollTo(0, 0);
              handleScroll();
            }, 300);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          style={{ minHeight: '48px' }}
        />
        <div className="input-actions">
          <button
            className={`btn-icon btn-voice ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
            disabled={statusMessage === 'Processing...'}
            title={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <button
            className="btn-icon btn-send"
            onClick={handleSend}
            disabled={!inputValue.trim() && !isRecording}
            title="Send answer"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
