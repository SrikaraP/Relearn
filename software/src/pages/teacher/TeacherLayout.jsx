import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Users, FileText, Search, FileSignature, Bot, Settings } from 'lucide-react';
import TeacherOverviewTab from './TeacherOverviewTab';
import AssessmentAnalyzerTab from './AssessmentAnalyzerTab';
import TeacherAssistantTab from './TeacherAssistantTab';
import './TeacherLayout.css';

const TeacherLayout = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="teacher-layout container animate-fade-in">
      {/* Premium Sidebar */}
      <aside className="teacher-sidebar glass-panel">
        <div className="sidebar-profile">
          <div className="profile-avatar bg-primary text-white"><Users size={24}/></div>
          <div className="profile-info">
            <h3 className="mb-0">{user?.username || 'Educator'}</h3>
            <p className="gradient-text mb-0">Teacher Portal</p>
          </div>
        </div>

        <nav className="sidebar-nav-clean mt-4">
          <button 
            className={`nav-btn hover-lift ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </button>
          
          <button 
            className={`nav-btn hover-lift ${activeTab === 'assessment' ? 'active' : ''}`}
            onClick={() => setActiveTab('assessment')}
          >
            <FileSignature size={20} />
            <span>AI Assessment</span>
          </button>

          <button 
            className={`nav-btn hover-lift ${activeTab === 'assistant' ? 'active' : ''}`}
            onClick={() => setActiveTab('assistant')}
          >
            <Bot size={20} />
            <span>Teacher Coach <span className="badge-beta">Beta</span></span>
          </button>

          <button className="nav-btn hover-lift mt-auto">
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="teacher-main-content">
        {activeTab === 'overview' && <TeacherOverviewTab />}
        {activeTab === 'assessment' && <AssessmentAnalyzerTab />}
        {activeTab === 'assistant' && <TeacherAssistantTab />}
      </main>
    </div>
  );
};

export default TeacherLayout;
