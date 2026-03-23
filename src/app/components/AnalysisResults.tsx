"use client";

import React from "react";
import { Card, Alert } from "react-bootstrap";

interface ExperienceImprovement {
  originalBullet: string;
  improvedBullet: string;
  reason: string;
}

export interface AnalysisData {
  summary: string;
  linkedinSummaries?: string[];
  skills: string[];
  missingSkills: string[];
  experienceImprovements: ExperienceImprovement[];
}

interface Props {
  data: AnalysisData;
}

export default function AnalysisResults({ data }: Props) {
  const scoreBase = 70;
  const scoreMatch = Math.min(99, Math.max(20, scoreBase + (data.skills.length * 2) - (data.missingSkills.length * 3)));

  // Determine dynamic color for circle based on score
  const scoreColor = scoreMatch >= 80 ? 'text-success' : scoreMatch >= 60 ? 'text-primary' : scoreMatch >= 40 ? 'text-warning' : 'text-danger';

  return (
    <div className="fade-in">
      <div className="row g-4 mb-5">
        {/* Score & Summary */}
        <div className="col-lg-5 col-xl-4 mb-4 mb-lg-0">
          <Card className="h-100 glass-panel border-0 border-opacity-25 rounded-4 shadow-lg flex-column justify-content-center text-center p-2">
            <Card.Body className="d-flex flex-column p-4">
              <h6 className="text-secondary text-uppercase fw-bold small mb-4 tracking-widest" style={{ letterSpacing: '1.5px', fontSize: '0.75rem' }}>Resume Match Score</h6>
              <div className="position-relative d-inline-block mx-auto mb-4" style={{ width: '100%', maxWidth: '160px', aspectRatio: '1/1' }}>
                <svg className="w-100 h-100" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="opacity-25"
                    stroke="rgba(255,255,255,0.2)"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" strokeWidth="2.5" strokeLinecap="round"
                  />
                  {/* Progress Arc */}
                  <path
                    className={scoreColor}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={`${scoreMatch}, 100`} strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)', filter: 'drop-shadow(0 0 8px currentColor)' }}
                  />
                </svg>
                <div className="position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center">
                  <span className={`fs-1 fw-bold lh-1 ${scoreColor}`}>{scoreMatch}</span>
                  <span className="text-secondary mt-1 fw-medium" style={{ fontSize: '12px' }}>/ 100</span>
                </div>
              </div>
              <p className="text-muted small mb-0 px-2 flex-grow-1 d-flex align-items-center justify-content-center" style={{ lineHeight: '1.6' }}>
                {data.summary}
              </p>
            </Card.Body>
          </Card>
        </div>

        {/* Skills Analysis */}
        <div className="col-lg-7 col-xl-8">
          <Card className="h-100 glass-panel border-0 border-opacity-25 rounded-4 shadow-lg overflow-hidden position-relative">
            <div className="position-absolute top-0 end-0 p-4 opacity-10">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            
            <Card.Body className="p-xl-5 p-4 position-relative z-index-1">
              <h5 className="text-white fw-bold mb-4 d-flex align-items-center">
                <div className="bg-primary bg-opacity-25 p-2 rounded-circle me-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                </div>
                Skill Gap Analysis
              </h5>
              
              <div className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-success fw-bold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Verified Skills ({data.skills.length})</span>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {data.skills.map((skill, i) => (
                    <span key={i} className="badge bg-success shadow-sm px-3 py-2 fw-medium rounded-pill border-0 text-success bg-opacity-10 backdrop-blur-sm" style={{ border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      {skill}
                    </span>
                  ))}
                  {data.skills.length === 0 && <span className="text-muted small">No specific core skills extracted.</span>}
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-warning fw-bold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Missing Competencies ({data.missingSkills.length})</span>
                </div>
                {data.missingSkills.length === 0 ? (
                  <div className="bg-success bg-opacity-10 text-success p-4 rounded-3 border border-success border-opacity-25 d-flex align-items-center shadow-sm">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="me-3 flex-shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <span className="fw-medium">Perfect match! No significant skill gaps detected against the provided description.</span>
                  </div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {data.missingSkills.map((skill, i) => (
                      <span key={i} className="badge bg-warning shadow-sm px-3 py-2 fw-medium rounded-pill border-0 text-warning bg-opacity-10 backdrop-blur-sm" style={{ border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="me-1"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* STAR Improvements */}
      <h4 className="text-white fw-bold mb-4 mt-5 d-flex align-items-center fade-in-delayed">
        <div className="bg-primary bg-opacity-25 p-2 rounded-circle me-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </div>
        Experience Bullet Rewrites <span className="text-muted ms-2 fw-normal fs-5">(STAR Method)</span>
      </h4>
      
      {data.experienceImprovements.length === 0 ? (
        <Alert variant="info" className="glass-panel border-0 text-muted shadow-sm fade-in-delayed">
          No major improvements suggested for your experience bullets. You're already following the STAR format effectively!
        </Alert>
      ) : (
        <div className="d-flex flex-column gap-4 mb-5 fade-in-delayed">
          {data.experienceImprovements.map((imp, i) => (
            <div key={i} className="glass-panel border border-secondary border-opacity-25 rounded-4 overflow-hidden position-relative shadow-sm transition-transform hover-lift">
              <div className="row g-0">
                <div className="col-12 col-md-6 border-end-md border-secondary border-opacity-25 border-bottom border-bottom-md-0 p-4 p-xl-5" style={{ background: 'rgba(5,5,5,0.4)' }}>
                  <div className="d-flex align-items-center mb-3">
                    <span className="badge bg-dark text-secondary border border-secondary border-opacity-50 px-3 py-1 shadow-sm" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>BEFORE</span>
                  </div>
                  <p className="text-muted small mb-0 lh-lg" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>"{imp.originalBullet}"</p>
                </div>
                
                {/* Arrow Divider Graphic for larger screens */}
                <div className="d-none d-md-flex position-absolute top-50 start-50 translate-middle align-items-center justify-content-center bg-primary rounded-circle shadow-lg z-index-2" style={{ width: '32px', height: '32px', border: '3px solid var(--bg-card)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </div>
                
                <div className="col-12 col-md-6 p-4 p-xl-5 position-relative">
                  <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
                    <span className="badge bg-primary px-3 py-1 text-white shadow-sm border-0 d-flex align-items-center" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="me-1"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      AFTER (IMPROVED)
                    </span>
                    <span className="text-success small fw-bold text-end d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                      {imp.reason}
                    </span>
                  </div>
                  <p className="text-white mb-0 lh-lg fs-6 fw-medium">"{imp.improvedBullet}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LinkedIn Summaries */}
      {data.linkedinSummaries && data.linkedinSummaries.length > 0 && (
        <div className="fade-in-delayed" style={{ animationDelay: '0.3s' }}>
          <h4 className="text-white fw-bold mb-4 mt-5 d-flex align-items-center">
            <div className="bg-primary bg-opacity-25 p-2 rounded-circle me-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </div>
            LinkedIn Summaries
          </h4>
          <div className="row g-4">
            {data.linkedinSummaries.map((summary, i) => (
              <div key={i} className="col-12 col-lg-6">
                <div className="glass-panel border-opacity-25 rounded-4 p-5 h-100 d-flex flex-column position-relative overflow-hidden group hover:border-accent shadow-sm transition-all duration-300">
                  <div className="position-absolute top-0 end-0 p-3 opacity-10">
                    <span className="fw-bold" style={{ fontSize: '4rem', lineHeight: '1', fontFamily: 'serif' }}>"</span>
                  </div>
                  <div className="text-primary fw-bold small text-uppercase mb-3 d-flex align-items-center" style={{ fontSize: '0.75rem', letterSpacing: '1.5px' }}>
                    <span className="badge bg-primary text-white px-3 py-1 rounded shadow-sm me-2 border-0">Option {i + 1}</span>
                  </div>
                  <p className="text-white lh-lg flex-grow-1 mb-4 position-relative z-index-1 fs-6" style={{ fontStyle: 'italic' }}>"{summary}"</p>
                  <button className="btn btn-outline-secondary w-100 fw-bold d-flex justify-content-center align-items-center rounded-3 bg-dark bg-opacity-50 border-secondary border-opacity-50 py-2" onClick={() => navigator.clipboard.writeText(summary)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Copy Profile Pitch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
