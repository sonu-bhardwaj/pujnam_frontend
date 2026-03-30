import React, { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, AlertTriangle, Package } from 'lucide-react';
import { ordersApi, productsApi } from '../../lib/api';
import { mapOrder, mapProduct } from '../../lib/mappers';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersResponse, productsResponse] = await Promise.all([
          ordersApi.getAllAdmin({ page: 1, limit: 500 }),
          productsApi.getAll({ limit: 500 }),
        ]);

        // Handle authentication errors
        if (ordersResponse.error && ordersResponse.error.includes('token')) {
          console.error('Authentication required. Please login.');
          return;
        }

        const orders = (ordersResponse.data?.orders || []).map(mapOrder);
        const products = (productsResponse.data?.products || []).map(mapProduct);

        const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
        const pendingOrders = orders.filter(
          (order) => (order.status || order.orderStatus) === 'pending'
        ).length;
        const lowStockProducts = products.filter(
          (product) => (product.stock_quantity ?? product.stock ?? 0) < (product.low_stock_threshold ?? 5)
        ).length;

        setStats({
          totalOrders: orders.length,
          pendingOrders,
          totalProducts: products.length,
          lowStockProducts,
          totalRevenue: revenue,
        });
      } catch (error) {
        console.error('Failed to load dashboard stats', error);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-blue-500',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Package,
      color: 'bg-yellow-500',
    },
    {
      title: 'Low Stock Alert',
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#1A1A1A]">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-[#1A1A1A]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">Recent Activity</h3>
          <p className="text-gray-600">Order tracking and recent transactions will appear here.</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="btn-primary w-full">Add New Product</button>
            <button className="btn-secondary w-full">View All Orders</button>
          </div>
        </div>
      </div>
    </div>
  );
};
