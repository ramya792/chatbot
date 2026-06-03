import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Brain, LogOut, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container container">
        <Link to="/" className="navbar-brand">
          <Brain className="brand-icon" size={28} />
          <span className="brand-text text-gradient">InterviewVerse AI</span>
        </Link>
        
        <div className="navbar-links">
          {currentUser ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/setup" className="nav-link">Practice</Link>
              <div className="user-menu">
                <span className="user-name">
                  <User size={16} /> {currentUser.name}
                </span>
                <button onClick={handleLogout} className="btn-logout" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
