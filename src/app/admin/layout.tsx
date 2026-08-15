import { logout } from '@/lib/auth-actions';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-950">
      <AdminSidebar onLogout={logout} />
      <main className="flex-1 overflow-auto">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
