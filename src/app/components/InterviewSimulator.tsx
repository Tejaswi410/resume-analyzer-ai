"use client";

import React, { useState } from "react";
import { Button, Form, Spinner, Alert, Badge, ProgressBar } from "react-bootstrap";

interface InterviewSimulatorProps {
  resumeText: string;
}

interface Evaluation {
  critique: string;
  idealAnswer: string;
}

export default function InterviewSimulator({ resumeText }: InterviewSimulatorProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentAnswer, setCurrentAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  const generateQuestions = async () => {
    setLoadingQuestions(true);
    setError(null);
    try {
      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: resumeText })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to generate questions");
      }
      const data = await res.json();
      setQuestions(data.questions);
      setCurrentIndex(0);
      setEvaluation(null);
      setCurrentAnswer("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    setEvaluating(true);
    setError(null);
    try {
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: resumeText, 
          question: questions[currentIndex], 
          answer: currentAnswer 
        })
      });
      if (!res.ok) throw new Error("Failed to evaluate answer");
      const data = await res.json();
      setEvaluation(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer("");
      setEvaluation(null);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-5">
        <h4 className="fw-bold mb-3">Ready to practice?</h4>
        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '500px' }}>
          We will analyze your resume and generate 5 highly specific technical and behavioral questions to simulate a real interview.
        </p>
        {error && <Alert variant="danger" className="mb-4 text-start">{error}</Alert>}
        <Button size="lg" onClick={generateQuestions} disabled={loadingQuestions} variant="primary" className="fw-bold shadow-sm">
          {loadingQuestions ? <><Spinner size="sm" className="me-2" animation="border" /> Generating Questions...</> : "Start Interview Simulator"}
        </Button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progress = Math.round(((currentIndex) / questions.length) * 100);

  return (
    <div className="fade-in pt-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <div className="bg-primary rounded p-2 me-3 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
          </div>
          <div>
            <h5 className="mb-0 text-white fw-bold">Live Simulator</h5>
            <span className="text-success small fw-medium d-flex align-items-center">
              <span className="bg-success rounded-circle me-1" style={{ width: '6px', height: '6px' }}></span> Online
            </span>
          </div>
        </div>
        <Badge bg="dark" className="border border-secondary border-opacity-25 px-3 py-2 fw-medium text-secondary">
          Question {currentIndex + 1} of {questions.length}
        </Badge>
      </div>

      <ProgressBar now={progress} className="mb-5 bg-dark" style={{ height: '4px' }} variant="primary" />

      <div className="chat-container d-flex flex-column gap-4 mb-5">
        {/* AI Question Bubble */}
        <div className="d-flex align-items-start max-w-75">
          <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3 flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
          </div>
          <div className="bg-card border border-secondary border-opacity-25 p-4 rounded-4 rounded-top-0 shadow-sm">
            <p className="text-white mb-0 lh-lg font-monospace">{currentQ}</p>
          </div>
        </div>

        {/* User Answer Area OR Bubble */}
        {!evaluation ? (
          <div className="d-flex align-items-start flex-row-reverse align-self-end w-100 mt-3 fade-in">
            <div className="bg-secondary bg-opacity-10 rounded-circle p-2 ms-3 flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div className="w-100 max-w-75">
              <Form.Group className="mb-3">
                <Form.Control 
                  as="textarea" 
                  rows={4} 
                  placeholder="Draft your response here..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  disabled={evaluating}
                  className="bg-dark border-secondary border-opacity-50 text-white shadow-none rounded-4 rounded-top-0 p-3"
                  style={{ resize: 'none' }}
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="primary" size="sm" className="fw-bold px-4 rounded-pill" onClick={submitAnswer} disabled={evaluating || !currentAnswer.trim()}>
                  {evaluating ? <><Spinner size="sm" className="me-2" animation="border" /> Thinking...</> : "Send Answer"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* User Submitted Answer Bubble */}
            <div className="d-flex align-items-start flex-row-reverse align-self-end mt-3 fade-in">
              <div className="bg-secondary bg-opacity-10 rounded-circle p-2 ms-3 flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div className="bg-primary bg-opacity-10 border border-primary border-opacity-25 p-3 rounded-4 rounded-top-0 shadow-sm">
                <p className="text-white mb-0 lh-lg">{currentAnswer}</p>
              </div>
            </div>

            {/* AI Feedback Bubble */}
            <div className="d-flex align-items-start mt-3 fade-in">
              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3 flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
              </div>
              <div className="w-100 max-w-75">
                <div className="bg-card border border-secondary border-opacity-25 p-4 rounded-4 rounded-top-0 shadow-sm mb-3">
                  <h6 className="text-white fw-bold d-flex align-items-center mb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                    Critique
                  </h6>
                  <p className="text-secondary mb-0 lh-lg">{evaluation.critique}</p>
                </div>
                
                <div className="bg-success bg-opacity-10 border border-success border-opacity-25 p-4 rounded-4 shadow-sm">
                  <h6 className="text-success fw-bold d-flex align-items-center mb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    The Ideal Answer
                  </h6>
                  <p className="text-white mb-0 lh-lg"><em>&quot;{evaluation.idealAnswer}&quot;</em></p>
                </div>

                <div className="d-flex justify-content-end mt-4">
                  {currentIndex < questions.length - 1 ? (
                    <Button variant="primary" size="sm" className="fw-bold px-4 rounded-pill" onClick={nextQuestion}>Next Question ➔</Button>
                  ) : (
                    <Button variant="success" size="sm" className="fw-bold px-4 rounded-pill" onClick={() => setQuestions([])}>Finish Interview</Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
