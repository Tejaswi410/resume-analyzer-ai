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
            className={`dropzone mb-4 ${isHovered ? 'active' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('fileUploadInput')?.click()}
          >
            <div className="mb-3">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <h5 className="fw-bold text-light mb-2">
              {file ? file.name : "Click or drag resume here"}
            </h5>
            <p className="text-muted small mb-0">
              Supported formats: PDF, DOCX, TXT.
            </p>
            <Form.Control 
              id="fileUploadInput"
              type="file" 
              className="d-none"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" 
              onChange={handleFileChange} 
            />
          </div>
          
          {error && <Alert variant="danger" className="border-0 bg-danger bg-opacity-10 text-danger">{error}</Alert>}
          
          <Button variant="primary" size="lg" className="w-100 fw-bold" type="submit" disabled={!file || loading}>
            {loading ? (
              <div className="d-flex justify-content-center align-items-center">
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2 text-white" />
                <span>Processing Document...</span>
              </div>
            ) : "Analyze Resume"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
