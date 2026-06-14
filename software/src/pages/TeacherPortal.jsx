import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart, Users, FileSignature } from 'lucide-react';
import './PortalMarketing.css';

const TeacherPortalMarketing = () => {
  return (
    <div className="portal-marketing container animate-fade-in">
      <div className="portal-header text-center">
        <div className="badge glass-panel">Teacher Portal</div>
        <h1 className="portal-title">The Ultimate <span className="gradient-text-animated">Teacher Assistant</span></h1>
        <p className="portal-subtitle">Upload assessments to instantly generate grading criteria, identify struggling students, and easily manage your classrooms all in one place.</p>
        <Link to="/auth" className="btn btn-primary btn-large mt-4">
          Sign Up as Teacher <ArrowRight size={20} />
        </Link>
      </div>

      <div className="portal-features grid-3">
        <div className="portal-feature-card glass-panel">
          <BarChart className="feature-icon gradient-text" size={32} />
          <h3>Instant Analytics</h3>
          <p>Get automated curriculum coverage and difficulty breakdowns for every paper you upload.</p>
        </div>
        <div className="portal-feature-card glass-panel">
          <Users className="feature-icon gradient-text" size={32} />
          <h3>Student Linking</h3>
          <p>Link your students directly to monitor their performance, roadmaps, and see exactly who needs help.</p>
        </div>
        <div className="portal-feature-card glass-panel">
          <FileSignature className="feature-icon gradient-text" size={32} />
          <h3>Generate Practice Papers</h3>
          <p>Create new practice tests automatically based on previous exams.</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherPortalMarketing;
