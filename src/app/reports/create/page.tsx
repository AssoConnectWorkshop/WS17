'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SectionSelector from '@/app/components/SectionSelector';
import type { ReportSectionType } from '@/lib/types';

export default function CreateReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    period_from: '',
    period_to: '',
    template_type: 'activity' as const,
  });

  const [selectedSections, setSelectedSections] = useState<ReportSectionType[]>([
    'summary',
    'members',
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const orgResponse = await fetch('/api/organization');
      if (!orgResponse.ok) throw new Error('Failed to fetch organization');
      const org = await orgResponse.json();

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: org.id || org['@id'],
          ...formData,
        }),
      });

      if (!response.ok) throw new Error('Failed to create report');

      const report = await response.json();

      // Create sections
      for (let i = 0; i < selectedSections.length; i++) {
        const sectionType = selectedSections[i];
        const sectionResponse = await fetch(`/api/reports/${report.id}/sections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            section_type: sectionType,
            order: i,
          }),
        });

        if (!sectionResponse.ok) {
          console.error('Failed to create section:', sectionType);
        }
      }

      router.push(`/reports/${report.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const lastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
    .toISOString()
    .split('T')[0];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Créer un nouveau rapport</h1>
          <p className="text-gray-600">Remplissez les informations de base pour votre rapport d&apos;activité</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <p className="font-medium">Erreur</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre du rapport *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ex: Rapport d'activité 2025"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnel)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez les objectifs ou le contenu du rapport"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="period_from" className="block text-sm font-medium text-gray-700 mb-2">
                  Début de la période *
                </label>
                <input
                  type="date"
                  id="period_from"
                  name="period_from"
                  value={formData.period_from}
                  onChange={handleInputChange}
                  defaultValue={lastYear}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="period_to" className="block text-sm font-medium text-gray-700 mb-2">
                  Fin de la période *
                </label>
                <input
                  type="date"
                  id="period_to"
                  name="period_to"
                  value={formData.period_to}
                  onChange={handleInputChange}
                  defaultValue={today}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="template_type" className="block text-sm font-medium text-gray-700 mb-2">
                Type de rapport *
              </label>
              <select
                id="template_type"
                name="template_type"
                value={formData.template_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="activity">Rapport d&apos;activité</option>
                <option value="annual">Rapport annuel</option>
                <option value="membership">Rapport d&apos;adhésion</option>
              </select>
            </div>

            <div className="border-t pt-6">
              <SectionSelector
                selectedSections={selectedSections}
                onChange={setSelectedSections}
              />
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Création en cours...' : 'Créer le rapport'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
