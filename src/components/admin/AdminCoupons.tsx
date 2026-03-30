import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { couponsApi } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';

interface Coupon {
  _id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount?: number;
  valid_from: string;
  valid_until: string;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
}

export const AdminCoupons: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 10,
    min_order_value: 0,
    max_discount: 0,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usage_limit: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data, error } = await couponsApi.getAll();
    if (error) {
      console.error('Failed to load coupons', error);
      return;
    }
    setCoupons(data?.coupons || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
        usage_limit: formData.usage_limit || undefined,
        max_discount: formData.max_discount || undefined,
      };

      if (editingCoupon) {
        const { error } = await couponsApi.update(editingCoupon._id, submitData);
        if (error) {
          alert('Failed to update coupon: ' + error);
          return;
        }
      } else {
        const { error } = await couponsApi.create(submitData);
        if (error) {
          alert('Failed to create coupon: ' + error);
          return;
        }
      }
      setIsModalOpen(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon', error);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_value: coupon.min_order_value,
      max_discount: coupon.max_discount || 0,
      valid_from: new Date(coupon.valid_from).toISOString().split('T')[0],
      valid_until: new Date(coupon.valid_until).toISOString().split('T')[0],
      usage_limit: coupon.usage_limit || 0,
      is_active: coupon.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    const { error } = await couponsApi.delete(id);
    if (error) {
      showError('Failed to delete coupon: ' + error);
      return;
    }
    showSuccess('Coupon deleted successfully!');
    fetchCoupons();
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_value: 0,
      max_discount: 0,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usage_limit: 0,
      is_active: true,
    });
  };

  const isExpired = (coupon: Coupon) => {
    return new Date(coupon.valid_until) < new Date();
  };

  const isActive = (coupon: Coupon) => {
    const now = new Date();
    return (
      coupon.is_active &&
      new Date(coupon.valid_from) <= now &&
      new Date(coupon.valid_until) >= now &&
      (!coupon.usage_limit || coupon.used_count < coupon.usage_limit)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Coupon Management</h2>
        <button
          onClick={() => {
            resetForm();
            setEditingCoupon(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Coupon
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Code</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Discount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Min Order</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Valid Until</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Usage</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {coupons.map((coupon) => (
              <tr key={coupon._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Tag className="text-[#FF8C00]" size={18} />
                    <span className="font-bold text-[#1A1A1A]">{coupon.code}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-[#FF8C00]">
                    {coupon.discount_type === 'percentage'
                      ? `${coupon.discount_value}%`
                      : `₹${coupon.discount_value}`}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600">₹{coupon.min_order_value}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600">
                    {new Date(coupon.valid_until).toLocaleDateString('en-IN')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600">
                    {coupon.used_count}
                    {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ' / ∞'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isExpired(coupon)
                        ? 'bg-red-100 text-red-700'
                        : isActive(coupon)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {isExpired(coupon) ? 'Expired' : isActive(coupon) ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
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
                {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Type *</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Value *</label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Min Order Value</label>
                  <input
                    type="number"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({ ...formData, min_order_value: parseFloat(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: parseFloat(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Valid From *</label>
                  <input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Valid Until *</label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Usage Limit (0 = unlimited)</label>
                <input
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
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
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCoupon(null);
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
