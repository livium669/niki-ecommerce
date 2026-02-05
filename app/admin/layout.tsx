
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebarWrapper from "@/components/admin/AdminSidebarWrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Admin check: only allow user with email matching ADMIN_EMAIL
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }

  // If ADMIN_EMAIL is set, enforce it. If not set, strictly block access for security.
  if (!adminEmail || session.user.email !== adminEmail) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black text-white gap-4">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-zinc-400">You do not have permission to view this page.</p>
        {!adminEmail && (
          <p className="text-xs text-zinc-600 bg-zinc-900 p-2 rounded">
            Configuration Error: ADMIN_EMAIL environment variable is not set.
          </p>
        )}
        <a href="/" className="text-sm underline hover:text-white">Return to Store</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      <AdminSidebarWrapper />
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
