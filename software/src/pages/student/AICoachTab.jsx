import React, { useState, useRef, useEffect } from 'react';
import { Send, BrainCircuit, Bot, User, Sparkles } from 'lucide-react';
import { chatWithCoach } from '../../services/ai';
import { getNotesDB } from '../../services/notesDb';
import CustomMarkdown from '../../components/learning/CustomMarkdown';
import ThinkingState from '../../components/learning/ThinkingState';
import './AICoachTab.css';

const AICoachTab = ({ user }) => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'coach', text: "Hello! I'm your Relearn AI Coach. I have full access to your uploaded notes and skill tree. What are we studying today?" }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMsg = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      // Build Context from Notes
      const notes = getNotesDB(user?.id);
      let context = "";
      if (notes.length > 0) {
        context = `The user has ${notes.length} uploaded documents. Recent document: "${notes[0].title}". `;
      }

      const response = await chatWithCoach(messages, userMsg.text, context);
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'coach',
        text: response
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'coach',
        text: "**Error:** I'm having trouble connecting to the intelligence engine right now."
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="ai-coach-workspace animate-fade-in">
      <div className="coach-header p-4 border-bottom glass-panel-no-border">
        <div className="flex-align">
          <div className="avatar-wrapper mr-3 bg-primary-light text-primary">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h2 className="mb-0" style={{ fontSize: '1.25rem' }}>Gemini Study Coach</h2>
            <p className="text-sm text-secondary mb-0 flex-align">
              <Sparkles size={14} className="mr-1 text-accent"/> Powered by Gemini 2.5 Flash
            </p>
          </div>
        </div>
      </div>

      <div className="coach-messages p-4">
        {messages.map((msg, idx) => (
          <div key={msg.id} className={`message-bubble-wrapper ${msg.role === 'user' ? 'user-wrapper' : 'coach-wrapper'} animate-fade-in stagger-${(idx % 5) + 1}`}>
            <div className={`message-avatar ${msg.role === 'user' ? 'bg-secondary' : 'bg-primary'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'coach-bubble glass-panel-alt'}`}>
              {msg.role === 'user' ? (
                <p className="mb-0">{msg.text}</p>
              ) : (
                <CustomMarkdown>{msg.text}</CustomMarkdown>
              )}
            </div>
          </div>
        ))}
        
        {isThinking && (
          <div className="message-bubble-wrapper coach-wrapper animate-fade-in">
            <div className="message-avatar bg-primary"><Bot size={16} /></div>
            <div className="message-bubble coach-bubble glass-panel-alt p-0">
              <ThinkingState text="Processing your request..." />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="coach-input-area p-4 border-top glass-panel-no-border">
        <div className="suggested-prompts mb-3 flex-align gap-2">
          <button className="coach-prompt-chip hover-lift" onClick={() => setInput("Can you quiz me on my recent notes?")}>Quiz me on recent notes</button>
          <button className="coach-prompt-chip hover-lift" onClick={() => setInput("What should I study next based on my skill tree?")}>What should I study next?</button>
          <button className="coach-prompt-chip hover-lift" onClick={() => setInput("Explain quantum physics like I'm 5")}>Explain complex topic</button>
        </div>
        <form onSubmit={handleSend} className="chat-form flex-align gap-3">
          <input 
            type="text" 
            className="form-control chat-input coach-chat-input" 
            placeholder="Ask me anything about your studies..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-icon hover-lift" disabled={isThinking || !input.trim()}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AICoachTab;
