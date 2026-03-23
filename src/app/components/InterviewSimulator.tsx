"use client";

import React, { useState, useRef, useEffect } from "react";
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

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const playAudio = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (questions.length > 0 && !evaluation) {
      playAudio(questions[currentIndex]);
    }
  }, [currentIndex, questions, evaluation]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    const formData = new FormData();
    formData.append("file", blob, "audio.webm");

    try {
      const res = await fetch("/api/interview/transcribe", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Transcription failed");
      const data = await res.json();
      setCurrentAnswer((prev) => (prev ? prev + " " + data.text : data.text));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to transcribe audio");
    } finally {
      setIsTranscribing(false);
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
      <div className="text-center py-5 glass-panel rounded-4 mt-4 shadow-lg p-5 border-opacity-25 fade-in">
        <div className="d-inline-flex bg-primary bg-opacity-25 p-4 rounded-circle mb-4 shadow-lg">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
        </div>
        <h3 className="fw-bold mb-3 text-white">Ready to practice your pitch?</h3>
        <p className="text-secondary mb-5 mx-auto fs-5" style={{ maxWidth: '580px', lineHeight: '1.6' }}>
          We will analyze your resume context and generate 5 highly specific technical and behavioral questions to dynamically simulate a real interview.
        </p>
        {error && <Alert variant="danger" className="mb-4 text-start border-0 rounded-4 shadow-sm">{error}</Alert>}
        <Button size="lg" onClick={generateQuestions} disabled={loadingQuestions} variant="primary" className="fw-bold py-3 px-5 shadow-sm rounded-pill pulse-glow text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.9rem' }}>
          {loadingQuestions ? (
            <><Spinner size="sm" className="me-3" animation="border" /> Generating Interview Protocol...</>
          ) : (
            "Start Interactive Simulator"
          )}
        </Button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progress = Math.round(((currentIndex) / questions.length) * 100);

  return (
    <div className="fade-in pt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <div className="bg-primary rounded p-3 me-3 shadow-md border border-primary border-opacity-25 flex-shrink-0 d-flex align-items-center justify-content-center pulse-glow" style={{ width: '48px', height: '48px', background: 'var(--accent-gradient)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
          </div>
          <div>
            <h5 className="mb-1 text-white fw-bold">Executive Interview Simulation</h5>
            <span className="text-success small fw-bold d-flex align-items-center text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>
              <span className="bg-success rounded-circle me-2 pulse-glow" style={{ width: '8px', height: '8px' }}></span> Active Session
            </span>
          </div>
        </div>
        <Badge bg="dark" className="border border-secondary border-opacity-50 px-4 py-2 fw-bold text-secondary rounded-pill shadow-sm" style={{ letterSpacing: '1px', fontSize: '0.75rem' }}>
          Q {currentIndex + 1} / {questions.length}
        </Badge>
      </div>

      <ProgressBar now={progress} className="mb-5 bg-dark rounded-pill border border-secondary border-opacity-25" style={{ height: '6px' }} variant="primary" />

      {error && <Alert variant="danger" className="mb-4 text-start border-0 rounded-4 shadow-sm">{error}</Alert>}

      <div className="chat-container d-flex flex-column gap-4 mb-5 pb-5">
        {/* AI Question Bubble */}
        <div className="d-flex align-items-start max-w-85 fade-in-delayed">
          <div className="bg-dark rounded-circle p-2 me-3 flex-shrink-0 shadow-sm border border-secondary border-opacity-50 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path></svg>
          </div>
          <div className="glass-panel p-4 shadow-sm position-relative" style={{ borderRadius: '4px 24px 24px 24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-white mb-0 lh-lg fs-5 fw-medium pe-4">{currentQ}</p>
            <Button size="sm" variant="outline-secondary" className="position-absolute top-0 end-0 m-2 border-0 opacity-75 hover-opacity-100 bg-transparent text-secondary p-2 rounded-circle" onClick={() => playAudio(currentQ)} title="Read Aloud">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            </Button>
          </div>
        </div>

        {/* User Answer Area OR Bubble */}
        {!evaluation ? (
          <div className="d-flex align-items-start flex-row-reverse align-self-end w-100 mt-4 fade-in-delayed" style={{ animationDelay: '0.2s' }}>
            <div className="bg-primary rounded-circle p-2 ms-3 flex-shrink-0 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', background: 'var(--accent-gradient)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div className="w-100 max-w-85">
              <Form.Group className="mb-3 position-relative shadow-lg">
                <Form.Control 
                  as="textarea" 
                  rows={5} 
                  placeholder="Draft your response here, or use the microphone to dictate..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  disabled={evaluating}
                  className="bg-dark bg-opacity-75 border-secondary border-opacity-50 text-white shadow-none p-4 fs-6"
                  style={{ resize: 'none', borderRadius: '24px 4px 24px 24px', letterSpacing: '0.3px', lineHeight: '1.6' }}
                />
              </Form.Group>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                  {isRecording ? (
                    <Button variant="danger" className="fw-bold px-4 rounded-pill me-2 d-flex align-items-center shadow-lg pulse-glow" onClick={stopRecording}>
                      <Spinner animation="grow" size="sm" className="me-3" /> Stop Recording
                    </Button>
                  ) : (
                    <Button variant="outline-primary" className="fw-bold px-4 rounded-pill me-2 d-flex align-items-center bg-dark bg-opacity-75 border-opacity-50" onClick={startRecording} disabled={evaluating || isTranscribing}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="me-2 text-primary"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
                      {isTranscribing ? "Transcribing Audio..." : "Dictate Answer"}
                    </Button>
                  )}
                </div>
                <Button variant="primary" className="fw-bold px-5 py-2 rounded-pill shadow-lg text-uppercase tracking-widest" style={{ letterSpacing: '1px', fontSize: '0.8rem' }} onClick={submitAnswer} disabled={evaluating || isTranscribing || !currentAnswer.trim()}>
                  {evaluating ? <><Spinner size="sm" className="me-3" animation="border" /> Analyzing Response...</> : "Submit Response ➔"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* User Submitted Answer Bubble */}
            <div className="d-flex align-items-start flex-row-reverse align-self-end mt-4 fade-in-delayed">
              <div className="bg-primary rounded-circle p-2 ms-3 flex-shrink-0 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', background: 'var(--accent-gradient)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div className="p-4 shadow-sm max-w-85" style={{ border: 'none', background: 'var(--accent-gradient)', borderRadius: '24px 4px 24px 24px' }}>
                <p className="text-white mb-0 lh-lg fs-6 fw-medium">{currentAnswer}</p>
              </div>
            </div>

            {/* AI Feedback Bubble */}
            <div className="d-flex align-items-start mt-5 fade-in-delayed" style={{ animationDelay: '0.3s' }}>
              <div className="bg-dark rounded-circle p-2 me-3 flex-shrink-0 shadow-sm border border-secondary border-opacity-50 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
              <div className="w-100 max-w-85">
                <div className="glass-panel p-4 p-md-5 shadow-lg mb-4" style={{ borderRadius: '4px 24px 24px 24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <h6 className="text-white fw-bold d-flex align-items-center mb-4 text-uppercase tracking-widest pb-3 border-bottom border-secondary border-opacity-25" style={{ letterSpacing: '2px', fontSize: '0.8rem' }}>
                    <div className="bg-primary bg-opacity-25 p-2 rounded me-3 text-primary">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                    </div>
                    Detailed Critique
                  </h6>
                  <p className="text-secondary mb-0 lh-lg fs-6">{evaluation.critique}</p>
                </div>
                
                <div className="p-4 p-md-5 shadow-lg position-relative overflow-hidden" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '24px' }}>
                  <div className="position-absolute top-0 end-0 p-4 opacity-10">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <h6 className="text-success fw-bold d-flex align-items-center mb-4 text-uppercase tracking-widest pb-3 border-bottom border-success border-opacity-25" style={{ letterSpacing: '2px', fontSize: '0.8rem' }}>
                    <div className="bg-success bg-opacity-25 p-2 rounded me-3 text-success">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    Ideal Answer Framework
                  </h6>
                  <p className="text-white mb-0 lh-lg fs-6 fst-italic position-relative z-index-1 pe-md-5">"{evaluation.idealAnswer}"</p>
                </div>

                <div className="d-flex justify-content-end mt-5 pt-3 border-top border-secondary border-opacity-25">
                  {currentIndex < questions.length - 1 ? (
                    <Button variant="primary" size="lg" className="fw-bold px-5 py-3 rounded-pill shadow-lg text-uppercase pulse-glow" style={{ letterSpacing: '2px', fontSize: '0.85rem' }} onClick={nextQuestion}>Next Question ➔</Button>
                  ) : (
                    <Button variant="success" size="lg" className="fw-bold px-5 py-3 rounded-pill shadow-lg text-uppercase pulse-glow bg-success border-0" style={{ letterSpacing: '2px', fontSize: '0.85rem' }} onClick={() => setQuestions([])}>Finish Interview Sequence</Button>
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
