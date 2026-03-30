import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Calendar, Package, Search, Info } from 'lucide-react';
import { festivalsApi, productsApi } from '../../lib/api';
import { Product } from '../../types';
import { ImageUpload } from './ImageUpload';
import { useNotification } from '../../contexts/NotificationContext';

interface Festival {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  products?: Product[] | string[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export const AdminFestivals: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Festival>({
    name: '',
    description: '',
    image: '',
    products: [],
    startDate: '',
    endDate: '',
    isActive: true,
    displayOrder: 0,
  });

  useEffect(() => {
    fetchFestivals();
    fetchProducts();
  }, []);

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      const { data, error } = await festivalsApi.getAll();
      if (error) {
        console.error('Failed to load festivals:', error);
        return;
      }
      setFestivals(data?.festivals || []);
    } catch (error) {
      console.error('Error fetching festivals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await productsApi.getAll({ limit: 1000 });
      if (error) {
        console.error('Failed to load products:', error);
        return;
      }
      setProducts(data?.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const festivalData = {
        ...formData,
        products: formData.products?.map((p: any) => typeof p === 'string' ? p : (p.id || p._id)),
      };

      if (editingId) {
        const { error } = await festivalsApi.update(editingId, festivalData);
        if (error) {
          showError('Failed to update festival: ' + error);
          return;
        }
        showSuccess('Festival updated successfully!');
      } else {
        const { error } = await festivalsApi.create(festivalData);
        if (error) {
          showError('Failed to create festival: ' + error);
          return;
        }
        showSuccess('Festival created successfully!');
      }

      await fetchFestivals();
      resetForm();
    } catch (error) {
      console.error('Error saving festival:', error);
      showError('Error saving festival.');
    }
  };

  const handleEdit = (festival: Festival) => {
    setEditingId(festival._id || festival.id || '');
    setFormData({
      name: festival.name || '',
      description: festival.description || '',
      image: festival.image || '',
      products: festival.products || [],
      startDate: festival.startDate ? new Date(festival.startDate).toISOString().split('T')[0] : '',
      endDate: festival.endDate ? new Date(festival.endDate).toISOString().split('T')[0] : '',
      isActive: festival.isActive !== false,
      displayOrder: festival.displayOrder || 0,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this festival?')) return;

    try {
      const { error } = await festivalsApi.delete(id);
      if (error) {
        alert('Failed to delete festival: ' + error);
        return;
      }
      await fetchFestivals();
    } catch (error) {
      console.error('Error deleting festival:', error);
      alert('Error deleting festival.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      products: [],
      startDate: '',
      endDate: '',
      isActive: true,
      displayOrder: 0,
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const toggleProduct = (productId: string) => {
    const currentProducts = (formData.products || []) as string[];
    if (currentProducts.includes(productId)) {
      setFormData({
        ...formData,
        products: currentProducts.filter((id) => id !== productId),
      });
    } else {
      setFormData({
        ...formData,
        products: [...currentProducts, productId],
      });
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading festivals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Festivals</h1>
          <p className="text-gray-600">Manage festival packages and collections</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Create Festival
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1A1A1A]">
              {editingId ? 'Edit Festival' : 'Create New Festival'}
            </h2>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  Festival Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Festival Image</label>
              <div className="mb-3 flex gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
                <Info size={18} className="flex-shrink-0 mt-0.5" />
                <span>
                  Use a <strong>wide or square image</strong>. Recommended size: <strong>800×600 px</strong> or 1200×600 px. Used in festival cards and sections.
                </span>
              </div>
              <ImageUpload
                value={formData.image || ''}
                onChange={(url) => setFormData({ ...formData, image: typeof url === 'string' ? url : url[0] || '' })}
                multiple={false}
                label=""
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Select Products *
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {filteredProducts.map((product) => {
                    const productId = product.id || product._id || '';
                    const isSelected = (formData.products || []).some(
                      (p: any) => (typeof p === 'string' ? p : (p.id || p._id)) === productId
                    );
                    return (
                      <label
                        key={productId}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProduct(productId)}
                          className="w-5 h-5 text-[#FF8C00] border-gray-300 rounded focus:ring-[#FF8C00]"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-[#1A1A1A]">{product.name}</p>
                          <p className="text-sm text-gray-500">₹{product.price}</p>
                        </div>
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Selected: {(formData.products || []).length} product(s)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-[#FF8C00] border-gray-300 rounded focus:ring-[#FF8C00]"
                />
                <span className="text-sm font-semibold text-[#1A1A1A]">Active</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Save size={20} /> {editingId ? 'Update' : 'Create'} Festival
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Festival
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {festivals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No festivals found. Create your first festival!
                  </td>
                </tr>
              ) : (
                festivals.map((festival) => {
                  const festivalId = festival._id || festival.id || '';
                  const festivalProducts = festival.products || [];
                  return (
                    <tr key={festivalId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {festival.image && (
                            <img
                              src={festival.image}
                              alt={festival.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-[#1A1A1A]">{festival.name}</p>
                            {festival.description && (
                              <p className="text-sm text-gray-500 line-clamp-1">
                                {festival.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {Array.isArray(festivalProducts) ? festivalProducts.length : 0} products
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {festival.startDate && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(festival.startDate).toLocaleDateString()}
                            {festival.endDate && ` - ${new Date(festival.endDate).toLocaleDateString()}`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            festival.isActive !== false
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {festival.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(festival)}
                            className="text-[#FF8C00] hover:text-[#FF7A00] transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(festivalId)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
