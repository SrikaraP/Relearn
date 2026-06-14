import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Compass, FileText, Award, MessageCircle, Settings, Home } from 'lucide-react';
import ParentOverviewTab from './ParentOverviewTab';
import RoadmapVisibilityTab from './RoadmapVisibilityTab';
import ParentAchievementsTab from './ParentAchievementsTab';
import SupportCommunicationTab from './SupportCommunicationTab';
import './ParentLayout.css';

const ParentLayout = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="parent-layout">
      {/* Sidebar Navigation */}
      <aside className="parent-sidebar glass-panel">
        <div className="sidebar-header">
          <div className="avatar bg-accent-light text-accent">
            {user?.username?.charAt(0).toUpperCase() || 'P'}
          </div>
          <div className="user-info">
            <h3>{user?.username}</h3>
            <span>Parent Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-btn hover-lift ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Home size={20} />
            <span>Overview & Insights</span>
          </button>

          <button 
            className={`nav-btn hover-lift ${activeTab === 'roadmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('roadmap')}
          >
            <Compass size={20} />
            <span>Academic Roadmap</span>
          </button>
          
          <button 
            className={`nav-btn hover-lift ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            <Award size={20} />
            <span>Achievements</span>
          </button>

          <button 
            className={`nav-btn hover-lift ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            <MessageCircle size={20} />
            <span>Support & Comm</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-btn">
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="parent-main-content">
        {activeTab === 'overview' && <ParentOverviewTab />}
        {activeTab === 'roadmap' && <RoadmapVisibilityTab />}
        {activeTab === 'achievements' && <ParentAchievementsTab />}
        {activeTab === 'support' && <SupportCommunicationTab />}
      </main>
    </div>
  );
};

export default ParentLayout;
