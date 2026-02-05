
'use client';

import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

export default function AdminSidebarWrapper() {
  const pathname = usePathname();
  return <AdminSidebar activePath={pathname} />;
}
