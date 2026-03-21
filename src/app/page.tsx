"use client";

import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Spinner, Alert, Card, Badge } from "react-bootstrap";
import FileUploader from "./components/FileUploader";
import AnalysisResults, { AnalysisData } from "./components/AnalysisResults";
import InterviewSimulator from "./components/InterviewSimulator";

export default function Home() {
  const [parsedText, setParsedText] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const handleAnalyze = async () => {
    
    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: parsedText, jobDescription })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to analyze resume");
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (err: unknown) {
      setAnalysisError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="d-flex">
      {/* Sidebar Navigation */}
      <div className="sidebar shadow-sm">
        <div className="d-flex align-items-center mb-5 px-4 mt-2">
          <div className="bg-primary rounded p-2 me-2 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <h5 className="fw-bold mb-0 text-white" style={{ fontSize: '1.1rem' }}>AnalyzeMyResume<span className="text-primary">.ai</span></h5>
        </div>

        <div className="px-3">
          <p className="text-uppercase text-muted small fw-bold mb-2 px-2" style={{ letterSpacing: '0.5px' }}>Overview</p>
          <a href="#" className={`sidebar-link rounded mb-1 ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-3"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </a>
          <a href="#" className={`sidebar-link rounded mb-1 ${activeTab === 'simulator' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('simulator'); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Interview Simulator
          </a>
          
          <div className="mt-5">
            <p className="text-uppercase text-muted small fw-bold mb-2 px-2" style={{ letterSpacing: '0.5px' }}>Data</p>
            <a href="#" className={`sidebar-link rounded mb-1`} onClick={(e) => { 
                e.preventDefault(); 
                setParsedText("");
                setAnalysisData(null);
                setActiveTab('dashboard');
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              Upload New Resume
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content flex-grow-1 bg-dark" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
        <Container fluid className="px-md-4 pt-4">
          
          {!parsedText ? (
            <Row className="justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
              <Col md={10} lg={8} xl={6}>
                <div className="text-center mb-5">
                  <div className="d-inline-block bg-primary bg-opacity-10 rounded-pill px-3 py-1 mb-3">
                    <span className="text-primary fw-bold small tracking-wide">AI-POWERED INSIGHTS</span>
                  </div>
                  <h1 className="fw-bold mb-3 text-white" style={{ fontSize: '2.5rem', letterSpacing: '-0.5px' }}>Upgrade Your Resume</h1>
                  <p className="text-secondary mb-4 mx-auto fs-5" style={{ maxWidth: "500px", lineHeight: '1.6' }}>
                    Drag and drop your resume to receive professional bullet point rewrites, skill gap tracking, and mock interviews.
                  </p>
                </div>
                <div className="mx-auto" style={{ maxWidth: "600px" }}>
                  <FileUploader onParsed={setParsedText} />
                </div>
              </Col>
            </Row>
          ) : (
            <div className="fade-in">
              <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom border-dark border-opacity-50">
                <div>
                  <h2 className="fw-bold mb-1 text-white" style={{ letterSpacing: '-0.5px' }}>
                    {activeTab === 'dashboard' ? 'Resume Analysis Dashboard' : 'Interview Simulator'}
                  </h2>
                  <p className="text-muted mb-0">Professional insights generated by Llama 3.3</p>
                </div>
              </div>

              {activeTab === 'dashboard' && (
                <Row>
                  <Col xl={4} className="mb-4">
                    <Card className="shadow-sm mb-4 border-0">
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center mb-3">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                          <h6 className="fw-bold mb-0 text-white">Target Job Profile</h6>
                        </div>
                        <p className="text-secondary small mb-3">
                          Paste the JD you are applying to. Our LLM will heavily optimize your bullet points and identify exact skill gaps against this profile.
                        </p>
                        <Form.Control 
                          as="textarea" 
                          rows={6} 
                          placeholder="e.g., Seeking a Senior Frontend Engineer with Next.js experience..."
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          className="mb-3"
                          style={{ resize: 'none' }}
                        />
                        
                        {analysisError && (
                          <Alert variant="danger" className="mb-3 border-0 bg-danger bg-opacity-10 text-danger py-2 px-3 small">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            {analysisError}
                          </Alert>
                        )}
                        
                        <Button 
                          variant="primary" 
                          className="w-100 fw-bold py-2 shadow-sm"
                          onClick={handleAnalyze} 
                          disabled={analyzing}
                        >
                          {analyzing ? (
                            <><Spinner as="span" animation="border" size="sm" className="me-2 text-white" /> Optimizing...</>
                          ) : (
                            "Scan Context & Generate Insights"
                          )}
                        </Button>
                      </Card.Body>
                    </Card>

                    {analysisData && (
                      <Card className="shadow-sm border-0 bg-transparent">
                        <Card.Body className="p-0">
                          <h6 className="fw-bold text-white mb-3 text-uppercase small" style={{ letterSpacing: '0.5px' }}>Quick Stats</h6>
                          <div className="d-flex flex-column gap-2 border border-secondary border-opacity-25 rounded p-3 bg-card">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-secondary small">Total Skills Found</span>
                              <Badge bg="secondary" className="px-2 py-1 bg-opacity-25 text-white border-0">{analysisData.skills.length}</Badge>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-secondary small">Missing Core Skills</span>
                              <Badge bg={analysisData.missingSkills.length > 0 ? "warning" : "success"} className="px-2 py-1 bg-opacity-25 border-0">
                                {analysisData.missingSkills.length}
                              </Badge>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-secondary small">Bullets Improved</span>
                              <Badge bg="primary" className="px-2 py-1 bg-opacity-25 border-0 text-white">{analysisData.experienceImprovements.length}</Badge>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    )}
                  </Col>

                  <Col xl={8}>
                    {analyzing ? (
                      <div className="d-flex flex-column gap-4">
                        <div className="skeleton w-100" style={{ height: '180px' }}></div>
                        <div className="row">
                          <div className="col-6"><div className="skeleton w-100" style={{ height: '120px' }}></div></div>
                          <div className="col-6"><div className="skeleton w-100" style={{ height: '120px' }}></div></div>
                        </div>
                        <div className="skeleton w-100" style={{ height: '300px' }}></div>
                      </div>
                    ) : analysisData ? (
                      <AnalysisResults data={analysisData} />
                    ) : (
                      <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center p-5 border border-secondary border-opacity-25 border-dashed rounded" style={{ borderStyle: 'dashed' }}>
                        <div className="bg-dark rounded-circle p-3 mb-3 border border-secondary border-opacity-25">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <h5 className="text-white fw-bold mb-2">No Analysis Data Yet</h5>
                        <p className="text-muted small mb-0 max-w-sm mx-auto" style={{ maxWidth: '300px' }}>Enter an optional job description on the left and click Generate to see your interactive resume breakdown.</p>
                      </div>
                    )}
                  </Col>
                </Row>
              )}

              {activeTab === 'simulator' && (
                <Row className="justify-content-center">
                  <Col md={12} lg={10} xl={8}>
                    <InterviewSimulator resumeText={parsedText} />
                  </Col>
                </Row>
              )}
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}
