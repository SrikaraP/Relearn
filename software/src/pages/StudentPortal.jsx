import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, BrainCircuit, Target } from 'lucide-react';
import './PortalMarketing.css';

const StudentPortalMarketing = () => {
  return (
    <div className="portal-marketing container animate-fade-in">
      <div className="portal-header text-center">
        <div className="badge glass-panel">Student Portal</div>
        <h1 className="portal-title">Your Personal <span className="gradient-text-animated">AI Tutor</span></h1>
        <p className="portal-subtitle">Upload your notes, worksheets, and past papers to generate personalized study materials, chat with an AI tutor, and visualize your roadmap to success.</p>
        <Link to="/auth" className="btn btn-primary btn-large mt-4">
          Sign Up as Student <ArrowRight size={20} />
        </Link>
      </div>

      <div className="portal-features grid-3">
        <div className="portal-feature-card glass-panel">
          <BookOpen className="feature-icon gradient-text" size={32} />
          <h3>Study Materials on Demand</h3>
          <p>Turn any document into instant flashcards and summaries.</p>
        </div>
        <div className="portal-feature-card glass-panel">
          <BrainCircuit className="feature-icon gradient-text" size={32} />
          <h3>AI Chatbot</h3>
          <p>Stuck on a concept? Chat with our AI tutor to get instant explanations tailored to your learning style.</p>
        </div>
        <div className="portal-feature-card glass-panel">
          <Target className="feature-icon gradient-text" size={32} />
          <h3>Personalized Roadmaps</h3>
          <p>Track your progress toward your dream university or career path with step-by-step guidance.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentPortalMarketing;
