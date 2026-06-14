import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, RefreshCw, Printer } from 'lucide-react';
import { analyzeAssessment } from '../../services/ai';
import ThinkingState from '../../components/learning/ThinkingState';
import AssessmentReport from './AssessmentReport';
import './AssessmentAnalyzer.css';

const AssessmentAnalyzerTab = () => {
  const [qpFile, setQpFile] = useState(null);
  const [asFile, setAsFile] = useState(null);
  
  const [qpBase64, setQpBase64] = useState(null);
  const [asBase64, setAsBase64] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      if (type === 'qp') {
        setQpFile(file.name);
        setQpBase64(base64);
      } else {
        setAsFile(file.name);
        setAsBase64(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!asBase64) {
      setError("You must upload a Student Answer Sheet.");
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);

    try {
      // Extract mimetypes
      const qpMime = qpBase64 ? qpBase64.split(';')[0].split(':')[1] : null;
      const asMime = asBase64.split(';')[0].split(':')[1];

      const result = await analyzeAssessment(qpBase64, qpMime, asBase64, asMime);
      
      // Merge with some dummy student data for the report since we don't have a specific student selected in this flow
      // In a full production app, you would select the student from the roster first.
      const finalReport = {
        ...result,
        studentName: "Alex Doe",
        grade: "11th Grade",
        subject: "Physics",
        date: new Date().toLocaleDateString()
      };
      
      setReportData(finalReport);
    } catch (err) {
      setError("Failed to analyze documents. Ensure API key is valid and files are clear images.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="assessment-analyzer animate-fade-in">
      <div className="tab-header mb-5 hide-on-print">
        <h2 className="dashboard-title">AI Assessment Analyzer</h2>
        <p className="subtitle">Upload question papers and student answers. Gemini Multimodal Vision will grade, analyze, and generate a premium PDF report.</p>
      </div>

      {!reportData && !isAnalyzing && (
        <div className="upload-grid mb-5 hide-on-print">
          {/* Question Paper Upload */}
          <div className="upload-card glass-panel">
            <div className="upload-header flex-align mb-3">
              <FileText size={20} className="mr-2 text-primary"/>
              <h3 className="mb-0">1. Question Paper / Syllabus</h3>
            </div>
            <p className="text-sm text-secondary mb-4">Optional but highly recommended. AI uses this to extract the expected correct answers and rubrics.</p>
            
            <div className={`upload-zone ${qpFile ? 'has-file' : ''}`}>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'qp')} id="qp-upload" />
              <label htmlFor="qp-upload">
                {qpFile ? (
                  <><CheckCircle size={32} className="text-success mb-2"/><p>Uploaded: {qpFile}</p></>
                ) : (
                  <><UploadCloud size={32} className="text-secondary mb-2"/><p>Drag & drop or click to upload</p></>
                )}
              </label>
            </div>
          </div>

          {/* Answer Sheet Upload */}
          <div className="upload-card glass-panel" style={{ border: asFile ? '' : '1px solid var(--accent-primary)' }}>
            <div className="upload-header flex-align mb-3">
              <FileText size={20} className="mr-2 text-accent"/>
              <h3 className="mb-0">2. Student Answer Sheet</h3>
            </div>
            <p className="text-sm text-secondary mb-4">Required. Handwritten text, diagrams, and math formulas are fully supported.</p>
            
            <div className={`upload-zone ${asFile ? 'has-file' : ''}`}>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'as')} id="as-upload" />
              <label htmlFor="as-upload">
                {asFile ? (
                  <><CheckCircle size={32} className="text-success mb-2"/><p>Uploaded: {asFile}</p></>
                ) : (
                  <><UploadCloud size={32} className="text-accent mb-2"/><p>Drag & drop or click to upload</p></>
                )}
              </label>
            </div>
          </div>
        </div>
      )}

      {!reportData && !isAnalyzing && (
        <div className="flex-center hide-on-print">
          {error && <p className="text-danger flex-align mr-4"><AlertCircle size={16} className="mr-1"/> {error}</p>}
          <button className="btn btn-primary btn-large hover-lift" onClick={handleAnalyze} disabled={!asBase64}>
            <RefreshCw size={20} className="mr-2"/> Generate AI Report
          </button>
        </div>
      )}

      {isAnalyzing && (
        <div className="analyzing-state glass-panel p-5 text-center hide-on-print">
          <ThinkingState text="Gemini Vision is running OCR, parsing handwritten text, cross-referencing formulas, and building the tutor report..." />
        </div>
      )}

      {reportData && (
        <div className="report-container animate-fade-in">
          <div className="report-actions hide-on-print flex-between mb-4">
            <button className="btn btn-outline" onClick={() => setReportData(null)}>
              Start New Analysis
            </button>
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={18} className="mr-2" /> Save as PDF / Print
            </button>
          </div>
          
          <div className="printable-report-wrapper">
            <AssessmentReport data={reportData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentAnalyzerTab;
