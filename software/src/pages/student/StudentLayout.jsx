import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Calendar, Compass, User, Settings, Bot, MessageCircle } from 'lucide-react';
import LearningTab from './LearningTab';
import PlanningTab from './PlanningTab';
import DiscoveryTab from './DiscoveryTab';
import SettingsTab from './SettingsTab';
import AICoachTab from './AICoachTab';
import MessagesTab from './MessagesTab';
import './StudentLayout.css';

const StudentLayout = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('learning');

  return (
    <div className="student-layout container animate-fade-in">
      {/* Clean, minimal sidebar */}
      <aside className="student-sidebar glass-panel">
        <div className="sidebar-profile">
          <div className="profile-avatar"><User size={24}/></div>
          <div className="profile-info">
            <h3>{user?.username}</h3>
            <p className="gradient-text">{user?.profile?.grade || 'Student'}</p>
          </div>
        </div>

        <nav className="sidebar-nav-clean">
          <button 
            className={`nav-btn hover-lift ${activeCategory === 'learning' ? 'active' : ''}`}
            onClick={() => setActiveCategory('learning')}
          >
            <BookOpen size={20} />
            <span>Learning</span>
          </button>
          <button 
            className={`nav-btn hover-lift ${activeCategory === 'planning' ? 'active' : ''}`}
            onClick={() => setActiveCategory('planning')}
          >
            <Calendar size={20} />
            <span>Planning <span className="badge-beta">Beta</span></span>
          </button>
          <button 
            className={`nav-btn hover-lift ${activeCategory === 'discovery' ? 'active' : ''}`}
            onClick={() => setActiveCategory('discovery')}
          >
            <Compass size={20} />
            <span>Discovery <span className="badge-beta">Beta</span></span>
          </button>
          <button 
            className={`nav-btn hover-lift ${activeCategory === 'coach' ? 'active' : ''}`}
            onClick={() => setActiveCategory('coach')}
          >
            <Bot size={20} />
            <span>AI Coach <span className="badge-beta">Beta</span></span>
          </button>
          <button 
            className={`nav-btn hover-lift ${activeCategory === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveCategory('settings')}
            style={{ marginTop: 'auto' }}
          >
            <Settings size={20} />
            <span>AI Settings</span>
          </button>
          <button 
            className={`nav-btn hover-lift ${activeCategory === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveCategory('messages')}
          >
            <div style={{ position: 'relative' }}>
              <MessageCircle size={20} />
              {user?.supportMessages?.length > 0 && <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--danger)', borderRadius: '50%' }}></span>}
            </div>
            <span>Inbox</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={`student-main-content ${activeCategory === 'coach' ? 'coach-active' : ''}`}>
        {activeCategory === 'learning' && <LearningTab />}
        {activeCategory === 'planning' && <PlanningTab />}
        {activeCategory === 'discovery' && <DiscoveryTab />}
        {activeCategory === 'coach' && <AICoachTab user={user} />}
        {activeCategory === 'messages' && <MessagesTab />}
        {activeCategory === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
};

export default StudentLayout;
