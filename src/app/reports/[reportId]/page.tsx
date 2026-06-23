'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DocumentUpload from '@/app/components/DocumentUpload';
import DocumentList from '@/app/components/DocumentList';
import type { ReportWithRelations, ReportDocument } from '@/lib/types';

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params.reportId as string;

  const [report, setReport] = useState<ReportWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [documents, setDocuments] = useState<(ReportDocument & { url?: string })[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft' as const,
  });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}`);
        if (!response.ok) throw new Error('Failed to fetch report');

        const data = await response.json();
        setReport(data);
        setDocuments(data.documents || []);
        setFormData({
          title: data.title,
          description: data.description || '',
          status: data.status,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update report');

      const updatedReport = await response.json();
      setReport({
        ...updatedReport,
        documents: report?.documents || [],
        sections: report?.sections || [],
      });

      alert('Rapport sauvegardé avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setUpdating(false);
    }
  };

  const handleUploadComplete = (document: ReportDocument & { url: string }) => {
    setDocuments([...documents, document]);
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(documents.filter((doc) => doc.id !== documentId));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-gray-600">Chargement du rapport...</p>
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
            <p className="font-medium">Rapport non trouvé</p>
            <Link href="/reports" className="text-red-600 hover:underline mt-2 inline-block">
              ← Retour à la liste
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/reports" className="text-blue-600 hover:underline flex items-center gap-2">
            ← Retour à la liste
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <p className="font-medium">Erreur</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <h1 className="text-4xl font-bold text-gray-900 mb-6">Éditer le rapport</h1>

          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre du rapport
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Période: {formatDate(report.period_from)} - {formatDate(report.period_to)}
                </label>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Brouillon</option>
                  <option value="completed">Complété</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Documents</h2>
              <div className="space-y-4">
                <DocumentUpload reportId={reportId} onUploadComplete={handleUploadComplete} />
                <DocumentList documents={documents} onDelete={handleDeleteDocument} />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border-t">
              <h3 className="font-medium text-gray-900 mb-2">Informations du rapport</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Type: {report.template_type}</p>
                <p>Sections: {report.sections.length}</p>
                <p>Créé le: {formatDate(report.created_at)}</p>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={handleSave}
                disabled={updating}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {updating ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
              </button>
              <Link
                href={`/reports/${reportId}/preview`}
                className="flex-1 bg-green-100 text-green-700 px-6 py-3 rounded-lg font-medium hover:bg-green-200 transition-colors text-center"
              >
                Aperçu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
