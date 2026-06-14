import React, { useState } from 'react';
import { Bot, FileText, ClipboardList, PenTool, Sparkles, Download, RefreshCw } from 'lucide-react';
import { generateTeacherContent } from '../../services/ai';
import ThinkingState from '../../components/learning/ThinkingState';
import CustomMarkdown from '../../components/learning/CustomMarkdown';

const RequestTypes = [
  { id: 'lesson_plan', title: 'Lesson Plan', icon: <FileText size={20} />, desc: 'Structured plan with objectives and timelines.' },
  { id: 'worksheet', title: 'Worksheet', icon: <PenTool size={20} />, desc: 'Practice questions tailored to a topic.' },
  { id: 'quiz', title: 'Quiz', icon: <ClipboardList size={20} />, desc: 'Multiple choice questions with answer keys.' }
];

const TeacherAssistantTab = () => {
  const [selectedType, setSelectedType] = useState('lesson_plan');
  const [contextInput, setContextInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!contextInput.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const typeLabel = RequestTypes.find(t => t.id === selectedType).title;
      const res = await generateTeacherContent(typeLabel, contextInput);
      setResult(res);
    } catch (err) {
      setError("Failed to generate content. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="teacher-assistant animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="tab-header mb-5 flex-between">
        <div>
          <h2 className="dashboard-title flex-align">Teacher AI Assistant <span className="badge-beta ml-3">Beta</span></h2>
          <p className="subtitle">Automate administrative workload by generating structured educational materials instantly.</p>
        </div>
        <div className="avatar-wrapper bg-primary-light text-primary" style={{ width: '48px', height: '48px' }}>
          <Bot size={24} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '2rem', flexGrow: 1 }}>
        
        {/* Input Panel */}
        <div className="generator-panel glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="mb-4">1. What do you want to create?</h3>
          <div className="type-selector mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            {RequestTypes.map(t => (
              <div 
                key={t.id} 
                className={`glass-panel-alt p-3 hover-lift ${selectedType === t.id ? 'active' : ''}`}
                style={{ 
                  cursor: 'pointer', 
                  border: selectedType === t.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  textAlign: 'center'
                }}
                onClick={() => setSelectedType(t.id)}
              >
                <div style={{ color: selectedType === t.id ? 'var(--accent-primary)' : 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {t.icon}
                </div>
                <h4 style={{ fontSize: '0.9rem', margin: 0 }}>{t.title}</h4>
              </div>
            ))}
          </div>

          <h3 className="mb-3">2. Provide Context</h3>
          <textarea 
            className="form-control mb-4" 
            placeholder="e.g. A 45-minute lesson plan for 10th-grade Physics focusing on Newton's Laws of Motion. Include a hands-on activity."
            rows="6"
            value={contextInput}
            onChange={e => setContextInput(e.target.value)}
            style={{ resize: 'none', background: 'var(--bg-primary)' }}
          ></textarea>

          {error && <p className="text-danger text-sm mb-3">{error}</p>}

          <button className="btn btn-primary mt-auto py-3" onClick={handleGenerate} disabled={isGenerating || !contextInput.trim()}>
            {isGenerating ? <><RefreshCw size={18} className="mr-2 spin-icon"/> Generating AI Content...</> : <><Sparkles size={18} className="mr-2"/> Generate Material</>}
          </button>
        </div>

        {/* Output Panel */}
        {(result || isGenerating) && (
          <div className="output-panel glass-panel" style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 250px)' }}>
            {isGenerating ? (
              <div className="flex-center" style={{ height: '100%', flexDirection: 'column' }}>
                <ThinkingState text={`Generating your ${RequestTypes.find(t => t.id === selectedType).title}...`} />
              </div>
            ) : result && (
              <>
                <div className="flex-between mb-4 border-bottom pb-3">
                  <h3 className="mb-0">{result.title}</h3>
                  <button className="btn btn-outline btn-icon" title="Download Material"><Download size={18}/></button>
                </div>
                <div className="output-content" style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '1rem' }}>
                  <CustomMarkdown>{result.content}</CustomMarkdown>
                </div>
                {result.tags && result.tags.length > 0 && (
                  <div className="output-tags mt-4 pt-3 border-top flex-align gap-2">
                    {result.tags.map((tag, idx) => <span key={idx} className="badge badge-outline">{tag}</span>)}
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default TeacherAssistantTab;
