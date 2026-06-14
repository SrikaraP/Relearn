import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Bell, Check, X, TrendingUp, Target, Heart, BookOpen, Clock, Activity, Calendar } from 'lucide-react';

const ParentOverviewTab = () => {
  const { user, respondToRequest, getLinkedUsers } = useAuth();
  const [selectedChild, setSelectedChild] = useState(null);

  const linkedChildren = getLinkedUsers();
  const pendingRequests = user?.incomingRequests || [];

  return (
    <div className="parent-overview animate-fade-in">
      <div className="tab-header mb-5">
        <h2 className="dashboard-title">Family Overview</h2>
        <p className="subtitle">Understand your child's progress, wellbeing, and next steps.</p>
      </div>

      {/* Requests Panel */}
      {pendingRequests.length > 0 && (
        <div className="dashboard-card glass-panel mb-5" style={{ border: '1px solid var(--warning)' }}>
          <div className="card-header flex-align mb-4">
            <Bell size={24} className="mr-2" style={{ color: 'var(--warning)' }} />
            <h3 className="mb-0">Pending Link Requests</h3>
          </div>
          <div className="material-list">
            {pendingRequests.map(req => (
              <div key={req.fromId} className="result-card glass-panel flex-between p-4 mb-3" style={{ margin: 0 }}>
                <div>
                  <h4 style={{ margin: 0 }}>{req.fromUsername}</h4>
                  <span className="text-sm text-secondary">{req.email} • {req.profile?.grade || 'Student'} • {req.profile?.curriculum || ''}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline hover-lift" style={{ color: 'var(--success)', borderColor: 'var(--success)', padding: '0.5rem 1rem' }} onClick={() => respondToRequest(req.fromId, true)}>
                    <Check size={18} className="mr-1" /> Accept
                  </button>
                  <button className="btn btn-outline hover-lift" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.5rem 1rem' }} onClick={() => respondToRequest(req.fromId, false)}>
                    <X size={18} className="mr-1" /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content: Overview without heavy sidebar */}
      <div className="parent-dashboard-content flex-col gap-5">
        
        {/* Top: Select Child */}
        <div className="child-selector glass-panel flex-align p-4" style={{ borderRadius: '16px' }}>
          <Users size={20} className="mr-3 text-primary" />
          <h3 className="mb-0 mr-4" style={{ fontSize: '1.1rem' }}>Viewing:</h3>
          
          {linkedChildren.length === 0 ? (
            <span className="text-secondary text-sm">No children linked yet.</span>
          ) : (
            <div className="flex-align gap-2">
              {linkedChildren.map(child => (
                <button 
                  key={child.id} 
                  className={`btn ${selectedChild?.id === child.id ? 'btn-primary' : 'btn-outline'} btn-sm`}
                  onClick={() => setSelectedChild(child)} 
                  style={{ borderRadius: '20px' }}
                >
                  {child.username}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Child Content */}
        {selectedChild ? (
          <div className="roster-analytics flex-col gap-5 animate-fade-in">
            {/* Top Snapshot row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              <div className="glass-panel p-5 text-center" style={{ borderRadius: '16px', border: 'none', background: 'var(--bg-secondary)' }}>
                <div className="text-4xl font-bold mb-2 text-primary">12</div>
                <div className="text-sm text-secondary font-medium uppercase tracking-wide">Tasks Done</div>
              </div>
              <div className="glass-panel p-5 text-center" style={{ borderRadius: '16px', border: 'none', background: 'var(--bg-secondary)' }}>
                <div className="text-4xl font-bold mb-2 text-accent">5</div>
                <div className="text-sm text-secondary font-medium uppercase tracking-wide">Study Sessions</div>
              </div>
              <div className="glass-panel p-5 text-center" style={{ borderRadius: '16px', border: 'none', background: 'var(--bg-secondary)' }}>
                <div className="text-4xl font-bold mb-2 text-success">3</div>
                <div className="text-sm text-secondary font-medium uppercase tracking-wide">Notes Uploaded</div>
              </div>
              <div className="glass-panel p-5 text-center" style={{ borderRadius: '16px', border: 'none', background: 'var(--bg-secondary)' }}>
                <div className="text-4xl font-bold mb-2 text-warning">4</div>
                <div className="text-sm text-secondary font-medium uppercase tracking-wide">Day Streak</div>
              </div>
            </div>

              {/* Insights & Wellbeing Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                
                {/* AI Parent Insights */}
                <div className="flex-col gap-4">
                  <div className="glass-panel p-5" style={{ borderRadius: '16px', border: 'none', background: 'var(--bg-secondary)' }}>
                    <div className="flex-align mb-4">
                      <TrendingUp size={20} className="mr-2 text-primary" />
                      <h3 className="mb-0">Weekly AI Insights</h3>
                    </div>
                    <div className="flex-col gap-3">
                      <div className="flex-align" style={{ alignItems: 'flex-start' }}>
                        <Check size={18} className="mr-3 text-success" style={{ marginTop: '3px' }}/>
                        <p className="mb-0 text-sm text-secondary">{selectedChild.username} has shown consistent progress in Science this week.</p>
                      </div>
                      <div className="flex-align" style={{ alignItems: 'flex-start' }}>
                        <TrendingUp size={18} className="mr-3 text-primary" style={{ marginTop: '3px' }}/>
                        <p className="mb-0 text-sm text-secondary">Mathematics practice activity has increased compared to last week.</p>
                      </div>
                      <div className="flex-align" style={{ alignItems: 'flex-start' }}>
                        <Calendar size={18} className="mr-3 text-warning" style={{ marginTop: '3px' }}/>
                        <p className="mb-0 text-sm text-secondary">An important assignment deadline is approaching on Friday.</p>
                      </div>
                    </div>
                  </div>

                  {/* Connected Teachers */}
                  <div className="glass-panel p-5" style={{ borderRadius: '16px', border: 'none', background: 'var(--bg-secondary)' }}>
                    <div className="flex-align mb-3">
                      <BookOpen size={20} className="mr-2 text-accent" />
                      <h3 className="mb-0">Connected Teachers</h3>
                    </div>
                    <p className="text-sm text-secondary mb-0">No active teacher announcements. You can view assignment grades in the Assessment Reports section when they become available.</p>
                  </div>
                </div>

                {/* Wellbeing & Activity */}
                <div className="glass-panel p-5" style={{ borderRadius: '16px', border: 'none', background: 'var(--bg-secondary)' }}>
                  <div className="flex-align mb-4">
                    <Heart size={20} className="mr-2 text-danger" />
                    <h3 className="mb-0">Wellbeing Indicators</h3>
                  </div>
                  
                  <div className="mb-5">
                    <div className="flex-between mb-2">
                      <span className="text-sm font-semibold">Study Consistency</span>
                      <span className="text-sm text-success">Balanced</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px' }}>
                      <div style={{ height: '100%', width: '70%', background: 'var(--success)', borderRadius: '3px' }}></div>
                    </div>
                    <p className="text-xs text-secondary mt-2">Study hours are well-distributed throughout the week.</p>
                  </div>

                  <div>
                    <div className="flex-between mb-2">
                      <span className="text-sm font-semibold">Workload Level</span>
                      <span className="text-sm text-warning">Moderate</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px' }}>
                      <div style={{ height: '100%', width: '55%', background: 'var(--warning)', borderRadius: '3px' }}></div>
                    </div>
                    <p className="text-xs text-secondary mt-2">Active on multiple projects, but not currently overwhelmed.</p>
                  </div>
                </div>

              </div>

            </div>
        ) : (
          <div className="flex-align text-secondary glass-panel p-5" style={{ minHeight: '300px', justifyContent: 'center', flexDirection: 'column', borderRadius: '16px' }}>
            <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Select a child to view insights.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentOverviewTab;
