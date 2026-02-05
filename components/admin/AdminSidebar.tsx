
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarLinks = [
  { name: 'Dashboard', href: '/admin', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
  )},
  { name: 'Products', href: '/admin/products', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
  )},
  { name: 'Orders', href: '/admin/orders', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  )},
];

export default function AdminSidebar({ activePath }: { activePath: string }) {
  return (
    <aside className="w-64 bg-zinc-900 border-r border-white/10 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white">NIKI <span className="text-xs font-normal text-zinc-500 tracking-widest uppercase ml-1">Admin</span></Link>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {sidebarLinks.map((link) => {
          const isActive = activePath === link.href || (link.href !== '/admin' && activePath.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${
                isActive ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          Exit Admin
        </Link>
      </div>
    </aside>
  );
}
