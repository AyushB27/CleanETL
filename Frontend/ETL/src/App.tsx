import React, { useState } from 'react';
import './App.css';

interface CleaningReport {
  totalRows: number;
  duplicatesRemoved: number;
  nullsHandled: number;
  invalidDataCorrected: number;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CleaningReport | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [csvData, setCsvData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [rules, setRules] = useState({
    removeDuplicates: true,
    handleMissing: true,
    standardizeText: true,
    validateRanges: true
  });

  const handleRuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRules({ ...rules, [e.target.name]: e.target.checked });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file to upload.");
      return;
    }
    setError(null);
    setLoading(true);
    setReport(null);
    setPreviewData([]);
    setCsvData(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('rules', JSON.stringify(rules));

    try {
      const response = await fetch('http://localhost:5000/api/etl/process', { method: 'POST', body: formData });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process data.");
      }
      const data = await response.json();
      
      setReport(data.report);
      setPreviewData(data.preview);
      setCsvData(data.csvData);
    } catch (err: any) {
      setError(err.message || "An error occurred during processing.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!csvData) return;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cleaned_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to safely format grade class
  const getGradeClass = (grade: string) => {
    return grade ? grade.replace('+', 'plus') : 'unknown';
  };

  return (
    <div className="container">
      <header className="header">
        <h1>CleanETL Pipeline</h1>
        <p>Extract, Transform, Load, and Export your data seamlessly.</p>
      </header>

      <div className="layout-grid">
        {/* Left Column: Configuration */}
        <aside className="config-column">
          <div className="card sticky-card">
            <h2>1. Configuration</h2>
            
            <div className="rules-section">
              <h3>Cleaning Rules</h3>
              <label className="checkbox-label">
                <input type="checkbox" name="removeDuplicates" checked={rules.removeDuplicates} onChange={handleRuleChange} />
                Remove Duplicates
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="handleMissing" checked={rules.handleMissing} onChange={handleRuleChange} />
                Handle Missing Values
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="standardizeText" checked={rules.standardizeText} onChange={handleRuleChange} />
                Standardize Text (Casing, Spaces)
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="validateRanges" checked={rules.validateRanges} onChange={handleRuleChange} />
                Validate Ranges (Ages, Marks)
              </label>
            </div>

            <div className="upload-section">
              <h3>Upload Dataset</h3>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                className="file-input"
              />
              <button 
                onClick={handleUpload} 
                disabled={!file || loading}
                className="btn-primary full-width"
              >
                {loading ? "Processing..." : "Run Pipeline"}
              </button>
            </div>
            {error && <div className="error-msg">{error}</div>}
          </div>
        </aside>

        {/* Right Column: Results */}
        <main className="results-column">
          {!report && !loading && (
            <div className="empty-state card">
              <svg width="64" height="64" fill="none" stroke="#cbd5e1" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Upload a dataset to see the cleaning report here.</p>
            </div>
          )}

          {report && (
            <div className="card mb-2">
              <h2>2. Cleaning Report</h2>
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-value">{report.totalRows}</span>
                  <span className="stat-label">Rows Processed</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">{report.duplicatesRemoved}</span>
                  <span className="stat-label">Duplicates Removed</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">{report.nullsHandled}</span>
                  <span className="stat-label">Missing Values Fixed</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">{report.invalidDataCorrected}</span>
                  <span className="stat-label">Invalid Data Corrected</span>
                </div>
              </div>
            </div>
          )}

          {previewData.length > 0 && (
            <div className="card">
              <div className="preview-header">
                <h2>3. Cleaned Data Preview</h2>
                <button onClick={handleDownload} className="btn-secondary">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download CSV
                </button>
              </div>
              
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      {Object.keys(previewData[0] || {}).map((key) => (
                        <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx}>
                        {Object.keys(row).map((key) => (
                          <td key={key}>
                            {key === 'grade' && row[key] ? (
                              <span className={`grade grade-${getGradeClass(row[key])}`}>
                                {row[key]}
                              </span>
                            ) : (
                              String(row[key] ?? '')
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="success-msg mt-2">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Data cleaned and saved to MySQL. Ready for download.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
