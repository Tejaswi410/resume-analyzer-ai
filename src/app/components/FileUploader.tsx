"use client";

import React, { useState } from "react";
import { Form, Button, Card, Spinner, Alert } from "react-bootstrap";

interface FileUploaderProps {
  onParsed: (text: string) => void;
}

export default function FileUploader({ onParsed }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovered(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovered(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovered(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let backendError = "Failed to parse document.";
        try {
          const errData = await response.json();
          if (errData.error) backendError = errData.error;
        } catch {}
        throw new Error(backendError);
      }

      const data = await response.json();
      onParsed(data.text);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-none border-0 bg-transparent mb-4">
      <Card.Body className="p-0">
        <Form onSubmit={handleUpload}>
          <div 
            className={`dropzone mb-4 ${isHovered || file ? 'active' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('fileUploadInput')?.click()}
          >
            <div className={`mb-3 transition-transform ${isHovered || file ? 'scale-110' : ''}`} style={{ transition: 'transform 0.3s ease' }}>
              <div className="d-inline-flex bg-primary bg-opacity-10 p-4 rounded-circle mb-2">
                {file ? (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                ) : (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                )}
              </div>
            </div>
            
            <h5 className={`fw-bold mb-2 tracking-tight ${file ? 'text-primary' : 'text-white'}`}>
              {file ? file.name : "Click or drag resume here"}
            </h5>
            <p className="text-secondary small mb-0 px-4" style={{ lineHeight: '1.6' }}>
              {file ? "File ready for analysis." : "Upload your resume in PDF, DOCX, or TXT format. We'll automatically extract the text."}
            </p>
            
            <Form.Control 
              id="fileUploadInput"
              type="file" 
              className="d-none"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" 
              onChange={handleFileChange} 
            />
          </div>
          
          {error && (
            <Alert variant="danger" className="border-0 py-3 px-4 d-flex align-items-center rounded-4 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-3 flex-shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{error}</span>
            </Alert>
          )}
          
          <Button 
            variant="primary" 
            size="lg" 
            className={`w-100 fw-bold py-3 px-4 rounded-3 d-flex justify-content-center align-items-center mt-2 ${file && !loading ? 'pulse-glow' : ''}`} 
            type="submit" 
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-3 text-white" />
                <span>Processing Document Details...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="me-2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                Analyze Resume Instantly
              </>
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
