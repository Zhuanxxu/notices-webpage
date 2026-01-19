'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { MediaSource } from '@/shared/types';

export default function MediaSourcesPage() {
  const [mediaSources, setMediaSources] = useState<MediaSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    bias_rating: 'center' as 'left' | 'center' | 'right',
    logo_url: '',
  });

  useEffect(() => {
    fetchMediaSources();
  }, []);

  const fetchMediaSources = async () => {
    try {
      const response = await api.get<MediaSource[]>('/media-sources');
      setMediaSources(response.data);
    } catch (error) {
      console.error('Error fetching media sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (logoUrl) {
        payload.logo_url = logoUrl;
      }

      if (editingId) {
        await api.put(`/media-sources/${editingId}`, payload);
      } else {
        await api.post('/media-sources', payload);
      }
      setFormData({ name: '', url: '', bias_rating: 'center', logo_url: '' });
      setLogoUrl(null);
      setShowForm(false);
      setEditingId(null);
      fetchMediaSources();
    } catch (error: any) {
      console.error('Error saving media source:', error);
      alert(error.response?.data?.error || `Error al ${editingId ? 'actualizar' : 'crear'} el medio`);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error('Error al subir el logo');
      }

      const data = await response.json();
      setLogoUrl(data.filePath);
      setFormData({ ...formData, logo_url: data.filePath });
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      alert('Error al subir el logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleEdit = (source: MediaSource) => {
    setFormData({
      name: source.name,
      url: source.url,
      bias_rating: source.bias_rating as 'left' | 'center' | 'right',
      logo_url: source.logo_url || '',
    });
    setLogoUrl(source.logo_url);
    setEditingId(source.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ name: '', url: '', bias_rating: 'center', logo_url: '' });
    setLogoUrl(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este medio?')) return;
    try {
      await api.delete(`/media-sources/${id}`);
      fetchMediaSources();
    } catch (error) {
      console.error('Error deleting media source:', error);
      alert('Error al eliminar el medio');
    }
  };

  const getBiasColor = (bias: string) => {
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

  const getBiasLabel = (bias: string) => {
    switch (bias) {
      case 'left':
        return 'Izquierda';
      case 'right':
        return 'Derecha';
      case 'center':
        return 'Centro';
      default:
        return bias;
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Medios de Comunicación</h2>
              <p className="mt-1 text-sm text-gray-600">Gestiona los medios externos</p>
            </div>
            <button
              onClick={() => {
                if (showForm) {
                  handleCancel();
                } else {
                  setShowForm(true);
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {showForm ? 'Cancelar' : 'Nuevo Medio'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sesgo Político *</label>
                  <select
                    value={formData.bias_rating}
                    onChange={(e) => setFormData({ ...formData, bias_rating: e.target.value as 'left' | 'center' | 'right' })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"
                  >
                    <option value="left">Izquierda</option>
                    <option value="center">Centro</option>
                    <option value="right">Derecha</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Logo (URL o archivo)</label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => {
                      setFormData({ ...formData, logo_url: e.target.value });
                      if (e.target.value) setLogoUrl(e.target.value);
                    }}
                    placeholder="https://ejemplo.com/logo.png"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"
                  />
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">O sube una imagen:</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
                    />
                    {uploadingLogo && (
                      <p className="mt-1 text-sm text-gray-500">Subiendo logo...</p>
                    )}
                  </div>
                  {(logoUrl || formData.logo_url) && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
                      <img
                        src={(logoUrl || formData.logo_url)?.startsWith('http') 
                          ? (logoUrl || formData.logo_url) 
                          : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${logoUrl || formData.logo_url}`}
                        alt="Logo"
                        className="h-16 w-auto object-contain border border-gray-300 rounded p-2 bg-white"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {editingId ? 'Guardar Cambios' : 'Crear Medio'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : mediaSources.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">No hay medios registrados</p>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sesgo</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mediaSources.map((source) => (
                    <tr key={source.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {source.logo_url ? (
                          <img
                            src={source.logo_url.startsWith('http') 
                              ? source.logo_url 
                              : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${source.logo_url}`}
                            alt={source.name}
                            className="h-10 w-auto object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                            Sin logo
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {source.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                          {source.url}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getBiasColor(source.bias_rating)}`}>
                          {getBiasLabel(source.bias_rating)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleEdit(source)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(source.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
  );
}
