'use client';

import type { ReportSectionType } from '@/lib/types';

interface SectionSelectorProps {
  selectedSections: ReportSectionType[];
  onChange: (sections: ReportSectionType[]) => void;
}

const AVAILABLE_SECTIONS: { id: ReportSectionType; label: string; description: string }[] = [
  {
    id: 'summary',
    label: 'Résumé',
    description: 'Vue d\'ensemble et infos principales',
  },
  {
    id: 'members',
    label: 'Adhérents',
    description: 'Statistiques sur les adhérents et leur évolution',
  },
  {
    id: 'activities',
    label: 'Activités',
    description: 'Résumé des activités effectuées',
  },
  {
    id: 'events',
    label: 'Événements',
    description: 'Événements marquants et importants',
  },
  {
    id: 'financials',
    label: 'Finances',
    description: 'Données financières et budgétaires',
  },
];

export default function SectionSelector({ selectedSections, onChange }: SectionSelectorProps) {
  const toggleSection = (sectionId: ReportSectionType) => {
    if (selectedSections.includes(sectionId)) {
      onChange(selectedSections.filter((s) => s !== sectionId));
    } else {
      onChange([...selectedSections, sectionId]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-4">
        Sections à inclure dans le rapport
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {AVAILABLE_SECTIONS.map((section) => (
          <label
            key={section.id}
            className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedSections.includes(section.id)}
              onChange={() => toggleSection(section.id)}
              className="mt-1 w-4 h-4 rounded border-gray-300"
            />
            <div>
              <p className="font-medium text-gray-900">{section.label}</p>
              <p className="text-sm text-gray-500">{section.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
