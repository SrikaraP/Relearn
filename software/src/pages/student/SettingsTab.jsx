import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, AlertCircle, Activity, Server, Clock, Database, PlayCircle } from 'lucide-react';
import { subscribeToDiagnostics, testGeminiConnection } from '../../services/ai';

const SettingsTab = () => {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  
  // Diagnostics State
  const [diagnostics, setDiagnostics] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('relearn_gemini_key') || '';
    setApiKey(key);
    setSavedKey(key);

    // Subscribe to AI Diagnostic State
    const unsubscribe = subscribeToDiagnostics((state) => {
      setDiagnostics(state);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = () => {
    const trimmed = apiKey.trim();
    localStorage.setItem('relearn_gemini_key', trimmed);
    setSavedKey(trimmed);
    setTestResult(null); // Reset test result on key change
  };

  const handleClear = () => {
    localStorage.removeItem('relearn_gemini_key');
    setApiKey('');
    setSavedKey('');
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!savedKey) {
      alert("Please save your API key first.");
      return;
    }
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const res = await testGeminiConnection();
      setTestResult({
        success: true,
        message: "Successfully connected to Gemini API.",
        model: res.modelUsed,
        response: res.text,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: "Connection failed.",
        error: err.message,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="settings-tab animate-fade-in" style={{ padding: '2rem 0' }}>
      <div className="tab-header mb-4">
        <h2 className="dashboard-title">AI Engine Settings</h2>
        <p className="subtitle">Configure your Google Gemini API key to power all intelligence features.</p>
      </div>

      <div className="settings-card glass-panel" style={{ padding: '3rem', maxWidth: '800px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', background: savedKey ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: savedKey ? 'var(--success)' : 'var(--danger)' }}>
            {savedKey ? <ShieldCheck size={32} /> : <AlertCircle size={32} />}
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Google Gemini Connection</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: 1.5 }}>
            Your key is stored securely in your browser's Local Storage. We use Gemini 1.5 for rapid multimodal extraction and intelligence.
          </p>
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Key size={18}/> Gemini API Key</label>
          <input 
            type="password" 
            className="form-control" 
            placeholder="AIzaSy... or custom token" 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={handleSave}>Save Key</button>
          {savedKey && <button className="btn btn-outline" onClick={handleClear} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>Remove Key</button>}
          {savedKey && (
            <button className="btn btn-success" onClick={handleTestConnection} disabled={isTesting}>
              {isTesting ? 'Testing...' : <><PlayCircle size={18} className="mr-2"/> Test Gemini Connection</>}
            </button>
          )}
        </div>

        {/* Test Result Banner */}
        {testResult && (
          <div className="mt-4 p-4" style={{ borderRadius: '8px', border: `1px solid ${testResult.success ? 'var(--success)' : 'var(--danger)'}`, background: testResult.success ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)' }}>
            <h4 style={{ color: testResult.success ? 'var(--success)' : 'var(--danger)', marginBottom: '0.5rem' }}>
              {testResult.success ? 'Connection Successful' : 'Connection Failed'} ({testResult.timestamp})
            </h4>
            {testResult.success ? (
              <>
                <p><strong>Model:</strong> {testResult.model}</p>
                <p><strong>Raw Response:</strong> {testResult.response}</p>
              </>
            ) : (
              <p style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--danger)' }}>Error: {testResult.error}</p>
            )}
          </div>
        )}
      </div>

      {/* Developer Diagnostics Panel */}
      <div className="diagnostics-panel glass-panel" style={{ padding: '2rem', maxWidth: '800px' }}>
        <h3 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <Activity size={20} /> Developer Diagnostics
        </h3>
        
        <div className="diagnostic-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="diag-item p-3 glass-panel">
            <p className="text-secondary mb-1" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Key size={14}/> Key Loaded</p>
            <p style={{ fontWeight: '600', color: diagnostics.keyExists ? 'var(--success)' : 'var(--danger)' }}>
              {diagnostics.keyExists ? "True" : "False"}
            </p>
          </div>
          
          <div className="diag-item p-3 glass-panel">
            <p className="text-secondary mb-1" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Server size={14}/> SDK Initialized</p>
            <p style={{ fontWeight: '600', color: diagnostics.sdkInitialized ? 'var(--success)' : 'var(--danger)' }}>
              {diagnostics.sdkInitialized ? "True" : "False"}
            </p>
          </div>

          <div className="diag-item p-3 glass-panel">
            <p className="text-secondary mb-1" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Database size={14}/> Total API Requests</p>
            <p style={{ fontWeight: '600' }}>{diagnostics.requestCount || 0}</p>
          </div>

          <div className="diag-item p-3 glass-panel">
            <p className="text-secondary mb-1" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14}/> Last Success</p>
            <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>
              {diagnostics.lastSuccessfulCall ? new Date(diagnostics.lastSuccessfulCall).toLocaleTimeString() : 'Never'}
            </p>
          </div>
        </div>

        {diagnostics.lastError && (
          <div className="mt-4 p-3" style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', borderRadius: '0 4px 4px 0' }}>
            <p className="text-secondary mb-1" style={{ fontSize: '0.8rem' }}>Last API Error</p>
            <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--danger)', wordBreak: 'break-all' }}>
              {diagnostics.lastError}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsTab;
