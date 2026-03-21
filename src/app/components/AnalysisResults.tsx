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

  return (
    <div className="fade-in">
      <div className="row mb-4">
        {/* Score & Summary */}
        <div className="col-lg-4 mb-4 mb-lg-0">
          <Card className="h-100 border-0 shadow-sm bg-transparent">
            <Card.Body className="d-flex flex-column p-0">
              <div className="bg-card rounded p-4 mb-3 border border-secondary border-opacity-25 text-center flex-grow-1 d-flex flex-column justify-content-center">
                <h6 className="text-secondary text-uppercase fw-bold small mb-3" style={{ letterSpacing: '1px' }}>Resume Match Score</h6>
                <div className="position-relative d-inline-block mx-auto mb-3" style={{ width: '120px', height: '120px' }}>
                  <svg className="w-100 h-100" viewBox="0 0 36 36">
                    <path
                      className="text-secondary opacity-25"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="100, 100"
                    />
                    <path
                      className="text-primary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${scoreMatch}, 100`}
                    />
                  </svg>
                  <div className="position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center">
                    <span className="fs-2 fw-bold text-white lh-1">{scoreMatch}</span>
                    <span className="text-muted" style={{ fontSize: '10px' }}>/ 100</span>
                  </div>
                </div>
                <p className="text-muted small mb-0 px-2">{data.summary}</p>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Skills Analysis */}
        <div className="col-lg-8">
          <Card className="h-100 border-0 shadow-sm bg-card">
            <Card.Body className="p-4">
              <h6 className="text-white fw-bold mb-4 d-flex align-items-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                Skill Gap Analysis
              </h6>
              
              <div className="mb-4">
                <div className="d-flex justify-content-between text-muted small fw-bold mb-2">
                  <span className="text-success">Verified Skills ({data.skills.length})</span>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {data.skills.map((skill, i) => (
                    <span key={i} className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 fw-medium">{skill}</span>
                  ))}
                  {data.skills.length === 0 && <span className="text-muted small">No specific core skills extracted.</span>}
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between text-muted small fw-bold mb-2">
                  <span className="text-danger">Missing Competencies ({data.missingSkills.length})</span>
                </div>
                {data.missingSkills.length === 0 ? (
                  <div className="bg-success bg-opacity-10 text-success p-3 rounded small border border-success border-opacity-25">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    Perfect match! No significant skill gaps detected against the provided description.
                  </div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {data.missingSkills.map((skill, i) => (
                      <span key={i} className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 fw-medium">{skill}</span>
                    ))}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* STAR Improvements */}
      <h6 className="text-white fw-bold mb-3 mt-5 d-flex align-items-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        Experience Bullet Rewrites (STAR Method)
      </h6>
      
      {data.experienceImprovements.length === 0 ? (
        <Alert variant="info" className="bg-card border-0 text-muted">No major improvements suggested for your experience bullets.</Alert>
      ) : (
        <div className="d-flex flex-column gap-3 mb-5">
          {data.experienceImprovements.map((imp, i) => (
            <div key={i} className="bg-card border border-secondary border-opacity-25 rounded overflow-hidden">
              <div className="row g-0">
                <div className="col-md-6 border-end border-secondary border-opacity-25 border-end-sm-0 border-bottom-sm p-4 bg-dark bg-opacity-50">
                  <div className="d-flex align-items-center mb-2">
                    <span className="badge bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-50 me-2" style={{ fontSize: '0.65rem' }}>BEFORE</span>
                  </div>
                  <p className="text-muted small mb-0 lh-lg font-monospace">{imp.originalBullet}</p>
                </div>
                <div className="col-md-6 p-4 position-relative">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 me-2" style={{ fontSize: '0.65rem' }}>AFTER</span>
                    <span className="text-success small fw-medium text-end" style={{ fontSize: '0.75rem' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                      {imp.reason}
                    </span>
                  </div>
                  <p className="text-white mb-0 lh-lg">{imp.improvedBullet}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LinkedIn Summaries */}
      {data.linkedinSummaries && data.linkedinSummaries.length > 0 && (
        <>
          <h6 className="text-white fw-bold mb-3 mt-5 d-flex align-items-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            Generated LinkedIn Summaries
          </h6>
          <div className="row g-3">
            {data.linkedinSummaries.map((summary, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4">
                <div className="bg-card border border-secondary border-opacity-25 rounded p-4 h-100 d-flex flex-column">
                  <div className="text-muted fw-bold small text-uppercase mb-3" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Option {i + 1}</div>
                  <p className="text-secondary small lh-lg flex-grow-1 mb-0">{summary}</p>
                  <button className="btn btn-sm btn-outline-secondary mt-4 w-100 border-opacity-25" onClick={() => navigator.clipboard.writeText(summary)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
