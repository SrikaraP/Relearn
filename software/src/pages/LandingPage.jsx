import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Target, Upload, Compass, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section container">
        <div className="hero-content animate-fade-in text-center">
          <h1 className="hero-title">
            Stop Guessing. <br />
            Start <span className="gradient-text-animated">Achieving.</span>
          </h1>
          <p className="hero-subtitle">
            The modern education system is broken by choice overload. Relearn replaces confusion with absolute clarity by providing a personalized AI coach for students, deep analytics for teachers, and actionable guidance for parents.
          </p>
          <div className="hero-actions center">
            <Link to={user ? "/dashboard" : "/auth"} className="btn btn-primary btn-large">
              {user ? "Go to Dashboard" : "Start Your Journey"} <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem & Solution Section */}
      <section className="manifesto-section container animate-fade-in delay-200">
        <div className="manifesto-grid">
          <div className="manifesto-card glass-panel dark-panel">
            <h3>The Problem</h3>
            <p className="manifesto-text">
              More information, less guidance. Students are overwhelmed, guessing what to study and which opportunities matter. Parents are paralyzed by endless choices. Teachers spend hours grading instead of guiding.
            </p>
          </div>
          <div className="manifesto-card glass-panel light-panel">
            <h3 className="gradient-text-animated">The Solution</h3>
            <p className="manifesto-text">
              A single platform unifying personalized roadmaps, instant document analysis, and intelligent routing. We don't give you another dashboard of meaningless statistics—we tell you exactly what to do next.
            </p>
          </div>
        </div>
      </section>

      {/* Core Workflow */}
      <section className="workflow-section container animate-fade-in delay-300" style={{ marginTop: '8rem', marginBottom: '4rem' }}>
        <div className="workflow-steps">
          <div className="workflow-step">
            <div className="step-icon glass-panel"><Upload size={32} /></div>
            <h4>1. Upload Anything</h4>
            <p>Snap a photo of the whiteboard or upload past papers and messy notes.</p>
          </div>
          <div className="step-connector"></div>
          <div className="workflow-step">
            <div className="step-icon glass-panel"><BrainCircuit size={32} className="gradient-text" /></div>
            <h4>2. AI Processing</h4>
            <p>Our OS instantly converts raw data into tailored flashcards, summaries, and grading keys.</p>
          </div>
          <div className="step-connector"></div>
          <div className="workflow-step">
            <div className="step-icon glass-panel"><Target size={32} /></div>
            <h4>3. Execute</h4>
            <p>Follow your personalized, step-by-step roadmap to hit your target university or career.</p>
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section className="portals-preview container animate-fade-in delay-300" style={{ marginTop: '8rem' }}>
        <h2 className="section-title">Engineered For You</h2>
        
        <div className="portal-showcase glass-panel student-showcase">
          <div className="showcase-content">
            <h3>Student Intelligence</h3>
            <p>Your personal AI coach. Transform messy notes into interactive study materials in seconds. Navigate your future with a dynamic roadmap tailored to your exact strengths and dream career.</p>
            <ul className="clean-list">
              <li><CheckCircle size={18} className="check-icon"/> Interactive Flashcards & Quizzes</li>
              <li><CheckCircle size={18} className="check-icon"/> Context-Aware AI Chatbot</li>
              <li><CheckCircle size={18} className="check-icon"/> "What should I do next?" Engine</li>
            </ul>
            <Link to="/portal/student" className="btn btn-outline mt-4">Explore Student OS</Link>
          </div>
        </div>

        <div className="showcase-grid">
          <div className="portal-showcase glass-panel">
            <div className="showcase-content">
              <h3>Teacher Command</h3>
              <p>Automate the tedious work. Upload assessments to instantly map curriculum coverage and identify struggling students before it's too late.</p>
              <Link to="/portal/teacher" className="btn btn-outline mt-4">Explore Teacher OS</Link>
            </div>
          </div>
          <div className="portal-showcase glass-panel">
            <div className="showcase-content">
              <h3>Parent Guidance</h3>
              <p>Stop stressing over the right path. Get simple, high-level alerts on your child's progress and actionable next steps.</p>
              <Link to="/portal/parent" className="btn btn-outline mt-4">Explore Parent OS</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
