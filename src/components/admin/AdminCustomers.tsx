import React, { useEffect, useState } from 'react';
import { Search, Eye, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';
import { customersApi } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';

interface Customer {
  id: string;
  email: string;
  phone: string | null;
  name: string | null;
  address: any;
  city: string | null;
  state: string | null;
  pincode: string | null;
  total_orders: number;
  total_spent: number;
  created_at: string;
  last_order_at: string | null;
}

export const AdminCustomers: React.FC = () => {
  const { showError } = useNotification();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data, error } = await customersApi.getAll();
    if (error) {
      console.error('Failed to load customers', error);
      return;
    }
    setCustomers(data?.customers || []);
  };

  const handleViewCustomer = async (id: string) => {
    const { data, error } = await customersApi.getById(id);
    if (error) {
      showError('Failed to load customer details: ' + error);
      return;
    }
    setSelectedCustomer(data?.customer || null);
    setCustomerOrders(data?.orders || []);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Customers</h1>
          <p className="text-gray-600">View and manage customer information</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-lg shadow-md px-4 py-2 flex items-center gap-2">
            <ShoppingBag className="text-[#FF8C00]" size={20} />
            <div>
              <p className="text-xs text-gray-500">Total Customers</p>
              <p className="text-xl font-bold text-[#1A1A1A]">{customers.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email, name, or phone..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A]">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A]">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A]">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A]">Orders</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A]">Total Spent</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A]">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-[#1A1A1A]">
                        {customer.name || 'Guest User'}
                      </p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {customer.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} />
                          <span>{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {customer.city && customer.state ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} />
                        <span>
                          {customer.city}, {customer.state}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-[#1A1A1A]">{customer.total_orders}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-[#FF8C00]">
                      ₹{customer.total_spent?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewCustomer(customer.id)}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Eye size={18} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? 'No customers found matching your search.' : 'No customers yet.'}
            </p>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Customer Details</h2>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setCustomerOrders([]);
                }}
                className="text-gray-500 hover:text-[#1A1A1A]"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500">Name</label>
                  <p className="text-[#1A1A1A] font-semibold">
                    {selectedCustomer.name || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Email</label>
                  <p className="text-[#1A1A1A]">{selectedCustomer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Phone</label>
                  <p className="text-[#1A1A1A]">{selectedCustomer.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Customer Since</label>
                  <p className="text-[#1A1A1A]">
                    {new Date(selectedCustomer.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500 block mb-2">Address</label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {selectedCustomer.address ? (
                    <p className="text-[#1A1A1A]">
                      {selectedCustomer.address.street || ''}
                      {selectedCustomer.address.city && `, ${selectedCustomer.address.city}`}
                      {selectedCustomer.address.state && `, ${selectedCustomer.address.state}`}
                      {selectedCustomer.address.zipCode && ` - ${selectedCustomer.address.zipCode}`}
                    </p>
                  ) : (
                    <p className="text-gray-500">No address provided</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500 block mb-2">Order History</label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {customerOrders.length > 0 ? (
                    <div className="space-y-2">
                      {customerOrders.map((order: any) => (
                        <div key={order._id} className="flex justify-between items-center p-2 bg-white rounded">
                          <div>
                            <p className="font-semibold">Order #{order._id.slice(-6)}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#FF8C00]">₹{order.total}</p>
                            <p className="text-sm text-gray-600 capitalize">{order.orderStatus}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No orders yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
