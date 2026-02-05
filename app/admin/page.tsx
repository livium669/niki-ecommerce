
import React from 'react';
import { getAdminDashboardStats } from '@/lib/actions/admin';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Dashboard | Niki',
};

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Dashboard</h1>
        <p className="text-zinc-400">Welcome back to your store overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-2xl">
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Total Sales</p>
          <p className="text-4xl font-black">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalSales)}
          </p>
        </div>
        <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-2xl">
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Total Orders</p>
          <p className="text-4xl font-black">{stats.totalOrders}</p>
        </div>
        <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-2xl">
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Total Products</p>
          <p className="text-4xl font-black">{stats.totalProducts}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-zinc-900/30 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-bold uppercase tracking-wide">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-zinc-400 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">{order.userEmail}</td>
                    <td className="px-6 py-4">
                      <span className={`
                        inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' : 
                          order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                          order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                          order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-zinc-500/20 text-zinc-400'}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(order.totalAmount))}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
