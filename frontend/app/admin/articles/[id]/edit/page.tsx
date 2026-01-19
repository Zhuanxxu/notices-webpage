'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Article, MediaSource, ArticleCoverage, Tag } from '@/shared/types';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [mediaSources, setMediaSources] = useState<MediaSource[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [coverages, setCoverages] = useState<ArticleCoverage[]>([]);
  const [showCoverageForm, setShowCoverageForm] = useState(false);
  const [editingCoverageId, setEditingCoverageId] = useState<number | null>(null);
  const [coverageForm, setCoverageForm] = useState({
    media_source_id: '',
    coverage_url: '',
    coverage_title: '',
    snippet: '',
  });

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    editor_content: '',
    status: 'draft' as 'draft' | 'published',
    political_bias: '' as '' | 'left' | 'center' | 'right',
    location: '',
  });

  useEffect(() => {
    fetchData();
  }, [articleId]);

  const fetchData = async () => {
    try {
      const [articleRes, mediaRes, tagsRes, coveragesRes] = await Promise.all([
        api.get<Article>(`/articles/${articleId}`),
        api.get<MediaSource[]>('/media-sources'),
        api.get<Tag[]>('/tags'),
        api.get<ArticleCoverage[]>(`/coverages/article/${articleId}`),
      ]);

      const articleData = articleRes.data;
      setArticle(articleData);
      setFormData({
        title: articleData.title,
        content: articleData.content,
        excerpt: articleData.excerpt || '',
        editor_content: articleData.editor_content || '',
        status: articleData.status,
        political_bias: articleData.classification?.political_bias || '',
        location: articleData.location || '',
      });
      setCoverImage(articleData.cover_image || null);
      setMediaSources(mediaRes.data);
      setTags(tagsRes.data);
      setSelectedTagIds(articleData.tags?.map(t => t.id) || []);
      setCoverages(coveragesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error al cargar la noticia');
      router.push('/admin/articles');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await response.json();
      setCoverImage(data.filePath);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: any = {
        title: formData.title,
        content: formData.content,
        status: formData.status,
      };

      if (formData.excerpt) {
        payload.excerpt = formData.excerpt;
      }

      if (formData.editor_content) {
        payload.editor_content = formData.editor_content;
      }

      if (coverImage !== null) {
        payload.cover_image = coverImage;
      }

      if (formData.political_bias) {
        payload.political_bias = formData.political_bias;
      }

      if (formData.location) {
        payload.location = formData.location;
      }

      payload.tag_ids = selectedTagIds;

      await api.put(`/articles/${articleId}`, payload);
      await fetchData();
      alert('Noticia actualizada correctamente');
    } catch (error: any) {
      console.error('Error updating article:', error);
      alert(error.response?.data?.error || 'Error al actualizar la noticia');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCoverage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCoverageId) {
        await api.put(`/coverages/${editingCoverageId}`, {
          ...coverageForm,
          media_source_id: parseInt(coverageForm.media_source_id),
        });
      } else {
        await api.post('/coverages', {
          article_id: articleId,
          ...coverageForm,
          media_source_id: parseInt(coverageForm.media_source_id),
        });
      }
      setCoverageForm({
        media_source_id: '',
        coverage_url: '',
        coverage_title: '',
        snippet: '',
      });
      setShowCoverageForm(false);
      setEditingCoverageId(null);
      fetchData();
    } catch (error: any) {
      console.error('Error saving coverage:', error);
      alert(error.response?.data?.error || `Error al ${editingCoverageId ? 'actualizar' : 'agregar'} cobertura`);
    }
  };

  const handleEditCoverage = (coverage: ArticleCoverage) => {
    setCoverageForm({
      media_source_id: coverage.media_source_id?.toString() || '',
      coverage_url: coverage.coverage_url,
      coverage_title: coverage.coverage_title,
      snippet: coverage.snippet || '',
    });
    setEditingCoverageId(coverage.id);
    setShowCoverageForm(true);
  };

  const handleCancelCoverage = () => {
    setCoverageForm({
      media_source_id: '',
      coverage_url: '',
      coverage_title: '',
      snippet: '',
    });
    setEditingCoverageId(null);
    setShowCoverageForm(false);
  };

  const handleDeleteCoverage = async (id: number) => {
    if (!confirm('¿Eliminar esta cobertura?')) return;
    try {
      await api.delete(`/coverages/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting coverage:', error);
      alert('Error al eliminar cobertura');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Noticia</h2>

          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Título *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                  Subtítulo / Breve Descripción
                </label>
                <textarea
                  id="excerpt"
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Breve descripción que aparecerá en la página principal (opcional)"
                  maxLength={500}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">{formData.excerpt.length}/500 caracteres</p>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Contenido *
                </label>
                <textarea
                  id="content"
                  required
                  rows={10}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700">
                  Foto de Portada
                </label>
                <input
                  type="file"
                  id="cover_image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {uploadingImage && (
                  <p className="mt-2 text-sm text-gray-500">Subiendo imagen...</p>
                )}
                {coverImage && (
                  <div className="mt-4">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${coverImage}`}
                      alt="Vista previa"
                      className="max-w-md h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImage(null)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Eliminar imagen
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="editor_content" className="block text-sm font-medium text-gray-700">
                  Redacción Editorial
                </label>
                <textarea
                  id="editor_content"
                  rows={6}
                  value={formData.editor_content}
                  onChange={(e) => setFormData({ ...formData, editor_content: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Estado
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="draft">Borrador</option>
                    <option value="published">Publicada</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="political_bias" className="block text-sm font-medium text-gray-700">
                    Sesgo Político
                  </label>
                  <select
                    id="political_bias"
                    value={formData.political_bias}
                    onChange={(e) => setFormData({ ...formData, political_bias: e.target.value as '' | 'left' | 'center' | 'right' })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Sin clasificar</option>
                    <option value="left">Izquierda</option>
                    <option value="center">Centro</option>
                    <option value="right">Derecha</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Ubicación (Ciudad o Provincia)
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ej: Buenos Aires, Córdoba, etc."
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags / Categorías
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center space-x-2 p-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTagIds.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTagIds([...selectedTagIds, tag.id]);
                          } else {
                            setSelectedTagIds(selectedTagIds.filter((id) => id !== tag.id));
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </form>

          {/* Coberturas de Medios */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Coberturas de Medios</h3>
              <button
                onClick={() => {
                  if (showCoverageForm) {
                    handleCancelCoverage();
                  } else {
                    setShowCoverageForm(true);
                  }
                }}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                {showCoverageForm ? 'Cancelar' : '+ Agregar Cobertura'}
              </button>
            </div>

            {showCoverageForm && (
              <form onSubmit={handleAddCoverage} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  {editingCoverageId ? 'Editar Cobertura' : 'Nueva Cobertura'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Medio</label>
                    <select
                      required
                      value={coverageForm.media_source_id}
                      onChange={(e) => setCoverageForm({ ...coverageForm, media_source_id: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"
                    >
                      <option value="">Seleccionar medio</option>
                      {mediaSources.map((source) => (
                        <option key={source.id} value={source.id}>
                          {source.name} ({source.bias_rating})
                        </option>
                      ))}
                    </select>
                    {coverageForm.media_source_id && (
                      <div className="mt-2 flex items-center gap-2">
                        {mediaSources.find(s => s.id.toString() === coverageForm.media_source_id)?.logo_url && (
                          <img
                            src={mediaSources.find(s => s.id.toString() === coverageForm.media_source_id)?.logo_url?.startsWith('http')
                              ? mediaSources.find(s => s.id.toString() === coverageForm.media_source_id)?.logo_url
                              : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${mediaSources.find(s => s.id.toString() === coverageForm.media_source_id)?.logo_url}`}
                            alt={mediaSources.find(s => s.id.toString() === coverageForm.media_source_id)?.name}
                            className="h-8 w-auto object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <span className="text-sm text-gray-600">
                          {mediaSources.find(s => s.id.toString() === coverageForm.media_source_id)?.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL de Cobertura *</label>
                    <input
                      type="url"
                      required
                      value={coverageForm.coverage_url}
                      onChange={(e) => setCoverageForm({ ...coverageForm, coverage_url: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Título de Cobertura *</label>
                    <input
                      type="text"
                      required
                      value={coverageForm.coverage_title}
                      onChange={(e) => setCoverageForm({ ...coverageForm, coverage_title: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Snippet (opcional)</label>
                    <textarea
                      rows={3}
                      value={coverageForm.snippet}
                      onChange={(e) => setCoverageForm({ ...coverageForm, snippet: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      {editingCoverageId ? 'Guardar Cambios' : 'Agregar'}
                    </button>
                    {editingCoverageId && (
                      <button
                        type="button"
                        onClick={handleCancelCoverage}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}

            {coverages.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay coberturas agregadas</p>
            ) : (
              <div className="space-y-3">
                {coverages.map((coverage) => (
                  <div key={coverage.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{coverage.coverage_title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {coverage.media_source?.name || coverage.media_name} -{' '}
                          <span className="capitalize">{coverage.media_source?.bias_rating || coverage.media_bias}</span>
                        </p>
                        {coverage.snippet && (
                          <p className="text-sm text-gray-500 mt-2">{coverage.snippet}</p>
                        )}
                        <a
                          href={coverage.coverage_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
                        >
                          Ver artículo →
                        </a>
                      </div>
                      <div className="ml-4 flex space-x-3">
                        <button
                          onClick={() => handleEditCoverage(coverage)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCoverage(coverage.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
  );
}
