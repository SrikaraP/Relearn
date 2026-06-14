import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle, Heart, ThumbsUp, Star } from 'lucide-react';

const MessagesTab = () => {
  const { user } = useAuth();
  const messages = user?.supportMessages || [];

  return (
    <div className="messages-tab animate-fade-in" style={{ padding: '2rem' }}>
      <div className="tab-header mb-5">
        <h2 className="dashboard-title">Inbox & Support</h2>
        <p className="subtitle">Encouragement and messages from your connected parents and teachers.</p>
      </div>

      <div style={{ maxWidth: '800px' }}>
        {messages.length === 0 ? (
          <div className="flex-center glass-panel p-5 text-center" style={{ flexDirection: 'column' }}>
            <MessageCircle size={48} className="text-secondary mb-3" style={{ opacity: 0.2 }} />
            <h3 className="text-secondary">No messages yet</h3>
            <p className="text-sm text-secondary">Messages from your linked parents will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Displaying messages in reverse chronological order */}
            {[...messages].reverse().map((msg, idx) => (
              <div key={idx} className="glass-panel p-4 flex-align hover-lift" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                <div className="mr-4 text-accent">
                  {/* Guess an icon based on content, or just use a default heart */}
                  {msg.message.includes('proud') ? <ThumbsUp size={24} /> : 
                   msg.message.includes('congratulations') || msg.message.includes('milestone') ? <Star size={24} className="text-warning"/> :
                   <Heart size={24} className="text-danger" />}
                </div>
                <div>
                  <h4 className="mb-1" style={{ fontSize: '1rem' }}>From: {msg.fromUsername}</h4>
                  <p className="mb-1 text-sm">{msg.message}</p>
                  <span className="text-xs text-secondary">{new Date(msg.date).toLocaleDateString()} at {new Date(msg.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesTab;
