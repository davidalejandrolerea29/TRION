import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Save, X, Upload, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Category, Content } from '../lib/database.types';
import FileUploader from './FileUploader';
import { storageService } from '../lib/storage';

interface AdminPanelProps {
  onBack: () => void;
  categories: Category[];
  initialCategoryId: string | null;
}

export default function AdminPanel({ onBack, categories: initialCategories, initialCategoryId }: AdminPanelProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [content, setContent] = useState<Content[]>([]);
  const [activeTab, setActiveTab] = useState<'categories' | 'content'>('categories');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadCategories();
    loadContent();

    if (initialCategoryId) {
      setActiveTab('content');
      // Pre-fill form for new content
      setEditingItem({ category_id: initialCategoryId });
      setShowForm(true);
    }
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  };

  const loadContent = async () => {
    const { data } = await supabase
      .from('content')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });
    setContent(data || []);
  };

  const handleSaveCategory = async (categoryData: any) => {
    try {
      if (editingItem?.id) {
        await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingItem.id);
      } else {
        await supabase.from('categories').insert([categoryData]);
      }
      loadCategories();
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleSaveContent = async (contentData: any, coverFile: File | null, contentFile: File | null) => {
    try {
      let finalData = { ...contentData };

      // Upload Cover Image
      if (coverFile) {
        const path = `covers/${Date.now()}_${coverFile.name}`;
        const { path: uploadedPath, error } = await storageService.uploadFile(coverFile, path);
        if (error) throw error;
        finalData.image_url = storageService.getPublicUrl(uploadedPath);
      }

      // Upload Content File
      if (contentFile) {
        const path = `content/${Date.now()}_${contentFile.name}`;
        const { path: uploadedPath, error } = await storageService.uploadFile(contentFile, path);
        if (error) throw error;
        finalData.content_url = storageService.getPublicUrl(uploadedPath);
        finalData.file_size = contentFile.size;

        // Determine file type
        if (contentFile.type.startsWith('video/')) finalData.file_type = 'video';
        else if (contentFile.type.startsWith('image/')) finalData.file_type = 'image';
        else if (contentFile.type === 'application/pdf') finalData.file_type = 'pdf';
        else finalData.file_type = 'external'; // Default fallback
      }

      if (editingItem?.id) {
        await supabase
          .from('content')
          .update(finalData)
          .eq('id', editingItem.id);
      } else {
        await supabase.from('content').insert([finalData]);
      }
      loadContent();
      setShowForm(false);
      setEditingItem(null);
    } catch (error: any) {
      console.error('Error saving content:', error);
      if (error.message?.includes('bucket not found') || error.error?.includes('Bucket not found')) {
        alert('Error: No se encontró el bucket de almacenamiento "content-files". Por favor ejecuta la migración "20251223_add_content_file_fields.sql" en Supabase.');
      } else {
        alert('Error al guardar contenido: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  const handleDelete = async (table: string, id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      await supabase.from(table).delete().eq('id', id);
      if (table === 'categories') loadCategories();
      else loadContent();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="text-slate-300 hover:text-white transition-colors"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
          <div className="w-20" />
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-4 font-medium transition-colors ${activeTab === 'categories'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
            >
              Categorías
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-6 py-4 font-medium transition-colors ${activeTab === 'content'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
            >
              Contenido
            </button>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                {activeTab === 'categories' ? 'Gestionar Categorías' : 'Gestionar Contenido'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingItem(null);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar {activeTab === 'categories' ? 'Categoría' : 'Contenido'}</span>
              </button>
            </div>

            {activeTab === 'categories' ? (
              <CategoriesTable
                categories={categories}
                onEdit={(item: any) => {
                  setEditingItem(item);
                  setShowForm(true);
                }}
                onDelete={(id: string) => handleDelete('categories', id)}
              />
            ) : (
              <ContentTable
                content={content}
                onEdit={(item: any) => {
                  setEditingItem(item);
                  setShowForm(true);
                }}
                onDelete={(id: string) => handleDelete('content', id)}
              />
            )}
          </div>
        </div>

        {showForm && (
          <FormModal
            type={activeTab}
            item={editingItem}
            categories={categories}
            onSave={activeTab === 'categories' ? handleSaveCategory : handleSaveContent}
            onClose={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function CategoriesTable({ categories, onEdit, onDelete }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3 px-4 text-slate-300">Nombre</th>
            <th className="text-left py-3 px-4 text-slate-300">Slug</th>
            <th className="text-left py-3 px-4 text-slate-300">Icono</th>
            <th className="text-left py-3 px-4 text-slate-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category: Category) => (
            <tr key={category.id} className="border-b border-slate-700/50">
              <td className="py-3 px-4 text-white">{category.name}</td>
              <td className="py-3 px-4 text-slate-300">{category.slug}</td>
              <td className="py-3 px-4 text-slate-300">{category.icon}</td>
              <td className="py-3 px-4">
                <div className="flex space-x-2">
                  <button onClick={() => onEdit(category)} className="text-blue-400 hover:text-blue-300">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(category.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContentTable({ content, onEdit, onDelete }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3 px-4 text-slate-300">Título</th>
            <th className="text-left py-3 px-4 text-slate-300">Categoría</th>
            <th className="text-left py-3 px-4 text-slate-300">Tipo</th>
            <th className="text-left py-3 px-4 text-slate-300">Premium</th>
            <th className="text-left py-3 px-4 text-slate-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {content.map((item: any) => (
            <tr key={item.id} className="border-b border-slate-700/50">
              <td className="py-3 px-4 text-white">
                <div className="flex items-center space-x-3">
                  {item.image_url ? (
                    <img src={item.image_url} className="w-8 h-8 rounded object-cover" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-slate-700" />
                  )}
                  <span>{item.title}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-slate-300">{item.categories?.name}</td>
              <td className="py-3 px-4 text-slate-300 capitalize">{item.file_type || 'external'}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded text-xs ${item.is_premium ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                  {item.is_premium ? 'Premium' : 'Gratis'}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex space-x-2">
                  <button onClick={() => onEdit(item)} className="text-blue-400 hover:text-blue-300">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormModal({ type, item, categories, onSave, onClose }: any) {
  const [formData, setFormData] = useState(
    item || (type === 'categories'
      ? { name: '', slug: '', icon: 'Book' }
      : {
        title: '',
        description: '',
        category_id: '',
        image_url: '',
        content_url: '',
        is_external: false,
        is_premium: true,
        file_type: 'external',
        preview_duration: 30
      }
    )
  );

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      if (item.is_external || !item.file_type || item.file_type === 'external') {
        setUploadMode('url');
      } else {
        setUploadMode('file');
      }
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Update is_external based on upload mode
    const dataToSave = { ...formData };

    if (type !== 'categories') {
      dataToSave.is_external = uploadMode === 'url';
    }

    await onSave(dataToSave, coverFile, contentFile);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {item ? 'Editar' : 'Agregar'} {type === 'categories' ? 'Categoría' : 'Contenido'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'categories' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Icono</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  <option value="Book">Book</option>
                  <option value="BookOpen">BookOpen</option>
                  <option value="Tv">Tv</option>
                  <option value="Film">Film</option>
                  <option value="Gamepad2">Gamepad2</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Categoría</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((cat: Category) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  rows={3}
                />
              </div>

              {/* Cover Image Section */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-white font-medium mb-3">Imagen de Portada</h4>
                <FileUploader
                  label="Subir nueva portada"
                  accept="image/*"
                  maxSizeMB={5}
                  currentValue={formData.image_url}
                  onFileSelect={setCoverFile}
                  onClear={() => {
                    setCoverFile(null);
                    setFormData({ ...formData, image_url: '' });
                  }}
                  helperText="Formatos: JPG, PNG, WebP"
                />

                {!coverFile && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">O pegar URL de imagen</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                      placeholder="https://..."
                    />
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-white font-medium mb-3">Archivo de Contenido</h4>

                <div className="flex space-x-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${uploadMode === 'file'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                  >
                    Subir Archivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${uploadMode === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                  >
                    URL Externa
                  </button>
                </div>

                {uploadMode === 'file' ? (
                  <FileUploader
                    label="Archivo de contenido (Video, PDF, Imagen)"
                    accept="video/*,application/pdf,image/*"
                    maxSizeMB={500}
                    currentValue={formData.content_url}
                    onFileSelect={setContentFile}
                    onClear={() => {
                      setContentFile(null);
                      setFormData({ ...formData, content_url: '' });
                    }}
                    helperText="MP4, WebM, PDF, JPG, PNG"
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">URL del contenido</label>
                    <input
                      type="url"
                      value={formData.content_url}
                      onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      placeholder="https://..."
                    />
                  </div>
                )}
              </div>

              {/* Video Preview Duration */}
              {(formData.file_type === 'video' || (formData.file_type === 'external' && uploadMode === 'url')) && (
                <div className="border-t border-slate-700 pt-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Duración de Vista Previa (segundos)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.preview_duration || 30}
                    onChange={(e) => setFormData({ ...formData, preview_duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Tiempo que se mostrará el video antes de pedir suscripción
                  </p>
                </div>
              )}

              <div className="flex space-x-4 border-t border-slate-700 pt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_premium}
                    onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                    className="rounded bg-slate-700 border-slate-600"
                  />
                  <span className="text-slate-300">Es contenido Premium</span>
                </label>
              </div>
            </>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}