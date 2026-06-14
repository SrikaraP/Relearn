import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Award, Star, Trophy, Medal } from 'lucide-react';

const ParentAchievementsTab = () => {
  const { user, getLinkedUsers } = useAuth();
  const linkedChildren = getLinkedUsers();
  
  const [selectedChildId, setSelectedChildId] = useState(linkedChildren[0]?.id || null);
  const selectedChild = linkedChildren.find(c => c.id === selectedChildId);

  // Mock Achievements
  const achievements = [
    { id: 1, type: 'award', title: 'Regional Science Fair - 2nd Place', date: 'March 2026', icon: <Trophy size={24} className="text-warning"/> },
    { id: 2, type: 'certificate', title: 'Python Basics Completion', date: 'Jan 2026', icon: <Medal size={24} className="text-accent"/> },
    { id: 3, type: 'milestone', title: '100 Study Hours Milestone', date: 'Dec 2025', icon: <Star size={24} className="text-success"/> }
  ];

  if (linkedChildren.length === 0) {
    return (
      <div className="flex-center" style={{ height: '100%', flexDirection: 'column' }}>
        <Award size={48} className="text-secondary mb-3" style={{ opacity: 0.2 }} />
        <h3 className="text-secondary">No children linked</h3>
      </div>
    );
  }

  return (
    <div className="parent-achievements animate-fade-in">
      <div className="tab-header mb-5 flex-between" style={{ alignItems: 'flex-end' }}>
        <div>
          <h2 className="dashboard-title">Achievements & Growth</h2>
          <p className="subtitle">Celebrate long-term growth, awards, and milestones.</p>
        </div>
        
        {linkedChildren.length > 1 && (
          <select 
            className="form-control" 
            style={{ width: 'auto', background: 'var(--bg-primary)' }}
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
          >
            {linkedChildren.map(child => (
              <option key={child.id} value={child.id}>{child.username}'s Achievements</option>
            ))}
          </select>
        )}
      </div>

      <div className="achievements-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {achievements.map(ach => (
          <div key={ach.id} className="glass-panel p-5 text-center hover-lift" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="icon-wrapper mb-4" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {ach.icon}
            </div>
            <h3 className="mb-2" style={{ fontSize: '1.2rem' }}>{ach.title}</h3>
            <span className="badge badge-outline mt-2">{ach.date}</span>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default ParentAchievementsTab;
