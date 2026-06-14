import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle, Send, CheckCircle, Heart, ThumbsUp, Star } from 'lucide-react';

const MESSAGES = [
  { id: 1, text: "I'm so proud of your hard work this week! Keep it up.", icon: <ThumbsUp size={18} /> },
  { id: 2, text: "I see you have a big deadline coming up. Let me know if you need any support!", icon: <Heart size={18} /> },
  { id: 3, text: "Congratulations on completing your recent milestone! Brilliant job.", icon: <Star size={18} /> },
  { id: 4, text: "Remember to take breaks. Your wellbeing is just as important as your grades.", icon: <Heart size={18} /> }
];

const SupportCommunicationTab = () => {
  const { user, getLinkedUsers, sendSupportMessage } = useAuth();
  const linkedChildren = getLinkedUsers();
  
  const [selectedChildId, setSelectedChildId] = useState(linkedChildren[0]?.id || null);
  const [customMessage, setCustomMessage] = useState('');
  const [status, setStatus] = useState(null);

  const handleSend = (text) => {
    if (!selectedChildId || !text.trim()) return;
    
    sendSupportMessage(selectedChildId, text);
    setStatus("Message sent successfully! They'll see it on their dashboard.");
    setCustomMessage('');
    
    setTimeout(() => {
      setStatus(null);
    }, 3000);
  };

  if (linkedChildren.length === 0) {
    return (
      <div className="flex-center" style={{ height: '100%', flexDirection: 'column' }}>
        <MessageCircle size={48} className="text-secondary mb-3" style={{ opacity: 0.2 }} />
        <h3 className="text-secondary">No children linked</h3>
      </div>
    );
  }

  return (
    <div className="support-communication animate-fade-in">
      <div className="tab-header mb-5 flex-between" style={{ alignItems: 'flex-end' }}>
        <div>
          <h2 className="dashboard-title">Support & Communication</h2>
          <p className="subtitle">Send quick notes of encouragement to your child's dashboard.</p>
        </div>
        
        {linkedChildren.length > 1 && (
          <select 
            className="form-control" 
            style={{ width: 'auto', background: 'var(--bg-primary)' }}
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
          >
            {linkedChildren.map(child => (
              <option key={child.id} value={child.id}>Send to {child.username}</option>
            ))}
          </select>
        )}
      </div>

      <div className="glass-panel p-5" style={{ maxWidth: '800px' }}>
        <h3 className="mb-4">Quick Encouragements</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          {MESSAGES.map(msg => (
            <div key={msg.id} className="glass-panel-alt p-3 flex-between hover-lift" style={{ borderLeft: '3px solid var(--accent-primary)' }}>
              <div className="flex-align">
                <span className="text-accent mr-3">{msg.icon}</span>
                <p className="mb-0">{msg.text}</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => handleSend(msg.text)}>Send</button>
            </div>
          ))}
        </div>

        <h3 className="mb-3">Custom Message</h3>
        <textarea 
          className="form-control mb-3" 
          placeholder="Write your own supportive message..."
          rows="4"
          value={customMessage}
          onChange={e => setCustomMessage(e.target.value)}
          style={{ background: 'var(--bg-primary)', resize: 'none' }}
        ></textarea>
        
        <div className="flex-between">
          <div>
            {status && <span className="text-success flex-align text-sm"><CheckCircle size={16} className="mr-1"/> {status}</span>}
          </div>
          <button className="btn btn-primary" onClick={() => handleSend(customMessage)} disabled={!customMessage.trim()}>
            <Send size={18} className="mr-2"/> Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportCommunicationTab;
