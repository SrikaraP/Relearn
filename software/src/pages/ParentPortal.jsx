import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, LineChart, Target } from 'lucide-react';
import './PortalMarketing.css';

const ParentPortalMarketing = () => {
  return (
    <div className="portal-marketing container animate-fade-in">
      <div className="portal-header text-center">
        <div className="badge glass-panel">Parent Portal</div>
        <h1 className="portal-title">Clear <span className="gradient-text-animated">Guidance</span></h1>
        <p className="portal-subtitle">Stop feeling overwhelmed by educational choices. Link your children's accounts to get clear, actionable guidance on extracurriculars, career paths, and universities.</p>
        <Link to="/auth" className="btn btn-primary btn-large mt-4">
          Sign Up as Parent <ArrowRight size={20} />
        </Link>
      </div>

      <div className="portal-features grid-3">
        <div className="portal-feature-card glass-panel">
          <LineChart className="feature-icon gradient-text" size={32} />
          <h3>"Is my child on track?"</h3>
          <p>Get simple, high-level progress reports without sifting through overwhelming statistics.</p>
        </div>
        <div className="portal-feature-card glass-panel">
          <Target className="feature-icon gradient-text" size={32} />
          <h3>Actionable Next Steps</h3>
          <p>Receive concrete recommendations like "AP Physics Prep Book recommended for Fall".</p>
        </div>
        <div className="portal-feature-card glass-panel">
          <Compass className="feature-icon gradient-text" size={32} />
          <h3>Career & University Guidance</h3>
          <p>Explore curated career paths based on your child's assessed strengths and interests.</p>
        </div>
      </div>
    </div>
  );
};

export default ParentPortalMarketing;
