import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Compass, CheckCircle, Lock, BookOpen } from 'lucide-react';

const RoadmapVisibilityTab = () => {
  const { user, getLinkedUsers } = useAuth();
  const linkedChildren = getLinkedUsers();
  
  // Default to first child if available, or just render a placeholder
  const [selectedChildId, setSelectedChildId] = useState(linkedChildren[0]?.id || null);
  const selectedChild = linkedChildren.find(c => c.id === selectedChildId);

  // Mock Roadmap Data (in a real app, this would come from the child's actual saved skill tree)
  const roadmapNodes = [
    { id: 1, title: 'Master Core Mathematics', desc: 'Algebra II and Geometry Foundations', status: 'completed' },
    { id: 2, title: 'Introduction to Physics', desc: 'Kinematics and Forces', status: 'active' },
    { id: 3, title: 'Chemistry Lab Fundamentals', desc: 'Understanding periodic trends', status: 'locked' },
    { id: 4, title: 'University Prep Essay', desc: 'Drafting the personal statement', status: 'locked' }
  ];

  if (linkedChildren.length === 0) {
    return (
      <div className="parent-overview animate-fade-in flex-center" style={{ height: '100%', flexDirection: 'column' }}>
        <Compass size={48} className="text-secondary mb-3" style={{ opacity: 0.2 }} />
        <h3 className="text-secondary">No children linked</h3>
        <p className="text-sm text-secondary">A child must link their account to yours first.</p>
      </div>
    );
  }

  return (
    <div className="roadmap-visibility animate-fade-in">
      <div className="tab-header mb-5 flex-between" style={{ alignItems: 'flex-end' }}>
        <div>
          <h2 className="dashboard-title">Academic Roadmap</h2>
          <p className="subtitle">View upcoming milestones and active learning paths. (Read-only)</p>
        </div>
        
        {linkedChildren.length > 1 && (
          <select 
            className="form-control" 
            style={{ width: 'auto', background: 'var(--bg-primary)' }}
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
          >
            {linkedChildren.map(child => (
              <option key={child.id} value={child.id}>{child.username}'s Roadmap</option>
            ))}
          </select>
        )}
      </div>

      <div className="glass-panel p-5">
        <div className="flex-align mb-5 pb-3 border-bottom">
          <TargetIcon size={24} className="mr-3 text-primary" />
          <div>
            <h3 className="mb-1">Target Goals</h3>
            <p className="text-sm text-secondary mb-0">
              <strong>University:</strong> {selectedChild?.profile?.universities?.[0] || 'Undecided'} • 
              <strong> Career:</strong> {selectedChild?.profile?.careers?.[0] || 'Undecided'}
            </p>
          </div>
        </div>

        <div className="roadmap-path">
          {roadmapNodes.map((node, index) => (
            <div key={node.id} className={`roadmap-node glass-panel-alt p-4 mb-4 flex-between ${node.status}`} style={{ borderLeft: node.status === 'completed' ? '4px solid var(--success)' : node.status === 'active' ? '4px solid var(--accent-primary)' : '4px solid var(--border-color)', opacity: node.status === 'locked' ? 0.6 : 1 }}>
              <div className="flex-align">
                <div className="status-icon mr-4">
                  {node.status === 'completed' && <CheckCircle size={24} className="text-success" />}
                  {node.status === 'active' && <Compass size={24} className="text-accent" />}
                  {node.status === 'locked' && <Lock size={24} className="text-secondary" />}
                </div>
                <div>
                  <h4 className="mb-1">{node.title}</h4>
                  <p className="text-sm text-secondary mb-0">{node.desc}</p>
                </div>
              </div>
              <div>
                <span className={`badge badge-outline ${node.status}`}>{node.status.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-4">
          <p className="text-xs text-secondary flex-center"><Lock size={12} className="mr-1"/> Parent view is strictly read-only. Roadmap updates automatically based on student progress.</p>
        </div>
      </div>
    </div>
  );
};

// Quick inline icon component to save an import
const TargetIcon = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

export default RoadmapVisibilityTab;
