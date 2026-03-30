import React, { useEffect, useState } from 'react';
import { Package, Eye } from 'lucide-react';
import { Order } from '../../types';
import { ordersApi } from '../../lib/api';
import { mapOrder } from '../../lib/mappers';
import { useNotification } from '../../contexts/NotificationContext';

export const AdminOrders: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await ordersApi.getAllAdmin({ limit: 200, page: 1 });
    if (error) {
      console.error('Unable to load admin orders (auth required). Showing empty list.', error);
      setOrders([]);
      return;
    }
    setOrders((data?.orders || []).map(mapOrder));
  };

  const filteredOrders =
    filter === 'all' ? orders : orders.filter((order) => (order.status || order.orderStatus) === filter);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Order Management</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors whitespace-nowrap ${
                filter === status
                  ? 'bg-[#FF8C00] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Payment</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Package size={18} className="text-[#FF8C00]" />
                    <span className="font-medium text-[#1A1A1A]">{order.order_number || order.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at || order.createdAt || Date.now()).toLocaleDateString('en-IN')}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-[#FF8C00]">Rs. {order.total}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600 capitalize">{order.payment_method || order.paymentMethod}</p>
                  <p
                    className={`text-xs ${
                      order.payment_status === 'paid' || order.paymentStatus === 'paid'
                        ? 'text-green-600'
                        : order.payment_status === 'cancelled' || order.paymentStatus === 'cancelled'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                    }`}
                  >
                    {order.payment_status || order.paymentStatus || 'pending'}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={order.status || order.orderStatus || 'pending'}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      if (confirm(`Update order status to ${newStatus}?`)) {
                        const { error } = await ordersApi.updateStatus(order.id, { orderStatus: newStatus });
                        if (error) {
                          showError('Failed to update order: ' + error);
                        } else {
                          showSuccess(`Order status updated to ${newStatus}!`);
                          fetchOrders();
                        }
                      } else {
                        e.target.value = order.status || order.orderStatus || 'pending';
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize border-0 cursor-pointer ${getStatusColor(order.status || order.orderStatus || '')}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-[#1A1A1A]">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-[#FF8C00]">Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                <p><strong>Order:</strong> {selectedOrder.order_number || selectedOrder.id}</p>
                <p><strong>Status:</strong> <span className="capitalize">{selectedOrder.status || selectedOrder.orderStatus}</span></p>
                <p><strong>Payment:</strong> <span className="capitalize">{selectedOrder.paymentStatus || selectedOrder.payment_status || 'pending'}</span></p>
                <p><strong>Method:</strong> {(selectedOrder.paymentMethod || selectedOrder.payment_method || 'N/A').toUpperCase()}</p>
                <p><strong>Total:</strong> Rs. {selectedOrder.total.toFixed(2)}</p>
                {selectedOrder.invoiceNumber && <p><strong>Invoice:</strong> {selectedOrder.invoiceNumber}</p>}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                <p><strong>Customer:</strong> {(selectedOrder.shippingAddress || selectedOrder.shipping_address)?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {(selectedOrder.shippingAddress || selectedOrder.shipping_address)?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {(selectedOrder.shippingAddress || selectedOrder.shipping_address)?.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {(selectedOrder.shippingAddress || selectedOrder.shipping_address)?.street || (selectedOrder.shippingAddress || selectedOrder.shipping_address)?.address || 'N/A'}</p>
                <p><strong>City:</strong> {(selectedOrder.shippingAddress || selectedOrder.shipping_address)?.city || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-[#1A1A1A] mb-3">Items</h4>
              <div className="space-y-2">
                {(selectedOrder.items || []).map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 text-sm">
                    <span>{item.name || 'Product'} x {item.quantity}</span>
                    <span className="font-semibold">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-[#1A1A1A] mb-3">Timeline</h4>
              <div className="space-y-2">
                {(selectedOrder.orderTimeline || []).map((event, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <p><strong className="capitalize">{event.status}</strong> - {event.note || 'Status updated'}</p>
                    <p className="text-gray-500 mt-1">{new Date(event.timestamp).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
