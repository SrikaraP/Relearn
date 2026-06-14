import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, ArrowLeft, CheckCircle, Search } from 'lucide-react';
import './StudentOnboarding.css';

const OPTIONS = {
  curriculum: ['IB', 'A-Levels', 'AP', 'CBSE', 'ICSE', 'State Board', 'National Curriculum'],
  grades: ['8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade', 'University Year 1'],
  subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Literature', 'History', 'Economics', 'Business', 'Art', 'Psychology'],
  interests: ['Coding', 'Robotics', 'Debate', 'Creative Writing', 'Sports', 'Music', 'Theater', 'Volunteering', 'Entrepreneurship', 'Research'],
  strengths: ['Analytical Thinking', 'Memory', 'Essay Writing', 'Public Speaking', 'Problem Solving', 'Creativity', 'Leadership'],
  weaknesses: ['Time Management', 'Test Anxiety', 'Math Concepts', 'Memorization', 'Procrastination', 'Public Speaking'],
  careers: ['Software Engineer', 'Doctor', 'Investment Banker', 'Lawyer', 'Data Scientist', 'Entrepreneur', 'Designer', 'Architect', 'Researcher'],
  universities: ['MIT', 'Harvard', 'Stanford', 'Oxford', 'Cambridge', 'NUS', 'Imperial College', 'UCL', 'Ivy League (Any)'],
  learningStyles: ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing']
};

const ChipSelect = ({ options, selected, onChange, multi = true }) => {
  const toggle = (opt) => {
    if (multi) {
      if (selected.includes(opt)) onChange(selected.filter(o => o !== opt));
      else onChange([...selected, opt]);
    } else {
      onChange(opt);
    }
  };

  return (
    <div className="chip-container">
      {options.map(opt => {
        const isSelected = multi ? selected.includes(opt) : selected === opt;
        return (
          <button 
            key={opt} 
            className={`chip ${isSelected ? 'active' : ''}`}
            onClick={() => toggle(opt)}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
};

const StudentOnboarding = () => {
  const { user, updateProfile, getAllTeachers, getAllParents, sendLinkRequest } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Profile State
  const [profile, setProfile] = useState({
    curriculum: '',
    grade: '',
    subjects: [],
    learningStyles: [],
    strengths: [],
    weaknesses: [],
    interests: [],
    careers: [],
    universities: []
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [connectionMsg, setConnectionMsg] = useState('');

  const updateField = (field, val) => {
    setProfile(prev => ({ ...prev, [field]: val }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSearchUser = (role) => {
    const pool = role === 'teacher' ? getAllTeachers() : getAllParents();
    const query = searchQuery.trim().toLowerCase();
    const found = pool.find(u => u.username.toLowerCase() === query);
    setSearchResult(found || 'NOT_FOUND');
    setConnectionMsg('');
  };

  const handleSendRequest = () => {
    if (searchResult && searchResult !== 'NOT_FOUND') {
      const res = sendLinkRequest(searchResult.username);
      setConnectionMsg(res.message);
      if (res.success) {
        setSearchResult(null);
        setSearchQuery('');
      }
    }
  };

  const handleFinish = async () => {
    updateProfile(profile);
    navigate('/dashboard/student'); // Base layout will redirect appropriately
  };

  if (!user || user.role !== 'student') {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="onboarding-page animate-fade-in">
      <div className="onboarding-card glass-panel">
        
        <div className="step-progress-bar">
          <div className="progress-fill" style={{ width: `${(step / 6) * 100}%` }}></div>
        </div>

        {step === 1 && (
          <div className="step-content animate-fade-in">
            <h2>Academic Foundation</h2>
            <p className="subtitle">Let's establish your baseline to tailor your learning materials.</p>
            
            <div className="form-group">
              <label>Curriculum</label>
              <ChipSelect options={OPTIONS.curriculum} selected={profile.curriculum} onChange={v => updateField('curriculum', v)} multi={false} />
            </div>

            <div className="form-group">
              <label>Current Grade</label>
              <ChipSelect options={OPTIONS.grades} selected={profile.grade} onChange={v => updateField('grade', v)} multi={false} />
            </div>

            <div className="form-group">
              <label>Key Subjects (Select up to 4)</label>
              <ChipSelect options={OPTIONS.subjects} selected={profile.subjects} onChange={v => { if(v.length <= 4) updateField('subjects', v); }} />
            </div>

            <div className="form-actions right">
              <button className="btn btn-primary" onClick={handleNext} disabled={!profile.curriculum || !profile.grade || profile.subjects.length === 0}>Next <ArrowRight size={18}/></button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content animate-fade-in">
            <h2>Learning DNA</h2>
            <p className="subtitle">How do you learn best? We'll adapt your AI coach to your style.</p>
            
            <div className="form-group">
              <label>Preferred Learning Style</label>
              <ChipSelect options={OPTIONS.learningStyles} selected={profile.learningStyles} onChange={v => updateField('learningStyles', v)} />
            </div>

            <div className="form-group">
              <label>Academic Strengths</label>
              <ChipSelect options={OPTIONS.strengths} selected={profile.strengths} onChange={v => updateField('strengths', v)} />
            </div>

            <div className="form-group">
              <label>Areas for Improvement (Weaknesses)</label>
              <ChipSelect options={OPTIONS.weaknesses} selected={profile.weaknesses} onChange={v => updateField('weaknesses', v)} />
            </div>

            <div className="form-actions space-between">
              <button className="btn btn-outline" onClick={handleBack}><ArrowLeft size={18}/> Back</button>
              <button className="btn btn-primary" onClick={handleNext} disabled={profile.learningStyles.length === 0 || profile.strengths.length === 0 || profile.weaknesses.length === 0}>Next <ArrowRight size={18}/></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content animate-fade-in">
            <h2>Interests & Extracurriculars</h2>
            <p className="subtitle">Universities look beyond grades. What drives you?</p>
            
            <div className="form-group">
              <label>Hobbies & Interests</label>
              <ChipSelect options={OPTIONS.interests} selected={profile.interests} onChange={v => updateField('interests', v)} />
            </div>

            <div className="form-actions space-between">
              <button className="btn btn-outline" onClick={handleBack}><ArrowLeft size={18}/> Back</button>
              <button className="btn btn-primary" onClick={handleNext} disabled={profile.interests.length === 0}>Next <ArrowRight size={18}/></button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-content animate-fade-in">
            <h2>Future Trajectory</h2>
            <p className="subtitle">Define your targets. Your dynamic roadmap will be built to get you here.</p>
            
            <div className="form-group">
              <label>Dream Careers</label>
              <ChipSelect options={OPTIONS.careers} selected={profile.careers} onChange={v => updateField('careers', v)} />
            </div>

            <div className="form-group">
              <label>Dream Universities</label>
              <ChipSelect options={OPTIONS.universities} selected={profile.universities} onChange={v => updateField('universities', v)} />
            </div>

            <div className="form-actions space-between">
              <button className="btn btn-outline" onClick={handleBack}><ArrowLeft size={18}/> Back</button>
              <button className="btn btn-primary" onClick={handleNext} disabled={profile.careers.length === 0 || profile.universities.length === 0}>Next <ArrowRight size={18}/></button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="step-content animate-fade-in">
            <h2>Connect Your Teachers</h2>
            <p className="subtitle">Link your account to your teachers so they can share resources, send assignments, and track your progress.</p>
            
            <div className="form-group glass-panel p-4" style={{ marginBottom: '2rem' }}>
              <label>Search Teacher by Username</label>
              <div className="flex-align gap-2" style={{ marginTop: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. mr_smith_science"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSearchResult(null); setConnectionMsg(''); }}
                />
                <button className="btn btn-primary" onClick={() => handleSearchUser('teacher')}><Search size={18}/> Search</button>
              </div>

              {searchResult === 'NOT_FOUND' && (
                <p className="text-danger mt-3 mb-0" style={{ fontSize: '0.9rem' }}>No teacher found with that username.</p>
              )}

              {searchResult && searchResult !== 'NOT_FOUND' && (
                <div className="glass-panel-alt p-3 mt-3 flex-between">
                  <div>
                    <h4 className="mb-1">{searchResult.username}</h4>
                    <p className="text-sm text-secondary mb-0">{searchResult.email}</p>
                  </div>
                  <button className="btn btn-success" onClick={handleSendRequest}>Send Request</button>
                </div>
              )}

              {connectionMsg && (
                <p className={`mt-3 mb-0 text-sm ${connectionMsg.includes('success') || connectionMsg.includes('sent') ? 'text-success' : 'text-danger'}`}>
                  {connectionMsg}
                </p>
              )}

              {/* Show pending or linked status just generically */}
              {(user?.outgoingRequests?.length > 0 || user?.linkedIds?.length > 0) && (
                <div className="mt-4 p-3 glass-panel-alt text-success flex-align">
                  <CheckCircle size={18} className="mr-2" />
                  <span className="text-sm">
                    Connection successfully requested or established! You may proceed.
                  </span>
                </div>
              )}
            </div>

            <div className="form-actions space-between">
              <button className="btn btn-outline" onClick={handleBack}><ArrowLeft size={18}/> Back</button>
              <button className="btn btn-primary" onClick={() => { setSearchQuery(''); setSearchResult(null); setConnectionMsg(''); handleNext(); }}>Next <ArrowRight size={18}/></button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="step-content animate-fade-in">
            <h2>Connect Your Parent/Guardian</h2>
            <p className="subtitle">Link your account to your parent so they can view your roadmap, see your achievements, and offer support.</p>
            
            <div className="form-group glass-panel p-4" style={{ marginBottom: '2rem' }}>
              <label>Search Parent by Username</label>
              <div className="flex-align gap-2" style={{ marginTop: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. janesmith_parent"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSearchResult(null); setConnectionMsg(''); }}
                />
                <button className="btn btn-primary" onClick={() => handleSearchUser('parent')}><Search size={18}/> Search</button>
              </div>

              {searchResult === 'NOT_FOUND' && (
                <p className="text-danger mt-3 mb-0" style={{ fontSize: '0.9rem' }}>No parent found with that username.</p>
              )}

              {searchResult && searchResult !== 'NOT_FOUND' && (
                <div className="glass-panel-alt p-3 mt-3 flex-between">
                  <div>
                    <h4 className="mb-1">{searchResult.username}</h4>
                    <p className="text-sm text-secondary mb-0">{searchResult.email}</p>
                  </div>
                  <button className="btn btn-success" onClick={handleSendRequest}>Send Request</button>
                </div>
              )}

              {connectionMsg && (
                <p className={`mt-3 mb-0 text-sm ${connectionMsg.includes('success') || connectionMsg.includes('sent') ? 'text-success' : 'text-danger'}`}>
                  {connectionMsg}
                </p>
              )}
              
              {(user?.outgoingRequests?.length > 0 || user?.linkedIds?.length > 0) && (
                <div className="mt-4 p-3 glass-panel-alt text-success flex-align">
                  <CheckCircle size={18} className="mr-2" />
                  <span className="text-sm">
                    {user?.linkedIds?.length > 0 ? 'Parent successfully linked!' : 'Parent request is pending approval.'} You may now proceed.
                  </span>
                </div>
              )}
            </div>

            <div className="form-actions space-between">
              <button className="btn btn-outline" onClick={handleBack}><ArrowLeft size={18}/> Back</button>
              <button 
                className="btn btn-primary" 
                onClick={handleFinish}
                disabled={user?.linkedIds?.length === 0 && (!user?.outgoingRequests || user.outgoingRequests.length === 0)}
              >
                <CheckCircle size={18}/> Generate My OS
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentOnboarding;
