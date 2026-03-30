import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon, Info, Phone } from 'lucide-react';
import { promoBlocksApi } from '../../lib/api';
import { ImageUpload } from './ImageUpload';
import { useNotification } from '../../contexts/NotificationContext';

interface PromoBlock {
  _id: string;
  title: string;
  description?: string;
  image_url: string;
  button_text: string;
  link_url: string;
  display_order: number;
  is_active: boolean;
}

export const AdminPromoBlocks: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [blocks, setBlocks] = useState<PromoBlock[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<PromoBlock | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    button_text: 'Call Now',
    link_url: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    const { data, error } = await promoBlocksApi.getAll();
    if (error) {
      console.error('Failed to load promo blocks', error);
      return;
    }
    setBlocks(data?.blocks || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBlock) {
        const { error } = await promoBlocksApi.update(editingBlock._id, formData);
        if (error) {
          showError('Failed to update: ' + error);
          return;
        }
        showSuccess('Block updated successfully!');
      } else {
        const { error } = await promoBlocksApi.create(formData);
        if (error) {
          showError('Failed to create: ' + error);
          return;
        }
        showSuccess('Block created successfully!');
      }
      setIsModalOpen(false);
      setEditingBlock(null);
      resetForm();
      fetchBlocks();
    } catch (err) {
      console.error('Error saving promo block', err);
    }
  };

  const handleEdit = (block: PromoBlock) => {
    setEditingBlock(block);
    setFormData({
      title: block.title,
      description: block.description || '',
      image_url: block.image_url,
      button_text: block.button_text || 'Call Now',
      link_url: block.link_url || '',
      display_order: block.display_order ?? 0,
      is_active: block.is_active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this block?')) return;
    const { error } = await promoBlocksApi.delete(id);
    if (error) {
      showError('Failed to delete: ' + error);
      return;
    }
    showSuccess('Block deleted!');
    fetchBlocks();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      button_text: 'Call Now',
      link_url: '',
      display_order: 0,
      is_active: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Poojan Booking & Astro Consulting</h2>
        <button
          onClick={() => {
            resetForm();
            setEditingBlock(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Block
        </button>
      </div>

      <p className="text-gray-600">
        Manage the two promo blocks shown after Shop by Category (e.g. Poojan Booking, Astro Consulting). Display order: lower number appears first (left).
      </p>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Image</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Button</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {blocks.map((block) => (
              <tr key={block._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {block.image_url ? (
                      <img src={block.image_url} alt={block.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-400" size={24} />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-[#1A1A1A]">{block.title}</p>
                  {block.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{block.description}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{block.button_text}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600">{block.display_order}</span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      block.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {block.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(block)}
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(block._id)}
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
                {editingBlock ? 'Edit Block' : 'Add Block'}
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
                  placeholder="e.g. Poojan Booking, Astro Consulting"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Short description for the block"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image</label>
                <div className="mb-3 flex gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
                  <Info size={18} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Use <strong>16:9 aspect ratio</strong> so the image fits in the box without cropping. Recommended size: <strong>800×450 px</strong> or 960×540 px. Other ratios will show with empty space; 16:9 fills the box fully.
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Button text</label>
                <input
                  type="text"
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  placeholder="Call Now"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Phone size={16} /> Link URL (phone or page) *
                </label>
                <input
                  type="text"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  required
                  placeholder="tel:+919876543210 or https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
                <p className="text-xs text-gray-500 mt-1">Use tel:+91... for Call Now to open phone dialer.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Display order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                  <p className="text-xs text-gray-500 mt-1">0 = first (left), 1 = second (right)</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Active</label>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-[#FF8C00] border-gray-300 rounded focus:ring-[#FF8C00]"
                    />
                    <span className="text-sm text-gray-700">Show on website</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingBlock ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBlock(null);
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
