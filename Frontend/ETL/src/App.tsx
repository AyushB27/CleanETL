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
  const [error, setError] = useState<string | null>(null);

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

    const formData = new FormData();
    formData.append('file', file);

    try {
      // In a real scenario, this would be an actual API call to the Flask backend:
      // const response = await fetch('http://localhost:5000/api/etl/process', { method: 'POST', body: formData });
      // if (!response.ok) throw new Error("Failed to process data.");
      // const data = await response.json();
      
      // Simulating a backend response for demonstration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockData = {
        report: {
          totalRows: 50,
          duplicatesRemoved: 2,
          nullsHandled: 4,
          invalidDataCorrected: 5,
        },
        preview: [
          { student_id: 1001, name: "Ayush Bhardwaj", email: "ayush@gmail.com", age: 20, department: "IT", marks: 85, city: "Mumbai", grade: "A" },
          { student_id: 1002, name: "Rahul Sharma", email: "rahul@gmail.com", age: 21, department: "IT", marks: 78, city: "Mumbai", grade: "B" },
          { student_id: 1003, name: "Priya Patil", email: "priya@gmail.com", age: 20, department: "Computer Engineering", marks: 92, city: "Pune", grade: "A+" },
          { student_id: 1004, name: "Amit Shah", email: "amit@gmail.com", age: 20, department: "IT", marks: 100, city: "Mumbai", grade: "A+" },
          { student_id: 1005, name: "Neha Joshi", email: "neha@gmail.com", age: 19, department: "Computer Engineering", marks: 88, city: "Pune", grade: "A" },
        ]
      };
      
      setReport(mockData.report);
      setPreviewData(mockData.preview);
    } catch (err: any) {
      setError(err.message || "An error occurred during processing.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely format grade class
  const getGradeClass = (grade: string) => {
    return grade ? grade.replace('+', 'plus') : 'unknown';
  };

  return (
    <div className="container">
      <header className="header">
        <h1>CleanETL Pipeline</h1>
        <p>Extract, Transform, and Load your data seamlessly.</p>
      </header>

      <main className="main-content">
        <section className="upload-section card">
          <h2>1. Upload Raw Dataset</h2>
          <div className="upload-control">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              className="file-input"
            />
            <button 
              onClick={handleUpload} 
              disabled={!file || loading}
              className="btn-primary"
            >
              {loading ? "Processing Pipeline..." : "Run ETL Pipeline"}
            </button>
          </div>
          {error && <div className="error-msg">{error}</div>}
        </section>

        {report && (
          <section className="report-section card">
            <h2>2. Cleaning Report</h2>
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-value">{report.totalRows}</span>
                <span className="stat-label">Total Rows Processed</span>
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
          </section>
        )}

        {previewData.length > 0 && (
          <section className="preview-section card">
            <h2>3. Cleaned Data Preview</h2>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>Department</th>
                    <th>Marks</th>
                    <th>City</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.student_id}</td>
                      <td>{row.name}</td>
                      <td>{row.email}</td>
                      <td>{row.age}</td>
                      <td>{row.department}</td>
                      <td>{row.marks}</td>
                      <td>{row.city}</td>
                      <td>
                        <span className={`grade grade-${getGradeClass(row.grade)}`}>
                          {row.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="success-msg">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Data successfully cleaned, transformed, and loaded into MySQL database.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
