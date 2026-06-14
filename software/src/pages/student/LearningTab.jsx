import React, { useState, useEffect } from 'react';
import { Upload, FileText, BrainCircuit, Activity, Clock, Search, ChevronLeft, Layout, Zap, Lightbulb } from 'lucide-react';
import { extractTextWithGemini, generateSummary, generateFlashcards, generateQuiz, generateRevisionPlan, generateExplanations, evolveSkillTree } from '../../services/ai';
import { useAuth } from '../../contexts/AuthContext';
import { getNotesDB, createNote, updateNoteField, deleteNote } from '../../services/notesDb';
import CustomMarkdown from '../../components/learning/CustomMarkdown';

// Components
import SummaryEngine from '../../components/learning/SummaryEngine';
import InteractiveFlashcards from '../../components/learning/InteractiveFlashcards';
import InteractiveQuiz from '../../components/learning/InteractiveQuiz';
import RevisionTimeline from '../../components/learning/RevisionTimeline';
import ConceptBreakdown from '../../components/learning/ConceptBreakdown';
import ThinkingState from '../../components/learning/ThinkingState';

import './LearningTab.css';

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

const LearningTab = () => {
  const { user } = useAuth();
  
  // Library vs Workspace State
  const [view, setView] = useState('library'); // 'library' | 'workspace'
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [activeTab, setActiveTab] = useState('extracted'); // extracted, summary, flashcards, quiz, revision, breakdown

  // Upload State
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiErrorMsg, setApiErrorMsg] = useState('');

  useEffect(() => {
    if (user?.id) {
      setNotes(getNotesDB(user.id));
    }
  }, [user]);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setIsExtracting(true);
    setApiErrorMsg('');

    try {
      const base64 = await fileToBase64(selectedFile);
      const text = await extractTextWithGemini(base64, selectedFile.type);
      
      const newNote = createNote(user.id, selectedFile.name, text);
      setNotes(getNotesDB(user.id));
      setActiveNote(newNote);
      setView('workspace');
      setActiveTab('extracted');
    } catch (err) {
      console.error("Upload workflow failed:", err);
      setApiErrorMsg("Gemini connection failed. Please verify your API key.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAiAction = async (actionFn, fieldName) => {
    if (!activeNote?.extractedText) return;
    // Don't re-generate if we already have it
    if (activeNote[fieldName]) {
      setActiveTab(fieldName);
      return;
    }

    setIsGenerating(true);
    setApiErrorMsg('');
    setActiveTab(fieldName);
    
    try {
      const res = await actionFn(activeNote.extractedText);
      const updated = updateNoteField(user.id, activeNote.id, fieldName, res);
      setActiveNote(updated);
      setNotes(getNotesDB(user.id));
    } catch (err) {
      console.error(`Action ${fieldName} failed:`, err);
      setApiErrorMsg(`Failed to generate ${fieldName}. Check API key.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuizComplete = async (score, total) => {
    const percentage = score / total;
    if (percentage < 0.8) {
      // Trigger Skill Tree Revision Node
      try {
        const currentTreeStr = localStorage.getItem(`skilltree_${user?.id}`);
        if (currentTreeStr) {
          const updatedTree = await evolveSkillTree(JSON.parse(currentTreeStr), `Failed quiz on ${activeNote.title} with ${score}/${total}`, user?.profile);
          localStorage.setItem(`skilltree_${user?.id}`, JSON.stringify(updatedTree));
          // Notify user
          alert("A revision node has been dynamically added to your Skill Tree in the Planning Tab.");
        }
      } catch (e) {
        console.error("Failed to evolve skill tree after quiz:", e);
      }
    }
  };

  const openNote = (note) => {
    setActiveNote(note);
    setView('workspace');
    setActiveTab('extracted');
  };

  const closeWorkspace = () => {
    setActiveNote(null);
    setView('library');
  };

  const handleDelete = (e, noteId) => {
    e.stopPropagation();
    const updated = deleteNote(user.id, noteId);
    setNotes(updated);
  };

  if (view === 'workspace' && activeNote) {
    return (
      <div className="learning-workspace animate-fade-in">
        <div className="workspace-header glass-panel p-4 mb-4 flex-between">
          <div className="flex-align">
            <button className="btn btn-icon btn-outline mr-4" onClick={closeWorkspace}><ChevronLeft size={20}/></button>
            <div>
              <h2 className="mb-1" style={{ fontSize: '1.5rem' }}>{activeNote.title}</h2>
              <span className="text-secondary text-sm">Extracted on {new Date(activeNote.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="workspace-actions flex-align gap-2">
            <button className={`btn ${activeTab === 'extracted' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('extracted')}>Document</button>
            <button className={`btn ${activeTab === 'summary' ? 'btn-primary' : 'btn-outline'}`} onClick={() => handleAiAction(generateSummary, 'summary')}>
              <Layout size={16} className="mr-2"/> Summary
            </button>
            <button className={`btn ${activeTab === 'flashcards' ? 'btn-primary' : 'btn-outline'}`} onClick={() => handleAiAction(generateFlashcards, 'flashcards')}>
              <Zap size={16} className="mr-2"/> Flashcards
            </button>
            <button className={`btn ${activeTab === 'quiz' ? 'btn-primary' : 'btn-outline'}`} onClick={() => handleAiAction(generateQuiz, 'quiz')}>
              <BrainCircuit size={16} className="mr-2"/> Quiz
            </button>
            <button className={`btn ${activeTab === 'revisionPlan' ? 'btn-primary' : 'btn-outline'}`} onClick={() => handleAiAction(generateRevisionPlan, 'revisionPlan')}>
              <Clock size={16} className="mr-2"/> Plan
            </button>
            <button className={`btn ${activeTab === 'explanations' ? 'btn-primary' : 'btn-outline'}`} onClick={() => handleAiAction(generateExplanations, 'explanations')}>
              <Lightbulb size={16} className="mr-2"/> Deep Dive
            </button>
          </div>
        </div>

        {apiErrorMsg && (
          <div className="api-error-banner glass-panel bg-danger-light text-danger p-3 mb-4 rounded border-danger">
            <strong>Error:</strong> {apiErrorMsg}
          </div>
        )}

        <div className="workspace-content mt-4">
          {isGenerating && (
            <div className="py-5">
              <ThinkingState text="Generative AI is processing your request..." />
            </div>
          )}

          {!isGenerating && activeTab === 'extracted' && (
            <div className="extracted-document glass-panel p-5">
              <CustomMarkdown>
                {activeNote.extractedText}
              </CustomMarkdown>
            </div>
          )}

          {!isGenerating && activeTab === 'summary' && activeNote.summary && (
            <SummaryEngine summary={activeNote.summary} />
          )}

          {!isGenerating && activeTab === 'flashcards' && activeNote.flashcards && (
            <InteractiveFlashcards 
              deck={activeNote.flashcards} 
              onRegenerate={() => handleAiAction(generateFlashcards, 'flashcards')}
            />
          )}

          {!isGenerating && activeTab === 'quiz' && activeNote.quiz && (
            <InteractiveQuiz 
              quiz={activeNote.quiz} 
              onComplete={handleQuizComplete}
            />
          )}

          {!isGenerating && activeTab === 'revisionPlan' && activeNote.revisionPlan && (
            <RevisionTimeline plan={activeNote.revisionPlan} />
          )}

          {!isGenerating && activeTab === 'explanations' && activeNote.explanations && (
            <ConceptBreakdown breakdowns={activeNote.explanations} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="learning-library animate-fade-in" style={{ padding: '2rem 0' }}>
      <div className="tab-header mb-5 flex-between">
        <div>
          <h2 className="dashboard-title">Notes Database</h2>
          <p className="subtitle">Your centralized repository for intelligent learning.</p>
        </div>
        
        <div className="upload-btn-wrapper">
          <input 
            type="file" 
            id="file-upload" 
            style={{ display: 'none' }} 
            onChange={handleFileUpload} 
            accept="image/*,.pdf"
            disabled={isExtracting}
          />
          <label htmlFor="file-upload" className={`btn btn-primary btn-lg ${isExtracting ? 'disabled' : ''}`}>
            {isExtracting ? <BrainCircuit className="spin-icon mr-2" size={20}/> : <Upload className="mr-2" size={20}/>}
            {isExtracting ? 'Extracting via Gemini...' : 'Upload Notes / PDF'}
          </label>
        </div>
      </div>

      {apiErrorMsg && (
        <div className="api-error-banner glass-panel bg-danger-light text-danger p-3 mb-4 rounded border-danger">
          <strong>Error:</strong> {apiErrorMsg}
        </div>
      )}

      {notes.length === 0 ? (
        <div className="empty-state text-center glass-panel" style={{ padding: '6rem 2rem' }}>
          <FileText size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
          <h3>No Documents Yet</h3>
          <p className="text-secondary mb-4">Upload a textbook page, lecture slide, or handwritten notes to begin.</p>
        </div>
      ) : (
        <div className="library-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {notes.map(note => (
            <div key={note.id} className="note-card glass-panel p-4 cursor-pointer" onClick={() => openNote(note)}>
              <div className="flex-between mb-3">
                <FileText size={24} className="text-primary" />
                <button className="btn btn-icon text-secondary hover-danger" onClick={(e) => handleDelete(e, note.id)}>
                  &times;
                </button>
              </div>
              <h4 className="mb-2" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{note.title}</h4>
              <p className="text-sm text-secondary mb-4">Added {new Date(note.createdAt).toLocaleDateString()}</p>
              
              <div className="note-badges flex-wrap gap-2">
                {note.summary && <span className="badge badge-outline"><Layout size={12} className="mr-1"/> Summary</span>}
                {note.flashcards && <span className="badge badge-outline"><Zap size={12} className="mr-1"/> Cards</span>}
                {note.quiz && <span className="badge badge-outline"><BrainCircuit size={12} className="mr-1"/> Quiz</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LearningTab;
