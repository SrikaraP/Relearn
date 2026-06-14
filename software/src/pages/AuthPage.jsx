import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';
import './AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    let result;
    if (isLogin) {
      result = login(email, password);
    } else {
      if (!username || !email || !password) {
        setError('Please fill in all fields.');
        return;
      }
      result = register(role, username, email, password);
    }

    if (result.success) {
      // Navigate to the correct dashboard based on role
      // Since login doesn't return role directly, we rely on protected routes handling redirection,
      // or we can redirect to a generic /dashboard and let the ProtectedRoute handle it.
      navigate('/dashboard'); 
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page container animate-fade-in">
      <div className="auth-card glass-panel">
        <h2 className="auth-title">
          {isLogin ? 'Welcome Back' : 'Join '}
          {!isLogin && <span className="gradient-text-animated">Relearn</span>}
        </h2>
        <p className="auth-subtitle">
          {isLogin ? 'Sign in to access your dashboard.' : 'Create an account to start your journey.'}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>I am a...</label>
              <div className="role-selector">
                <button 
                  type="button" 
                  className={`role-btn ${role === 'student' ? 'active' : ''}`}
                  onClick={() => setRole('student')}
                >Student</button>
                <button 
                  type="button" 
                  className={`role-btn ${role === 'teacher' ? 'active' : ''}`}
                  onClick={() => setRole('teacher')}
                >Teacher</button>
                <button 
                  type="button" 
                  className={`role-btn ${role === 'parent' ? 'active' : ''}`}
                  onClick={() => setRole('parent')}
                >Parent</button>
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                className="form-control" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a unique username"
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit">
            {isLogin ? <><LogIn size={18} /> Sign In</> : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button className="toggle-btn gradient-text" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
