import React from 'react';
import './AssessmentReport.css';
import { CheckCircle, AlertCircle, TrendingUp, XCircle, HelpCircle } from 'lucide-react';

const AssessmentReport = ({ data }) => {
  if (!data) return null;

  return (
    <div className="pdf-report-document">
      {/* Header */}
      <div className="report-header">
        <div className="school-branding">
          <div className="school-logo">R</div>
          <div>
            <h1 className="report-title">Relearn Assessment Report</h1>
            <p className="report-subtitle">AI-Powered Tutoring & Analytics</p>
          </div>
        </div>
        <div className="report-meta">
          <p><strong>Student:</strong> {data.studentName}</p>
          <p><strong>Grade:</strong> {data.grade}</p>
          <p><strong>Subject:</strong> {data.subject}</p>
          <p><strong>Date:</strong> {data.date}</p>
        </div>
      </div>

      {/* Overview Section */}
      <div className="report-section">
        <div className="score-banner">
          <div className="score-label">Overall Performance</div>
          <div className="score-value">{data.overallScore}</div>
        </div>
      </div>

      <div className="report-grid-2">
        {/* Strengths */}
        <div className="report-box strengths-box">
          <h3><CheckCircle size={18} /> Identified Strengths</h3>
          <ul>
            {data.strengths?.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="report-box weaknesses-box">
          <h3><AlertCircle size={18} /> Areas of Struggle</h3>
          <ul>
            {data.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      </div>

      {/* Improvement Areas */}
      <div className="report-box improvement-box" style={{ marginTop: '1.5rem' }}>
        <h3><TrendingUp size={18} /> Recommended Improvements</h3>
        <ul>
          {data.improvementAreas?.map((imp, i) => <li key={i}>{imp}</li>)}
        </ul>
      </div>

      {/* Question by Question Breakdown */}
      <div className="report-section" style={{ marginTop: '3rem' }}>
        <h2 className="section-title">Question Breakdown</h2>
        
        <table className="report-table">
          <thead>
            <tr>
              <th width="8%">Q#</th>
              <th width="15%">Status</th>
              <th width="37%">Mistake Analysis</th>
              <th width="40%">Correct Approach</th>
            </tr>
          </thead>
          <tbody>
            {data.questions?.map((q, i) => (
              <tr key={i}>
                <td className="center"><strong>{q.qNum}</strong></td>
                <td>
                  <span className={`status-badge ${q.status.toLowerCase()}`}>
                    {q.status === 'Correct' && <CheckCircle size={14} />}
                    {q.status === 'Incorrect' && <XCircle size={14} />}
                    {q.status === 'Partial' && <HelpCircle size={14} />}
                    {q.status}
                  </span>
                </td>
                <td className="mistake-text">{q.mistake}</td>
                <td className="approach-text">{q.correctApproach}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="report-footer">
        <p>This report was generated securely by the Relearn AI Engine using Gemini Multimodal Vision.</p>
        <p>Teachers should review these insights to tailor future lesson plans.</p>
      </div>
    </div>
  );
};

export default AssessmentReport;
