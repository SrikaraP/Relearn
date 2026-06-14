import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { generateInitialSkillTree, evolveSkillTree } from '../../services/ai';
import { Target, CheckCircle, Lock, PlayCircle, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import './PlanningTab.css';

const PlanningTab = () => {
  const { user } = useAuth();
  const [tree, setTree] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const cached = localStorage.getItem(`skilltree_${user?.id}`);
    if (cached) {
      setTree(JSON.parse(cached));
    }
  }, [user]);

  const handleGenerateInitial = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const res = await generateInitialSkillTree(user?.profile || {});
      setTree(res);
      localStorage.setItem(`skilltree_${user?.id}`, JSON.stringify(res));
    } catch (err) {
      console.error(err);
      if (err.message === "API_KEY_MISSING") setErrorMsg("Gemini API key is required.");
      else setErrorMsg("Failed to generate skill tree. Check connection or API format.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteNode = async (node) => {
    setIsEvolving(true);
    setErrorMsg('');
    try {
      // Optimistically update local UI
      const optimisticTree = tree.map(n => n.id === node.id ? { ...n, status: 'completed' } : n);
      setTree(optimisticTree);
      
      const context = `I just completed the milestone: ${node.title}. ${node.desc}`;
      const newTree = await evolveSkillTree(optimisticTree, context, user?.profile || {});
      
      setTree(newTree);
      localStorage.setItem(`skilltree_${user?.id}`, JSON.stringify(newTree));
    } catch (err) {
      console.error(err);
      if (err.message === "API_KEY_MISSING") setErrorMsg("Gemini API key is required.");
      else setErrorMsg("Failed to evolve skill tree. Check connection.");
    } finally {
      setIsEvolving(false);
    }
  };

  const handleAddCustomGoal = async () => {
    const goalTitle = prompt("Enter a custom goal or milestone:");
    if (!goalTitle) return;

    setIsEvolving(true);
    try {
      const context = `I am manually adding a new goal: ${goalTitle}. Please integrate this into my skill tree.`;
      const newTree = await evolveSkillTree(tree, context, user?.profile || {});
      setTree(newTree);
      localStorage.setItem(`skilltree_${user?.id}`, JSON.stringify(newTree));
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to add custom goal.");
    } finally {
      setIsEvolving(false);
    }
  };

  const activeNodes = tree.filter(n => n.status === 'active');
  const lockedNodes = tree.filter(n => n.status === 'locked');
  const completedNodes = tree.filter(n => n.status === 'completed');

  return (
    <div className="planning-tab animate-fade-in">
      <div className="tab-header mb-5">
        <h2 className="dashboard-title flex-align">Adaptive Roadmap <span className="badge-beta ml-3">Beta</span></h2>
        <p className="subtitle">Your personalized skill tree powered by Gemini.</p>
      </div>
      <div className="tab-header flex-between mb-4">
        <div style={{ display: 'flex', gap: '1rem' }}>
          {tree.length > 0 && (
            <button className="btn btn-outline" onClick={handleAddCustomGoal} disabled={isEvolving}>
              <Plus size={16}/> Add Custom Goal
            </button>
          )}
          <button className="btn btn-primary" onClick={handleGenerateInitial} disabled={isGenerating || isEvolving}>
            <RefreshCw size={16} className={isGenerating ? 'spin-icon' : ''}/> 
            {tree.length > 0 ? 'Regenerate Entire Tree' : 'Initialize Skill Tree'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="api-error-banner glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <AlertTriangle size={24} /> <p>{errorMsg}</p>
        </div>
      )}

      {tree.length === 0 && !isGenerating && (
        <div className="empty-state glass-panel text-center" style={{ padding: '6rem 2rem' }}>
          <Target size={48} className="gradient-text mb-4" />
          <h3>No Roadmap Exists</h3>
          <p>Click "Initialize Skill Tree" to let Gemini build a personalized progression path based on your onboarding profile.</p>
        </div>
      )}

      {(isGenerating || isEvolving) && (
        <div className="processing-state glass-panel text-center" style={{ padding: '4rem 2rem', marginBottom: '2rem' }}>
          <RefreshCw size={32} className="spin-icon gradient-text mb-2" />
          <h3>Gemini is calculating progression...</h3>
          <p>Adapting branches based on your profile and recent actions.</p>
        </div>
      )}

      {tree.length > 0 && (
        <div className="skill-tree-grid">
          
          {/* Active Nodes */}
          <div className="tree-column active-column">
            <h3><PlayCircle size={20} className="inline-icon text-warning" /> Active Objectives</h3>
            {activeNodes.length === 0 ? <p className="text-secondary">No active objectives.</p> : activeNodes.map((node, i) => (
              <div key={i} className="skill-node node-active glass-panel">
                <div className="node-category">{node.category}</div>
                <h4>{node.title}</h4>
                <p>{node.desc}</p>
                <button className="btn btn-success mt-2 w-100" onClick={() => handleCompleteNode(node)} disabled={isEvolving}>
                  <CheckCircle size={16}/> Mark Completed
                </button>
              </div>
            ))}
          </div>

          {/* Locked Nodes */}
          <div className="tree-column locked-column">
            <h3><Lock size={20} className="inline-icon text-secondary" /> Upcoming Milestones</h3>
            {lockedNodes.length === 0 ? <p className="text-secondary">No upcoming milestones yet.</p> : lockedNodes.map((node, i) => (
              <div key={i} className="skill-node node-locked glass-panel">
                <div className="node-category">{node.category}</div>
                <h4>{node.title}</h4>
                <p>{node.desc}</p>
                {node.dependsOn && node.dependsOn.length > 0 && (
                  <div className="dependency-tag">Requires earlier milestone</div>
                )}
              </div>
            ))}
          </div>

          {/* Completed Nodes */}
          <div className="tree-column completed-column">
            <h3><CheckCircle size={20} className="inline-icon text-success" /> Achieved</h3>
            {completedNodes.length === 0 ? <p className="text-secondary">Complete an objective to build your history.</p> : completedNodes.map((node, i) => (
              <div key={i} className="skill-node node-completed glass-panel">
                <div className="node-category">{node.category}</div>
                <h4>{node.title}</h4>
                <p>{node.desc}</p>
                <div className="completed-stamp"><CheckCircle size={24}/></div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default PlanningTab;
