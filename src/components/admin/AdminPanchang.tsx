import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { panchangApi } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';

interface Panchang {
  _id: string;
  date: string;
  tithi: string;
  nakshatra: string;
  yoga?: string;
  karana?: string;
  paksha?: string;
  vaar?: string;
  location: string;
  sunrise: string;
  sunset: string;
  moonrise?: string;
  moonset?: string;
}

export const AdminPanchang: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [panchangList, setPanchangList] = useState<Panchang[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPanchang, setEditingPanchang] = useState<Panchang | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    tithi: '',
    nakshatra: '',
    yoga: '',
    karana: '',
    paksha: '',
    vaar: '',
    location: 'Dadri',
    sunrise: '',
    sunset: '',
    moonrise: '',
    moonset: '',
  });

  useEffect(() => {
    fetchPanchang();
  }, []);

  const fetchPanchang = async () => {
    const { data, error } = await panchangApi.getAll();
    if (error) {
      console.error('Failed to load panchang', error);
      return;
    }
    setPanchangList(data?.panchang || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPanchang) {
        const { error } = await panchangApi.update(editingPanchang._id, formData);
        if (error) {
          showError('Failed to update panchang: ' + error);
          return;
        }
        showSuccess('Panchang updated successfully!');
      } else {
        const { error } = await panchangApi.create(formData);
        if (error) {
          showError('Failed to create panchang: ' + error);
          return;
        }
        showSuccess('Panchang created successfully!');
      }
      setIsModalOpen(false);
      setEditingPanchang(null);
      resetForm();
      fetchPanchang();
    } catch (error) {
      console.error('Error saving panchang', error);
    }
  };

  const handleEdit = (panchang: Panchang) => {
    setEditingPanchang(panchang);
    setFormData({
      date: panchang.date,
      tithi: panchang.tithi,
      nakshatra: panchang.nakshatra,
      yoga: panchang.yoga || '',
      karana: panchang.karana || '',
      paksha: panchang.paksha || '',
      vaar: panchang.vaar || '',
      location: panchang.location,
      sunrise: panchang.sunrise,
      sunset: panchang.sunset,
      moonrise: panchang.moonrise || '',
      moonset: panchang.moonset || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this panchang entry?')) return;
    const { error } = await panchangApi.delete(id);
    if (error) {
      showError('Failed to delete panchang: ' + error);
      return;
    }
    showSuccess('Panchang deleted successfully!');
    fetchPanchang();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      tithi: '',
      nakshatra: '',
      yoga: '',
      karana: '',
      paksha: '',
      vaar: '',
      location: 'Dadri',
      sunrise: '',
      sunset: '',
      moonrise: '',
      moonset: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Panchang Management</h2>
        <button
          onClick={() => {
            resetForm();
            setEditingPanchang(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Panchang
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tithi</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nakshatra</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sunrise</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sunset</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {panchangList.map((panchang) => (
              <tr key={panchang._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-[#FF8C00]" size={18} />
                    <span className="font-medium text-[#1A1A1A]">
                      {new Date(panchang.date).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-700">{panchang.tithi}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-700">{panchang.nakshatra}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600">{panchang.sunrise}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600">{panchang.sunset}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(panchang)}
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(panchang._id)}
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
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">
                {editingPanchang ? 'Edit Panchang' : 'Add New Panchang'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-[#1A1A1A]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tithi *</label>
                  <input
                    type="text"
                    value={formData.tithi}
                    onChange={(e) => setFormData({ ...formData, tithi: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nakshatra *</label>
                  <input
                    type="text"
                    value={formData.nakshatra}
                    onChange={(e) => setFormData({ ...formData, nakshatra: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Yoga</label>
                  <input
                    type="text"
                    value={formData.yoga}
                    onChange={(e) => setFormData({ ...formData, yoga: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Karana</label>
                  <input
                    type="text"
                    value={formData.karana}
                    onChange={(e) => setFormData({ ...formData, karana: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Paksha</label>
                  <input
                    type="text"
                    value={formData.paksha}
                    onChange={(e) => setFormData({ ...formData, paksha: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Vaar</label>
                  <input
                    type="text"
                    value={formData.vaar}
                    onChange={(e) => setFormData({ ...formData, vaar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sunrise *</label>
                  <input
                    type="text"
                    value={formData.sunrise}
                    onChange={(e) => setFormData({ ...formData, sunrise: e.target.value })}
                    placeholder="06:10 AM"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sunset *</label>
                  <input
                    type="text"
                    value={formData.sunset}
                    onChange={(e) => setFormData({ ...formData, sunset: e.target.value })}
                    placeholder="05:45 PM"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Moonrise</label>
                  <input
                    type="text"
                    value={formData.moonrise}
                    onChange={(e) => setFormData({ ...formData, moonrise: e.target.value })}
                    placeholder="07:39:56 AM"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Moonset</label>
                  <input
                    type="text"
                    value={formData.moonset}
                    onChange={(e) => setFormData({ ...formData, moonset: e.target.value })}
                    placeholder="06:18:40 PM"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingPanchang ? 'Update Panchang' : 'Create Panchang'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPanchang(null);
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
