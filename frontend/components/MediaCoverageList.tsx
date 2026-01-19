'use client';
import { ArticleCoverage } from '@/shared/types';

interface MediaCoverageListProps {
  coverages: ArticleCoverage[];
}

export default function MediaCoverageList({ coverages }: MediaCoverageListProps) {
  const getBiasColor = (bias?: string) => {
    switch (bias) {
      case 'left':
        return 'border-l-blue-500 bg-blue-50';
      case 'right':
        return 'border-l-red-500 bg-red-50';
      case 'center':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const getBiasLabel = (bias?: string) => {
    switch (bias) {
      case 'left':
        return 'Izquierda';
      case 'right':
        return 'Derecha';
      case 'center':
        return 'Centro';
      default:
        return 'Sin clasificar';
    }
  };

  // Group coverages by bias
  const groupedCoverages = coverages.reduce((acc, coverage) => {
    const bias = coverage.media_source?.bias_rating || coverage.media_bias || 'unknown';
    if (!acc[bias]) {
      acc[bias] = [];
    }
    acc[bias].push(coverage);
    return acc;
  }, {} as Record<string, typeof coverages>);

  const biasOrder = ['left', 'center', 'right'];

  if (coverages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Coberturas de Medios</h3>
        <p className="text-gray-500 text-center py-8">No hay coberturas disponibles para esta noticia</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-6">Coberturas de Medios</h3>
      <div className="space-y-6">
        {biasOrder.map((bias) => {
          const coveragesForBias = groupedCoverages[bias] || [];
          if (coveragesForBias.length === 0) return null;

          return (
            <div key={bias} className="space-y-3">
              <h4 className="font-medium text-gray-700 capitalize">
                {getBiasLabel(bias)} ({coveragesForBias.length})
              </h4>
              <div className="space-y-2">
                {coveragesForBias.map((coverage) => (
                  <a
                    key={coverage.id}
                    href={coverage.coverage_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block p-4 rounded border-l-4 ${getBiasColor(bias)} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {(coverage.media_source?.logo_url || coverage.media_logo) && (
                            <img
                              src={(coverage.media_source?.logo_url || coverage.media_logo)?.startsWith('http')
                                ? (coverage.media_source?.logo_url || coverage.media_logo)
                                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${coverage.media_source?.logo_url || coverage.media_logo}`}
                              alt={coverage.media_source?.name || coverage.media_name || ''}
                              className="h-6 w-auto object-contain"
                              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <h5 className="font-semibold text-gray-900">
                            {coverage.coverage_title}
                          </h5>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {coverage.media_source?.name || coverage.media_name}
                        </p>
                        {coverage.snippet && (
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {coverage.snippet}
                          </p>
                        )}
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
