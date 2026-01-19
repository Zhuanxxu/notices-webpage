import { notFound } from 'next/navigation';
import { Article } from '@/shared/types';
import BiasChart from '@/components/BiasChart';
import MediaCoverageList from '@/components/MediaCoverageList';

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/articles/slug/${slug}`, {
      cache: 'no-store',
    });
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);

  if (!article || article.status !== 'published') {
    notFound();
  }

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/" className="text-indigo-600 hover:text-indigo-800">
            ← Volver a noticias
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {article.cover_image && (
            <div className="w-full h-64 md:h-96 overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${article.cover_image}`}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-semibold px-3 py-1 rounded ${getBiasColor(article.classification?.political_bias)}`}>
                {getBiasLabel(article.classification?.political_bias)}
              </span>
              <time className="text-sm text-gray-500">
                {formatDate(article.published_at || article.created_at)}
              </time>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-xl text-gray-600 mb-4 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            {article.location && (
              <div className="mb-4 flex items-center text-sm text-gray-600">
                <span className="inline-flex items-center">
                  📍 {article.location}
                </span>
              </div>
            )}

            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-block px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className="prose max-w-none mb-8">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {article.content}
              </div>
            </div>

            {article.editor_content && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Análisis Editorial
                </h2>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-indigo-50 p-6 rounded-lg">
                    {article.editor_content}
                  </div>
                </div>
              </div>
            )}
          </div>
        </article>

        {article.coverages && article.coverages.length > 0 && (
          <div className="mt-8 space-y-6">
            <BiasChart coverages={article.coverages} />
            <MediaCoverageList coverages={article.coverages} />
          </div>
        )}
      </main>
    </div>
  );
}
