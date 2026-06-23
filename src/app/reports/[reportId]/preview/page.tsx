'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { ReportWithRelations } from '@/lib/types';

export default function ReportPreviewPage() {
  const params = useParams();
  const reportId = params.reportId as string;

  const [report, setReport] = useState<ReportWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}`);
        if (!response.ok) throw new Error('Failed to fetch report');

        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/generate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const data = await response.json();
      if (data.pdf_url) {
        window.open(data.pdf_url, '_blank');
      }
      alert('PDF généré avec succès!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setGenerating(false);
    }
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
        <div className="max-w-6xl mx-auto text-center py-12">
          <p className="text-gray-600">Chargement de l&apos;aperçu...</p>
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href={`/reports/${reportId}`} className="text-blue-600 hover:underline flex items-center gap-2">
            ← Retour à l&apos;édition
          </Link>
          <button
            onClick={handleGeneratePDF}
            disabled={generating}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {generating ? 'Génération en cours...' : '📥 Télécharger PDF'}
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p className="font-medium">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Print-friendly preview */}
        <div className="bg-white rounded-lg shadow p-12 print:shadow-none print:p-0">
          <div className="border-b pb-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{report.title}</h1>
            {report.description && (
              <p className="text-lg text-gray-600 mb-4">{report.description}</p>
            )}
            <div className="text-sm text-gray-500 space-y-1">
              <p>
                Période: {formatDate(report.period_from)} - {formatDate(report.period_to)}
              </p>
              <p>Type: {report.template_type}</p>
              <p>Généré le: {formatDate(new Date().toISOString())}</p>
            </div>
          </div>

          {/* Summary section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Résumé</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600">
                Ce rapport couvre la période du {formatDate(report.period_from)} au{' '}
                {formatDate(report.period_to)}.
              </p>
              {report.documents.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-gray-900 mb-2">Documents joints:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {report.documents.map((doc) => (
                      <li key={doc.id}>
                        {doc.filename} ({(doc.file_size / 1024).toFixed(2)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Sections */}
          {report.sections.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sections</h2>
              <div className="space-y-6">
                {report.sections.map((section) => (
                  <div key={section.id} className="border-l-4 border-blue-500 pl-6 py-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {section.section_type}
                    </h3>
                    {section.content && Object.keys(section.content).length > 0 && (
                      <pre className="bg-gray-50 p-4 rounded text-xs text-gray-600 overflow-auto">
                        {JSON.stringify(section.content, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-8 text-center text-sm text-gray-500">
            <p>Rapport généré automatiquement par AssoConnect Activity Reports</p>
          </div>
        </div>
      </div>
    </main>
  );
}
