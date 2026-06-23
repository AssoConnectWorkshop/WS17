'use client';

import { useState } from 'react';
import type { ReportDocument } from '@/lib/types';

interface DocumentUploadProps {
  reportId: string;
  onUploadComplete?: (document: ReportDocument & { url: string }) => void;
}

export default function DocumentUpload({ reportId, onUploadComplete }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
  };

  const uploadFiles = async (files: FileList) => {
    setUploading(true);
    setError(null);
    setSuccess(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('reportId', reportId);

      try {
        const response = await fetch('/api/reports/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const data = await response.json();
        setSuccess(`${file.name} uploadé avec succès`);

        if (onUploadComplete && data.document) {
          onUploadComplete(data.document);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-2"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-8-8l-3.172-3.172a2 2 0 00-2.828 0L28 12m0 0l-6-6m6 6v16"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-gray-700 font-medium mb-2">Déposez vos documents ici</p>
        <p className="text-sm text-gray-500 mb-4">&ndash; ou &ndash;</p>
        <label className="inline-block">
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.gif,.docx"
          />
          <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:bg-gray-400">
            {uploading ? 'Upload en cours...' : 'Sélectionner des fichiers'}
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-4">
          Formats supportés: PDF, PNG, JPEG, GIF, DOCX (max 10 MB)
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-medium">Erreur d&apos;upload</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          <p className="font-medium">✓ {success}</p>
        </div>
      )}
    </div>
  );
}
