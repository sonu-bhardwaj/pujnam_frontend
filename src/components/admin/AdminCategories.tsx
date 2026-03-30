import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Info } from 'lucide-react';
import { Category } from '../../types';
import { categoriesApi } from '../../lib/api';
import { mapCategory } from '../../lib/mappers';
import { placeholders } from '../../lib/placeholders';
import { ImageUpload } from './ImageUpload';
import { useNotification } from '../../contexts/NotificationContext';

export const AdminCategories: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await categoriesApi.getAll();
      if (error) {
        console.error('Unable to load categories', error);
        showError('Error loading categories: ' + error);
        setLoading(false);
        return;
      }
      const categoriesList = data?.categories || (Array.isArray(data) ? data : []);
      const mapped = Array.isArray(categoriesList) ? categoriesList.map(mapCategory) : [];
      setCategories(mapped);
    } catch (err) {
      console.error('Error fetching categories in admin:', err);
      showError('Error loading categories: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        // Update category
        const { error } = await categoriesApi.update(editingCategory.id, formData);
        if (error) {
          showError('Error updating category: ' + error);
          return;
        }
        showSuccess('Category updated successfully!');
      } else {
        // Create category
        const { error } = await categoriesApi.create(formData);
        if (error) {
          showError('Error creating category: ' + error);
          return;
        }
        showSuccess('Category created successfully!');
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', image: '', isActive: true });
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      showError('Error saving category: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      image: category.image_url || category.image || '',
      isActive: category.isActive ?? category.is_active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const { error } = await categoriesApi.delete(id);
      if (error) {
        showError('Error deleting category: ' + error);
        return;
      }
      showSuccess('Category deleted successfully!');
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Error deleting category: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Categories</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', description: '', image: '', isActive: true });
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">Loading categories...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Image</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Slug</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <img
                        src={category.image_url || category.image || placeholders.small}
                        alt={category.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#1A1A1A]">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{category.slug || category.id}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
                      {category.description || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          category.isActive ?? category.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {category.isActive ?? category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No categories found. Check browser console for details.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent"
                  placeholder="Category name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent"
                  rows={3}
                  placeholder="Category description"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category Image</label>
                <div className="mb-3 flex gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
                  <Info size={18} className="flex-shrink-0 mt-0.5" />
                  <span>
                    For best results use a <strong>square image</strong>. Recommended size: <strong>600×600 px</strong> (or 800×800). Used in category cards on the homepage.
                  </span>
                </div>
                <ImageUpload
                  value={formData.image || ''}
                  onChange={(url) => setFormData({ ...formData, image: typeof url === 'string' ? url : url[0] || '' })}
                  multiple={false}
                  label=""
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#FF8C00] border-gray-300 rounded focus:ring-[#FF8C00]"
                  />
                  <span className="text-sm font-semibold text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                    setFormData({ name: '', description: '', image: '', isActive: true });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
