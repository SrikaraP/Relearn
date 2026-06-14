import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Moon, Sun, GraduationCap, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <GraduationCap size={28} className="logo-icon" />
          <span className="gradient-text logo-text">Relearn</span>
        </Link>
        
        <ul className="nav-links">
          {user ? (
            <li><Link to={`/dashboard/${user.role}`}>Dashboard</Link></li>
          ) : (
            <>
              <li><Link to="/portal/student">Student</Link></li>
              <li><Link to="/portal/teacher">Teacher</Link></li>
              <li><Link to="/portal/parent">Parent</Link></li>
            </>
          )}
        </ul>

        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{user.username}</span>
              <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn btn-primary">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
