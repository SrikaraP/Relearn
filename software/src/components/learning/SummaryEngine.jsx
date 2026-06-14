import React from 'react';
import { BookOpen, Hash, Sigma } from 'lucide-react';

const SummaryEngine = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="summary-engine">
      <div className="summary-overview glass-panel p-4 mb-4" style={{ borderLeft: '4px solid var(--primary)' }}>
        <h4 className="mb-2 flex-align text-primary"><BookOpen size={18} className="mr-2"/> Executive Summary</h4>
        <p className="mb-0" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>{summary.conciseSummary}</p>
      </div>

      <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="takeaways-card glass-panel p-4">
          <h4 className="mb-3">Key Takeaways</h4>
          <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
            {summary.takeaways?.map((t, i) => (
              <li key={i} className="mb-2 text-secondary">{t}</li>
            ))}
          </ul>
        </div>

        <div className="terms-card glass-panel p-4">
          <h4 className="mb-3 flex-align"><Hash size={18} className="mr-2"/> Essential Terms</h4>
          <div className="flex-wrap" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {summary.keyTerms?.map((term, i) => (
              <span key={i} className="badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {term}
              </span>
            ))}
          </div>
        </div>
      </div>

      {summary.formulas && summary.formulas.length > 0 && (
        <div className="formulas-section glass-panel p-4">
          <h4 className="mb-3 flex-align"><Sigma size={18} className="mr-2"/> Important Formulas</h4>
          <div className="formulas-grid" style={{ display: 'grid', gap: '1rem' }}>
            {summary.formulas.map((f, i) => (
              <div key={i} className="formula-block" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-secondary">{f.name}</span>
                <code style={{ fontSize: '1.2rem', color: 'var(--primary)', fontFamily: 'monospace' }}>{f.equation}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryEngine;
