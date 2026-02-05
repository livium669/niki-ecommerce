
'use client';

import { useState, useTransition } from 'react';
import { updateOrderStatus } from '@/lib/actions/admin';
import { useRouter } from 'next/navigation';

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: string;
}

export default function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as any;
    setStatus(newStatus);
    
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.error) {
        alert("Failed to update status");
        setStatus(currentStatus); // Revert
      } else {
        router.refresh();
      }
    });
  };

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'delivered': return 'text-green-400';
      case 'shipped': return 'text-blue-400';
      case 'paid': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="relative">
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        className={`
          appearance-none bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer
          focus:outline-none focus:border-white transition-colors pr-8
          ${getStatusColor(status)}
        `}
      >
        <option value="pending" className="text-zinc-400">Pending</option>
        <option value="paid" className="text-yellow-400">Paid</option>
        <option value="shipped" className="text-blue-400">Shipped</option>
        <option value="delivered" className="text-green-400">Delivered</option>
        <option value="cancelled" className="text-red-400">Cancelled</option>
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  );
}
