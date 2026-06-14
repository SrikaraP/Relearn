import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Bell, AlertCircle, Check, X, TrendingUp } from 'lucide-react';

const TeacherOverviewTab = () => {
  const { user, respondToRequest, getLinkedUsers } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState(null);

  const linkedStudents = getLinkedUsers();
  const pendingRequests = user?.incomingRequests || [];

  return (
    <div className="teacher-overview animate-fade-in">
      <div className="tab-header mb-5">
        <h2 className="dashboard-title">Teacher Command Center</h2>
        <p className="subtitle">Manage connection requests and analyze student performance.</p>
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
                  {req.profile?.subjects && req.profile.subjects.length > 0 && (
                    <div className="mt-2 flex-align gap-2">
                      {req.profile.subjects.map(sub => <span key={sub} className="badge badge-outline">{sub}</span>)}
                    </div>
                  )}
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

      {/* Student Roster & Analytics */}
      <div className="dashboard-card glass-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', padding: '0', overflow: 'hidden' }}>
        <div className="roster-sidebar p-4" style={{ borderRight: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <div className="card-header flex-align mb-4">
            <Users size={20} className="mr-2 text-primary" />
            <h3 className="mb-0">Your Roster</h3>
          </div>
          
          {linkedStudents.length === 0 ? (
            <div className="text-center mt-5 text-secondary">
              <Users size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p className="text-sm">No students linked yet.</p>
            </div>
          ) : (
            <ul className="material-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {linkedStudents.map(student => (
                <li 
                  key={student.id} 
                  className={`glass-panel p-3 hover-lift ${selectedStudent?.id === student.id ? 'active-student' : ''}`}
                  onClick={() => setSelectedStudent(student)} 
                  style={{ cursor: 'pointer', border: selectedStudent?.id === student.id ? '1px solid var(--accent-primary)' : '1px solid transparent' }}
                >
                  <h4 className="mb-1" style={{ fontSize: '1rem' }}>{student.username}</h4>
                  <span className="text-xs text-secondary">{student.profile?.grade || 'Unknown Grade'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="roster-analytics p-5">
          {selectedStudent ? (
            <div className="animate-fade-in">
              <div className="flex-between mb-4 border-bottom pb-4">
                <div>
                  <h2>{selectedStudent.username}</h2>
                  <p className="text-secondary">{selectedStudent.email}</p>
                </div>
                <button className="btn btn-primary"><TrendingUp size={18} className="mr-2"/> Full Report</button>
              </div>

              <div className="insight-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="glass-panel p-4">
                  <h4 className="flex-align mb-3"><AlertCircle size={18} className="mr-2 text-danger" /> Needs Help With</h4>
                  {selectedStudent.profile?.weaknesses?.length > 0 ? (
                    <ul style={{ paddingLeft: '1.5rem' }}>
                      {selectedStudent.profile.weaknesses.map(w => <li key={w} className="text-danger mb-1">{w}</li>)}
                    </ul>
                  ) : (
                    <p className="text-secondary">No recorded weaknesses.</p>
                  )}
                </div>

                <div className="glass-panel p-4">
                  <h4 className="flex-align mb-3"><Check size={18} className="mr-2 text-success" /> Strengths</h4>
                  {selectedStudent.profile?.strengths?.length > 0 ? (
                    <ul style={{ paddingLeft: '1.5rem' }}>
                      {selectedStudent.profile.strengths.map(s => <li key={s} className="text-success mb-1">{s}</li>)}
                    </ul>
                  ) : (
                    <p className="text-secondary">No recorded strengths.</p>
                  )}
                </div>

              </div>
            </div>
          ) : (
            <div className="flex-align text-secondary" style={{ height: '100%', justifyContent: 'center', flexDirection: 'column' }}>
              <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Select a student from the roster to view deep analytics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherOverviewTab;
