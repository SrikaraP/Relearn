import React, { useState } from 'react';
import { Clock, CheckSquare, Square } from 'lucide-react';

const RevisionTimeline = ({ plan }) => {
  const [completedTasks, setCompletedTasks] = useState(new Set());

  if (!plan || !plan.tasks) return null;

  const toggleTask = (id) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="revision-timeline">
      <h3 className="mb-4">{plan.title || "Revision Plan"}</h3>
      
      <div className="timeline-container" style={{ position: 'relative', paddingLeft: '2rem' }}>
        {/* Vertical Line */}
        <div style={{ position: 'absolute', left: '0.75rem', top: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.1)' }} />
        
        {plan.tasks.map((task, idx) => {
          const isDone = completedTasks.has(task.id);
          return (
            <div key={task.id} className="timeline-item mb-4" style={{ position: 'relative' }}>
              {/* Node */}
              <div 
                style={{ 
                  position: 'absolute', 
                  left: '-2rem', 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  background: isDone ? 'var(--success)' : 'var(--bg-card)',
                  border: `2px solid ${isDone ? 'var(--success)' : 'var(--primary)'}`,
                  top: '6px',
                  transition: 'all 0.3s ease'
                }} 
              />
              
              <div 
                className={`glass-panel p-3 flex-between ${isDone ? 'opacity-75' : ''}`}
                style={{ 
                  cursor: 'pointer', 
                  borderLeft: isDone ? '4px solid var(--success)' : '4px solid transparent',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => toggleTask(task.id)}
              >
                <div className="flex-align">
                  {isDone ? <CheckSquare size={20} className="text-success mr-3" /> : <Square size={20} className="text-secondary mr-3" />}
                  <span style={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>
                    {task.task}
                  </span>
                </div>
                {task.timeEstimate && (
                  <span className="badge badge-outline flex-align text-sm text-secondary">
                    <Clock size={14} className="mr-1"/> {task.timeEstimate}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RevisionTimeline;
