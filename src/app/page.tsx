"use client";

import React, { useState, useEffect } from "react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="d-flex overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar Navigation */}
      <div className={`sidebar ${!isSidebarOpen ? 'collapsed' : 'open'}`}>
        <div className="d-flex align-items-center mb-5 px-4 mt-4">
          <div className="btn-primary rounded p-2 me-3 d-flex align-items-center justify-content-center shadow" style={{ width: '36px', height: '36px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <h5 className="fw-bold mb-0 text-white" style={{ fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
            Analyze<span className="text-gradient">MyResume</span>
          </h5>
        </div>

        <div className="flex-grow-1 overflow-auto">
          <p className="text-uppercase small fw-bold mb-2 px-4" style={{ letterSpacing: '1px', color: '#6b7280', fontSize: '0.75rem' }}>Overview</p>
          <a href="#" className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); window.innerWidth < 992 && setIsSidebarOpen(false); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-3"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>
            Dashboard
          </a>
          <a href="#" className={`sidebar-link ${activeTab === 'simulator' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('simulator'); window.innerWidth < 992 && setIsSidebarOpen(false); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Interview Simulator
          </a>
          
          <div className="mt-5">
            <p className="text-uppercase small fw-bold mb-2 px-4" style={{ letterSpacing: '1px', color: '#6b7280', fontSize: '0.75rem' }}>Data</p>
            <a href="#" className={`sidebar-link`} onClick={(e) => { 
                e.preventDefault(); 
                setParsedText("");
                setAnalysisData(null);
                setActiveTab('dashboard');
                window.innerWidth < 992 && setIsSidebarOpen(false);
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              Upload New Resume
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`main-content flex-grow-1 ${!isSidebarOpen ? 'expanded' : ''}`}>
        {/* Top Navigation Bar with Hamburger */}
        <div className="top-nav shadow-sm mb-4">
          <button className="menu-toggle me-3 text-white" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle Navigation">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <span className="fw-medium text-secondary" style={{ fontSize: '0.9rem' }}>
            {parsedText ? (activeTab === 'dashboard' ? 'Dashboard / Analysis' : 'Dashboard / Simulator') : 'Welcome'}
          </span>
        </div>

        <Container fluid className="px-md-5 pb-5 fade-in">
          {!parsedText ? (
            <Row className="justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
              <Col md={10} lg={8} xl={6}>
                <div className="text-center mb-5 fade-in-delayed">
                  <div className="d-inline-block badge bg-primary px-3 py-2 mb-4 shadow-sm" style={{ borderRadius: '20px' }}>
                    <span className="fw-bold tracking-wide" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>✨ AI-POWERED INSIGHTS</span>
                  </div>
                  <h1 className="fw-bold mb-3 text-white" style={{ fontSize: '3rem', letterSpacing: '-1px' }}>
                    Upgrade Your <span className="text-gradient">Resume</span>
                  </h1>
                  <p className="text-secondary mb-5 mx-auto fs-5" style={{ maxWidth: "540px", lineHeight: '1.6' }}>
                    Drag and drop your resume to receive professional bullet point rewrites, skill gap tracking, and mock interviews.
                  </p>
                </div>
                <div className="mx-auto fade-in-delayed" style={{ maxWidth: "600px", animationDelay: '0.2s' }}>
                  <FileUploader onParsed={setParsedText} />
                </div>
              </Col>
            </Row>
          ) : (
            <div className="fade-in">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 pb-4 border-bottom border-secondary border-opacity-25">
                <div>
                  <h2 className="fw-bold mb-2 text-white" style={{ letterSpacing: '-0.5px' }}>
                    {activeTab === 'dashboard' ? 'Resume Analysis Dashboard' : 'Interview Simulator'}
                  </h2>
                  <p className="text-secondary mb-0">Professional insights generated by state-of-the-art LLMs</p>
                </div>
              </div>

              {activeTab === 'dashboard' && (
                <Row className="g-4">
                  <Col xl={4} className="mb-4">
                    <Card className="glass-panel mb-4 border-0">
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-3 text-primary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                          </div>
                          <h6 className="fw-bold mb-0 text-white">Target Job Profile</h6>
                        </div>
                        <p className="text-secondary small mb-4" style={{ lineHeight: '1.6' }}>
                          Paste the JD you are applying to. Our LLM will heavily optimize your bullet points and identify exact skill gaps against this profile.
                        </p>
                        <Form.Control 
                          as="textarea" 
                          rows={6} 
                          placeholder="e.g., Seeking a Senior Frontend Engineer with Next.js experience..."
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          className="mb-4 shadow-none"
                          style={{ resize: 'none' }}
                        />
                        
                        {analysisError && (
                          <Alert variant="danger" className="mb-3 border-0 py-2 px-3 small d-flex align-items-center rounded-3">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2 flex-shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            {analysisError}
                          </Alert>
                        )}
                        
                        <Button 
                          variant="primary" 
                          className="w-100 py-3 d-flex align-items-center justify-content-center pulse-glow"
                          onClick={handleAnalyze} 
                          disabled={analyzing}
                        >
                          {analyzing ? (
                            <><Spinner as="span" animation="border" size="sm" className="me-2 text-white" /> Analyzing Profile...</>
                          ) : (
                            <>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                              Generate Insights
                            </>
                          )}
                        </Button>
                      </Card.Body>
                    </Card>

                    {analysisData && (
                      <Card className="glass-panel border-0">
                        <Card.Body className="p-4">
                          <h6 className="fw-bold text-secondary mb-3 text-uppercase small" style={{ letterSpacing: '1px' }}>Quick Stats</h6>
                          <div className="d-flex flex-column gap-3">
                            <div className="d-flex justify-content-between align-items-center bg-dark bg-opacity-50 p-3 rounded border border-secondary border-opacity-25">
                              <span className="text-secondary small fw-medium">Total Skills Found</span>
                              <Badge bg="secondary" className="px-3 py-2 border-0 rounded-pill">{analysisData.skills.length}</Badge>
                            </div>
                            <div className="d-flex justify-content-between align-items-center bg-dark bg-opacity-50 p-3 rounded border border-secondary border-opacity-25">
                              <span className="text-secondary small fw-medium">Missing Core Skills</span>
                              <Badge bg={analysisData.missingSkills.length > 0 ? "warning" : "success"} className="px-3 py-2 border-0 rounded-pill">
                                {analysisData.missingSkills.length}
                              </Badge>
                            </div>
                            <div className="d-flex justify-content-between align-items-center bg-dark bg-opacity-50 p-3 rounded border border-secondary border-opacity-25">
                              <span className="text-secondary small fw-medium">Bullets Improved</span>
                              <Badge bg="primary" className="px-3 py-2 border-0 rounded-pill text-white">{analysisData.experienceImprovements.length}</Badge>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    )}
                  </Col>

                  <Col xl={8}>
                    {analyzing ? (
                      <div className="d-flex flex-column gap-4 fade-in">
                        <div className="skeleton w-100" style={{ height: '220px', borderRadius: '12px' }}></div>
                        <div className="row g-4">
                          <div className="col-12 col-md-6"><div className="skeleton w-100" style={{ height: '180px', borderRadius: '12px' }}></div></div>
                          <div className="col-12 col-md-6"><div className="skeleton w-100" style={{ height: '180px', borderRadius: '12px' }}></div></div>
                        </div>
                        <div className="skeleton w-100" style={{ height: '400px', borderRadius: '12px' }}></div>
                      </div>
                    ) : analysisData ? (
                      <AnalysisResults data={analysisData} />
                    ) : (
                      <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center p-5 border border-secondary border-opacity-25 border-dashed rounded-4" style={{ borderStyle: 'dashed', backgroundColor: 'rgba(20,20,25,0.4)', minHeight: '500px' }}>
                        <div className="bg-dark rounded-circle p-4 mb-4 border border-secondary border-opacity-25 shadow-sm">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary opacity-75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <h4 className="text-white fw-bold mb-3">No Output Generated</h4>
                        <p className="text-secondary mb-0 mx-auto" style={{ maxWidth: '380px', lineHeight: '1.6' }}>Enter an optional job description on the left and click <strong className="text-primary">Generate Insights</strong> to see your interactive resume breakdown.</p>
                      </div>
                    )}
                  </Col>
                </Row>
              )}

              {activeTab === 'simulator' && (
                <Row className="justify-content-center fade-in">
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
