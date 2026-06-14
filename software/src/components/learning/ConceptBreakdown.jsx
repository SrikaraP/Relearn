import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Lightbulb, Zap, HelpCircle } from 'lucide-react';

const ConceptBreakdown = ({ breakdowns }) => {
  const [openIdx, setOpenIdx] = useState(0);

  if (!breakdowns || !breakdowns.breakdowns) return null;

  return (
    <div className="concept-breakdown">
      {breakdowns.breakdowns.map((item, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div key={idx} className="accordion-item glass-panel mb-3" style={{ overflow: 'hidden' }}>
            <div 
              className="accordion-header p-4 flex-between cursor-pointer"
              onClick={() => setOpenIdx(isOpen ? -1 : idx)}
              style={{ background: isOpen ? 'rgba(255,255,255,0.05)' : 'transparent' }}
            >
              <h4 className="mb-0 flex-align"><Zap size={18} className="mr-2 text-primary"/> {item.concept}</h4>
              {isOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
            </div>
            
            {isOpen && (
              <div className="accordion-content p-4 border-top" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="mb-4">
                  <h5 className="text-secondary mb-2 flex-align"><HelpCircle size={16} className="mr-2"/> Definition</h5>
                  <p className="pl-4 border-left border-secondary">{item.definition}</p>
                </div>

                {item.rules && item.rules.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-secondary mb-2">Key Rules</h5>
                    <ul className="pl-4">
                      {item.rules.map((r, i) => <li key={i} className="mb-1">{r}</li>)}
                    </ul>
                  </div>
                )}

                {item.example && (
                  <div className="mb-4 bg-primary-light p-3 rounded">
                    <h5 className="text-primary mb-2 flex-align"><Lightbulb size={16} className="mr-2"/> Example</h5>
                    <p className="mb-0 font-monospace text-sm">{item.example}</p>
                  </div>
                )}

                {item.mistakes && (
                  <div className="bg-danger-light p-3 rounded">
                    <h5 className="text-danger mb-2 flex-align"><AlertTriangle size={16} className="mr-2"/> Common Mistakes</h5>
                    <p className="mb-0 text-sm">{item.mistakes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ConceptBreakdown;
