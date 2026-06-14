import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, Database, Code, Search } from 'lucide-react';
import './ThinkingState.css';

const STEPS = [
  { icon: Search, text: "Analyzing context and constraints..." },
  { icon: Database, text: "Querying knowledge graph..." },
  { icon: Sparkles, text: "Synthesizing intelligent response..." },
  { icon: Code, text: "Formatting markdown output..." }
];

const ThinkingState = ({ text = "Generating insights..." }) => {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIdx(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = STEPS[stepIdx].icon;

  return (
    <div className="thinking-state-container p-5 text-center">
      <div className="ai-pulse-ring mx-auto mb-4">
        <BrainCircuit size={32} className="text-primary ai-pulse-icon" />
      </div>
      <h3 className="mb-2 text-primary">{text}</h3>
      <div className="thinking-steps text-secondary mt-3">
        <div className="flex-align center gap-2 animate-fade-in" key={stepIdx}>
          <CurrentIcon size={16} className="text-accent" />
          <span className="text-sm font-medium">{STEPS[stepIdx].text}</span>
        </div>
      </div>
      
      {/* Skeleton Blocks */}
      <div className="skeleton-container mt-5 text-left">
        <div className="skeleton-line w-75 mb-3 stagger-1"></div>
        <div className="skeleton-line w-100 mb-2 stagger-2"></div>
        <div className="skeleton-line w-100 mb-2 stagger-3"></div>
        <div className="skeleton-line w-50 mb-4 stagger-4"></div>
        <div className="skeleton-box w-100 stagger-5"></div>
      </div>
    </div>
  );
};

export default ThinkingState;
