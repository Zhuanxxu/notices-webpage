import ArticleCard from '@/components/ArticleCard';
import { Article } from '@/shared/types';

async function getArticles(): Promise<Article[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/articles?published=true&limit=20`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export default async function HomePage() {
  const articles = await getArticles();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Página de Noticias</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg shadow-md p-6 mb-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              La realidad no se cuenta igual desde todos lados.
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p className="text-base">
                Cada medio selecciona, enfatiza y opina. Por eso, una noticia nunca es solo un titular. En este proyecto juntamos coberturas de distintos portales, las clasificamos por orientación ideológica y analizamos cómo cambia la narrativa según quién la escribe.
              </p>
              <p className="text-base">
                Además de mostrar fuentes, agregamos nuestra propia lectura: contexto, comparación y opinión. Queremos que leer noticias no sea solo consumir información, sino entenderla. <span className="font-semibold text-indigo-700">Menos ruido, más perspectiva.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Noticias Section */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay noticias publicadas aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
