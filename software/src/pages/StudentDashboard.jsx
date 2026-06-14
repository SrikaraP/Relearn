import React, { useState } from 'react';
import { Upload, BookOpen, Target, MessageSquare, Send, CheckCircle, FileText, BrainCircuit, PlayCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  
  // State for tabs: 'overview', 'study', 'chat'
  const [activeTab, setActiveTab] = useState('overview');

  // Chat State
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState([
    { role: 'ai', text: `Hi ${user?.username}! I'm your AI Coach. Based on your goal to get into ${user?.profile?.dreamUniversities || 'a top university'}, we should focus on improving your ${user?.profile?.weaknesses || 'weak areas'} today. Ready to start?` }
  ]);

  // Upload State
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadType, setUploadType] = useState('notes'); // 'notes' or 'exam'
  const [generatedContent, setGeneratedContent] = useState(null); // stores the generated materials

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    setChatLog(prev => [...prev, { role: 'user', text: chatMessage }]);
    const currentMessage = chatMessage;
    setChatMessage('');
    
    setTimeout(() => {
      // Very basic simulated intelligence
      let response = "I'm analyzing your request...";
      if (currentMessage.toLowerCase().includes('mitosis')) {
        response = "Mitosis is a process of cell duplication where one cell divides into two genetically identical daughter cells. It has 4 main phases: Prophase, Metaphase, Anaphase, and Telophase.";
      } else if (currentMessage.toLowerCase().includes('roadmap')) {
        response = "Your roadmap is structured around your goal to study Computer Science. Right now, your priority should be mastering Advanced Calculus and starting personal coding projects.";
      } else {
        response = `That's a great question about ${currentMessage}. To help you best, could you upload your notes on this topic so I can generate a specific study plan for you?`;
      }
      setChatLog(prev => [...prev, { role: 'ai', text: response }]);
    }, 1200);
  };

  const handleFileUpload = (type) => {
    setUploadType(type);
    setIsProcessing(true);
    
    // Simulating OCR and AI Generation delay
    setTimeout(() => {
      setIsProcessing(false);
      if (type === 'notes') {
        setGeneratedContent({
          type: 'notes',
          title: 'Biology: Cell Division',
          summary: 'The uploaded document covers the fundamental mechanics of cellular division, primarily focusing on mitosis and its distinct phases. It highlights the importance of genetic replication.',
          flashcards: [
            { q: 'What is Prophase?', a: 'Chromatin condenses into chromosomes and the nuclear envelope breaks down.' },
            { q: 'What is Metaphase?', a: 'Chromosomes align along the cell equator.' }
          ]
        });
      } else {
        setGeneratedContent({
          type: 'exam',
          title: '2023 AP Physics Past Paper',
          analysis: 'Detected: Kinematics (40%), Dynamics (35%), Energy (25%). Difficulty: Hard.',
          practice: [
            'Generated Practice: A 5kg block is pushed with 20N force on a frictionless surface. Calculate acceleration.',
            'Generated Practice: A car accelerates from 0 to 20m/s in 5s. Find the distance traveled.'
          ]
        });
      }
    }, 3500);
  };

  // Generate dynamic roadmap steps based on user profile
  const generateRoadmap = () => {
    const profile = user?.profile || {};
    const career = profile.careerGoals || 'College';
    
    return [
      { status: 'current', title: `Master core concepts in ${profile.weaknesses || 'challenging subjects'}`, desc: `Focus on fundamentals to build a strong base for your ${career} path.` },
      { status: 'upcoming', title: 'Standardized Test Prep', desc: `Target score aligned with ${profile.dreamUniversities || 'top universities'}.` },
      { status: 'upcoming', title: 'Extracurricular Project', desc: `Build a portfolio project related to ${career}.` }
    ];
  };

  const roadmap = generateRoadmap();

  return (
    <div className="student-dashboard container animate-fade-in">
      
      {/* Sidebar Navigation */}
      <div className="dashboard-sidebar glass-panel">
        <div className="user-profile-summary">
          <h3>{user?.username}</h3>
          <p className="gradient-text">{user?.profile?.grade || 'Student'}</p>
        </div>
        
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <Target size={20} /> Overview & Roadmap
          </button>
          <button className={`nav-item ${activeTab === 'study' ? 'active' : ''}`} onClick={() => setActiveTab('study')}>
            <Upload size={20} /> Upload & Study
          </button>
          <button className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
            <MessageSquare size={20} /> AI Coach
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main">
        
        {activeTab === 'overview' && (
          <div className="tab-content animate-fade-in">
            <h2 className="dashboard-title">Today's Focus</h2>
            <div className="focus-section glass-panel">
              <p className="focus-question">What should I do next?</p>
              <div className="focus-tasks">
                <div className="task-item">
                  <PlayCircle size={24} className="accent-icon" />
                  <div>
                    <h4>Review Biology Flashcards</h4>
                    <p>Based on your recent uploads, you need to review Cell Division before your test.</p>
                  </div>
                  <button className="btn btn-outline" onClick={() => setActiveTab('study')}>Start</button>
                </div>
                <div className="task-item">
                  <Target size={24} className="accent-icon" />
                  <div>
                    <h4>Extracurricular Milestone</h4>
                    <p>Your goal is {user?.profile?.careerGoals || 'a successful career'}. It's time to brainstorm a related project.</p>
                  </div>
                  <button className="btn btn-outline" onClick={() => setActiveTab('chat')}>Brainstorm</button>
                </div>
              </div>
            </div>

            <h2 className="dashboard-title mt-4">Your Personalized Roadmap</h2>
            <div className="roadmap-container glass-panel">
              <div className="roadmap-path-advanced">
                {roadmap.map((step, idx) => (
                  <div key={idx} className={`roadmap-step-advanced ${step.status}`}>
                    <div className="step-indicator-wrapper">
                      <div className="step-node"></div>
                    </div>
                    <div className="step-details">
                      <h4>{step.title}</h4>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'study' && (
          <div className="tab-content animate-fade-in">
            <h2 className="dashboard-title">Upload & Generate</h2>
            
            {!isProcessing && !generatedContent && (
              <div className="upload-options grid-2">
                <div className="upload-card glass-panel" onClick={() => handleFileUpload('notes')}>
                  <FileText size={48} className="gradient-text" />
                  <h3>Notes & Worksheets</h3>
                  <p>Upload a photo or PDF of your notes. AI will generate summaries, key concepts, and interactive flashcards.</p>
                </div>
                <div className="upload-card glass-panel" onClick={() => handleFileUpload('exam')}>
                  <BookOpen size={48} className="gradient-text" />
                  <h3>Past Papers</h3>
                  <p>Upload previous exams. AI will identify topics, analyze difficulty, and create similar practice questions.</p>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="processing-state glass-panel text-center">
                <Loader className="spinner gradient-text" size={48} />
                <h3>AI is analyzing your document...</h3>
                <p>Running OCR, extracting text, identifying core concepts, and generating personalized materials.</p>
              </div>
            )}

            {generatedContent && !isProcessing && (
              <div className="generated-results animate-fade-in">
                <div className="results-header flex-between">
                  <h3>Results: {generatedContent.title}</h3>
                  <button className="btn btn-outline" onClick={() => setGeneratedContent(null)}>Upload Another</button>
                </div>

                {generatedContent.type === 'notes' && (
                  <div className="notes-results">
                    <div className="result-card glass-panel">
                      <h4><BrainCircuit size={20}/> Executive Summary</h4>
                      <p>{generatedContent.summary}</p>
                    </div>
                    
                    <h4 className="mt-4 mb-2">Interactive Flashcards</h4>
                    <div className="flashcards-grid">
                      {generatedContent.flashcards.map((card, i) => (
                        <div key={i} className="flashcard">
                          <div className="flashcard-inner">
                            <div className="flashcard-front">
                              <p>{card.q}</p>
                              <span className="flip-hint">Hover to flip</span>
                            </div>
                            <div className="flashcard-back">
                              <p>{card.a}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {generatedContent.type === 'exam' && (
                  <div className="exam-results">
                    <div className="result-card glass-panel">
                      <h4><Target size={20}/> Exam Analysis</h4>
                      <p>{generatedContent.analysis}</p>
                    </div>
                    <div className="result-card glass-panel mt-4">
                      <h4>Similar Practice Questions</h4>
                      <ul className="clean-list">
                        {generatedContent.practice.map((q, i) => (
                          <li key={i}><CheckCircle size={18} className="check-icon"/> {q}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="tab-content animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2 className="dashboard-title">AI Education Coach</h2>
            <div className="full-chat-interface glass-panel">
              <div className="chat-messages">
                {chatLog.map((msg, idx) => (
                  <div key={idx} className={`chat-bubble-wrapper ${msg.role}`}>
                    {msg.role === 'ai' && <div className="ai-avatar"><BrainCircuit size={20}/></div>}
                    <div className="chat-bubble">{msg.text}</div>
                  </div>
                ))}
              </div>
              <form className="chat-input-container" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  placeholder="Ask me anything about your studies, exams, or career..." 
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  className="form-control"
                />
                <button type="submit" className="btn btn-primary"><Send size={20}/></button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
