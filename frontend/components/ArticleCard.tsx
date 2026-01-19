import Link from 'next/link';
import { Article } from '@/shared/types';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getBiasColor = (bias?: string) => {
    switch (bias) {
      case 'left':
        return 'bg-blue-100 text-blue-800';
      case 'right':
        return 'bg-red-100 text-red-800';
      case 'center':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <Link href={`/article/${article.slug}`}>
      <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded ${getBiasColor(article.classification?.political_bias)}`}>
              {getBiasLabel(article.classification?.political_bias)}
            </span>
            <time className="text-sm text-gray-500">
              {formatDate(article.published_at || article.created_at)}
            </time>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
            {article.title}
          </h2>
          {article.excerpt ? (
            <p className="text-gray-600 line-clamp-3 mb-3">
              {article.excerpt}
            </p>
          ) : (
            <p className="text-gray-600 line-clamp-3 mb-3">
              {article.content.substring(0, 200)}...
            </p>
          )}
          
          {article.location && (
            <div className="mb-2">
              <span className="inline-flex items-center text-xs text-gray-600">
                📍 {article.location}
              </span>
            </div>
          )}

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded"
                >
                  {tag.name}
                </span>
              ))}
              {article.tags.length > 3 && (
                <span className="inline-block px-2 py-1 text-xs font-medium text-gray-600">
                  +{article.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {article.coverages && article.coverages.length > 0 && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>{article.coverages.length} cobertura(s) de medios</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
