'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Album,
  Images,
  Music,
  Settings,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

interface AdminSidebarProps {
  onLogout: () => void;
}

export function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/albums', label: 'Albums', icon: Album },
    { href: '/admin/photos', label: 'Photos', icon: Images },
    { href: '/admin/music', label: 'Music', icon: Music },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">Wedding Flipbook</h1>
        <p className="text-xs text-slate-400 mt-1">Admin Panel</p>
      </div>

      <nav className="px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <form action={onLogout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
