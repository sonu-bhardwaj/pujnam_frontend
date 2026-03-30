import React, { useState, useEffect } from 'react';
import { User, MapPin, Plus, Edit, Trash2, Check, X, Home, Briefcase, Map } from 'lucide-react';
import { authApi } from '../lib/api';
import { useNotification } from '../contexts/NotificationContext';
import { AnnouncementBar } from './AnnouncementBar';
// import { PanchangBar } from './PanchangBar';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';

interface Address {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  addressType: 'home' | 'work' | 'other';
  isDefault: boolean;
}

export const UserProfile: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Address>({
    name: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    addressType: 'home',
    isDefault: false,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: userData, error: userError } = await authApi.getProfile();
      if (userError || !userData?.user) {
        window.location.hash = '/login?return=/profile';
        return;
      }
      setUser(userData.user);

      const { data: addressesData, error: addressesError } = await authApi.getAddresses();
      if (!addressesError && addressesData?.addresses) {
        setAddresses(addressesData.addresses);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
      showError('Please fill all required fields');
      return;
    }

    try {
      if (editingAddress) {
        const addressId = editingAddress._id || editingAddress.id;
        await authApi.updateAddress(addressId, formData);
        showSuccess('Address updated successfully!');
      } else {
        await authApi.addAddress(formData);
        showSuccess('Address added successfully!');
      }
      
      setShowAddAddress(false);
      setEditingAddress(null);
      resetForm();
      fetchUserData();
    } catch (error: any) {
      showError('Failed to save address: ' + (error?.error || error?.message || 'Unknown error'));
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({ ...address });
    setShowAddAddress(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await authApi.deleteAddress(addressId);
      showSuccess('Address deleted successfully!');
      fetchUserData();
    } catch (error: any) {
      showError('Failed to delete address: ' + (error?.error || error?.message || 'Unknown error'));
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await authApi.setDefaultAddress(addressId);
      showSuccess('Default address updated!');
      fetchUserData();
    } catch (error: any) {
      showError('Failed to set default address: ' + (error?.error || error?.message || 'Unknown error'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      addressType: 'home',
      isDefault: false,
    });
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home size={18} />;
      case 'work':
        return <Briefcase size={18} />;
      default:
        return <Map size={18} />;
    }
  };

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case 'home':
        return 'Home';
      case 'work':
        return 'Work';
      default:
        return 'Other';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <AnnouncementBar />
        {/* <PanchangBar /> */}
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AnnouncementBar />
      {/* <PanchangBar /> */}
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-[#1A1A1A] mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-[#FF8C00] rounded-full flex items-center justify-center">
                  <User size={40} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A]">{user?.name || 'User'}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                  {user?.phone && <p className="text-gray-600">{user.phone}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Addresses Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
                  <MapPin className="text-[#FF8C00]" size={24} />
                  Saved Addresses
                </h2>
                <button
                  onClick={() => {
                    resetForm();
                    setEditingAddress(null);
                    setShowAddAddress(true);
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add New Address
                </button>
              </div>

              {showAddAddress && (
                <div className="mb-6 border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </h3>
                  <form onSubmit={handleSubmitAddress} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF8C00]"
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF8C00]"
                          placeholder="10 digit phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email (Optional)</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF8C00]"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Address Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.addressType}
                          onChange={(e) => setFormData({ ...formData, addressType: e.target.value as 'home' | 'work' | 'other' })}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF8C00]"
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.addressLine1}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF8C00]"
                        placeholder="House/Flat No., Building Name, Street"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        value={formData.addressLine2}
                        onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF8C00]"
                        placeholder="Area, Colony, Sector"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Landmark (Optional)</label>
                      <input
                        type="text"
                        value={formData.landmark}
                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF8C00]"
                        placeholder="Nearby landmark"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF8C00]"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF8C00]"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF8C00]"
                          placeholder="6 digit pincode"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF8C00]"
                        placeholder="Country"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="w-4 h-4 text-[#FF8C00] border-gray-300 rounded focus:ring-[#FF8C00]"
                      />
                      <label htmlFor="isDefault" className="text-sm text-gray-700">
                        Set as default address
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="btn-primary flex-1"
                      >
                        {editingAddress ? 'Update Address' : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddAddress(false);
                          setEditingAddress(null);
                          resetForm();
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {addresses.length === 0 && !showAddAddress ? (
                <div className="text-center py-12">
                  <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No Saved Addresses</h3>
                  <p className="text-gray-600 mb-6">Add your first address to get started</p>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowAddAddress(true);
                    }}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div
                      key={address._id || address.id}
                      className={`border-2 rounded-lg p-4 relative ${
                        address.isDefault ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-200'
                      }`}
                    >
                      {address.isDefault && (
                        <div className="absolute top-2 right-2 bg-[#FF8C00] text-white px-2 py-1 rounded text-xs font-semibold">
                          DEFAULT
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getAddressTypeIcon(address.addressType)}
                          <div>
                            <h3 className="font-bold text-[#1A1A1A]">{address.name}</h3>
                            <p className="text-sm text-gray-600">{getAddressTypeLabel(address.addressType)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 space-y-1 mb-3">
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        {address.landmark && <p className="text-gray-500">Landmark: {address.landmark}</p>}
                        <p>
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p>{address.country}</p>
                        <p className="font-semibold">Phone: {address.phone}</p>
                        {address.email && <p>Email: {address.email}</p>}
                      </div>

                      <div className="flex gap-2 mt-4">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefault(address._id || address.id || '')}
                            className="flex-1 text-xs px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="flex-1 text-xs px-3 py-1.5 border border-[#FF8C00] text-[#FF8C00] rounded hover:bg-orange-50 transition-colors flex items-center justify-center gap-1"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address._id || address.id || '')}
                          className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

