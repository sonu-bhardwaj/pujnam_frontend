import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon, Info } from 'lucide-react';
import { bannersApi } from '../../lib/api';
import { ImageUpload } from './ImageUpload';
import { useNotification } from '../../contexts/NotificationContext';

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url: string;
  button_text: string;
  position: string;
  is_active: boolean;
  display_order: number;
}

export const AdminBanners: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '#/',
    button_text: 'Shop Now',
    position: 'hero',
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data, error } = await bannersApi.getAll();
    if (error) {
      console.error('Failed to load banners', error);
      return;
    }
    setBanners(data?.banners || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        const { error } = await bannersApi.update(editingBanner._id, formData);
        if (error) {
          showError('Failed to update banner: ' + error);
          return;
        }
        showSuccess('Banner updated successfully!');
      } else {
        const { error } = await bannersApi.create(formData);
        if (error) {
          showError('Failed to create banner: ' + error);
          return;
        }
        showSuccess('Banner created successfully!');
      }
      setIsModalOpen(false);
      setEditingBanner(null);
      resetForm();
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner', error);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      link_url: banner.link_url,
      button_text: banner.button_text,
      position: banner.position,
      is_active: banner.is_active,
      display_order: banner.display_order,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    const { error } = await bannersApi.delete(id);
    if (error) {
      showError('Failed to delete banner: ' + error);
      return;
    }
    showSuccess('Banner deleted successfully!');
    fetchBanners();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '#/',
      button_text: 'Shop Now',
      position: 'hero',
      is_active: true,
      display_order: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Banner Management</h2>
        <button
          onClick={() => {
            resetForm();
            setEditingBanner(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Banner
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Image</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Position</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {banners.map((banner) => (
              <tr key={banner._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {banner.image_url ? (
                      <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-400" size={24} />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-[#1A1A1A]">{banner.title}</p>
                  {banner.subtitle && <p className="text-sm text-gray-500">{banner.subtitle}</p>}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 capitalize">
                    {banner.position}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      banner.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600">{banner.display_order}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-[#1A1A1A]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Banner Image</label>
                <div className="mb-3 flex gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
                  <Info size={18} className="flex-shrink-0 mt-0.5" />
                  <span>
                    For best results use a wide image. <strong>Recommended size: 1920×600 px</strong> (or 1600×600). Aspect ratio 2:1 to 3:1. Images that are square or portrait may be cropped on the hero section.
                  </span>
                </div>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: typeof url === 'string' ? url : url[0] || '' })}
                  multiple={false}
                  label=""
                  required={true}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Link URL</label>
                <input
                  type="text"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Button Text</label>
                <input
                  type="text"
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  >
                    <option value="hero">Hero</option>
                    <option value="banner">Banner</option>
                    <option value="sidebar">Sidebar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#FF8C00] border-gray-300 rounded focus:ring-[#FF8C00]"
                  />
                  <span className="text-sm font-semibold text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBanner(null);
                    resetForm();
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
