'use client';

import { useState } from 'react';
import type { ReportDocument } from '@/lib/types';

interface DocumentListProps {
  documents: (ReportDocument & { url?: string })[];
  onDelete?: (documentId: string) => void;
}

export default function DocumentList({ documents, onDelete }: DocumentListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document?')) return;

    setDeleting(documentId);
    try {
      const response = await fetch(`/api/reports/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete document');
      if (onDelete) onDelete(documentId);
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Erreur lors de la suppression du document');
    } finally {
      setDeleting(null);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word')) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Aucun document uploadé</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between gap-4 bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">{getFileIcon(doc.file_type)}</span>
            <div className="min-w-0 flex-1">
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium truncate block"
              >
                {doc.filename}
              </a>
              <p className="text-sm text-gray-500">
                {formatFileSize(doc.file_size)} • {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDelete(doc.id)}
            disabled={deleting === doc.id}
            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {deleting === doc.id ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      ))}
    </div>
  );
}
