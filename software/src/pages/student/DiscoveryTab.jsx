import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { chatWithCoach, generateOpportunities } from '../../services/ai';
import { Send, BrainCircuit, Lightbulb, RefreshCw } from 'lucide-react';
import './DiscoveryTab.css';

const DiscoveryTab = () => {
  const { user } = useAuth();
  
  // Opportunities State
  const [opportunities, setOpportunities] = useState([]);
  const [isGeneratingOpps, setIsGeneratingOpps] = useState(false);

  useEffect(() => {
    // Load cached opportunities
    const cachedOpps = localStorage.getItem(`opps_${user?.id}`);
    if (cachedOpps) {
      setOpportunities(JSON.parse(cachedOpps));
    }
  }, [user]);

  const handleGenerateOpportunities = async () => {
    setIsGeneratingOpps(true);
    try {
      const res = await generateOpportunities(user?.profile || {});
      setOpportunities(res);
      localStorage.setItem(`opps_${user?.id}`, JSON.stringify(res));
    } catch (err) {
      console.error(err);
      alert("Failed to generate opportunities. Check API key.");
    } finally {
      setIsGeneratingOpps(false);
    }
  };

  return (
    <div className="discovery-tab animate-fade-in">
      <div className="tab-header mb-4">
        <h2 className="dashboard-title flex-align">Career & University Discovery <span className="badge-beta ml-3">Beta</span></h2>
        <p className="subtitle">Explore AI-curated opportunities matched to your skill tree and goals.</p>
      </div>

      <div className="discovery-grid">
        {/* Opportunities Hub */}
        <div className="opportunities-panel glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between mb-4">
            <h3 className="flex-align"><Lightbulb size={20} className="mr-2 text-warning"/> Real-World Opportunities</h3>
            <button className="btn btn-outline" onClick={handleGenerateOpportunities} disabled={isGeneratingOpps}>
              <RefreshCw size={16} className={isGeneratingOpps ? 'spin-icon' : ''} />
              {opportunities.length > 0 ? ' Regenerate' : ' Generate'}
            </button>
          </div>
          
          {opportunities.length === 0 && !isGeneratingOpps && (
            <div className="empty-state text-center" style={{ padding: '4rem 2rem', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Lightbulb size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
              <p>Click "Generate" to discover real-world competitions, internships, and programs tailored to your profile.</p>
            </div>
          )}

          {isGeneratingOpps && (
            <div className="text-center" style={{ padding: '4rem 2rem', flexGrow: 1 }}>
              <p>Communicating with Gemini to find perfect matches...</p>
            </div>
          )}

          {opportunities.length > 0 && !isGeneratingOpps && (
            <div className="opportunities-list" style={{ overflowY: 'auto' }}>
              {opportunities.map((opp, idx) => (
                <div key={idx} className="opportunity-card">
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <h4>{opp.title}</h4>
                    <span className={`badge ${opp.type === 'Match' ? 'badge-success' : 'badge-warning'}`}>{opp.type}</span>
                  </div>
                  <p>{opp.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoveryTab;
