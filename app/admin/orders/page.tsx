
import React from 'react';
import { getAdminOrders } from '@/lib/actions/admin';
import OrderStatusSelect from '@/components/admin/OrderStatusSelect';
import Pagination from '@/components/ui/Pagination';
import AdminOrderFilters from '@/components/admin/AdminOrderFilters';

export const metadata = {
  title: 'Orders Management | Niki Admin',
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? Number(params.page) : 1;
  const search = typeof params.search === 'string' ? params.search : undefined;
  const status = typeof params.status === 'string' ? params.status : undefined;
  
  const { data: orders, totalPages } = await getAdminOrders({ page, search, status });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Orders</h1>
        <p className="text-zinc-400">Manage customer orders and shipments.</p>
      </div>

      <AdminOrderFilters />

      <div className="bg-zinc-900/30 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-zinc-400 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{order.customer || 'Unknown'}</div>
                      <div className="text-xs text-zinc-500">{order.email}</div>
                    </td>
                    <td className="px-6 py-4">{order.itemsCount} items</td>
                    <td className="px-6 py-4 font-bold">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(order.totalAmount))}
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}
