import Link from 'next/link';
import { getOrganization } from '@/lib/assoconnect';
import { getReports } from '@/lib/reports';
import type { Report } from '@/lib/types';

export default async function ReportsPage() {
  let reports: Report[] = [];
  let error: string | null = null;

  try {
    const org = await getOrganization();
    const orgId = org['@id'] || '';
    reports = await getReports(orgId);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Rapports d&apos;Activité</h1>
            <p className="text-gray-600">Gérez et créez les rapports d&apos;activité de votre association</p>
          </div>
          <Link
            href="/reports/create"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            + Nouveau Rapport
          </Link>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
            <p className="font-medium">Erreur</p>
            <p>{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-6">Aucun rapport créé pour le moment.</p>
            <Link
              href="/reports/create"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Créer le premier rapport
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{report.title}</h2>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(report.status)}`}
                      >
                        {report.status}
                      </span>
                    </div>
                    {report.description && (
                      <p className="text-gray-600 mb-3">{report.description}</p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>
                        📅 {formatDate(report.period_from)} - {formatDate(report.period_to)}
                      </span>
                      <span>Type: {report.template_type}</span>
                      <span>Créé le {formatDate(report.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/reports/${report.id}`}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                    >
                      Éditer
                    </Link>
                    {report.pdf_url && (
                      <a
                        href={report.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors"
                      >
                        PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
