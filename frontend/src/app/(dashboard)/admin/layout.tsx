export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Admin-specific header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Administrator Dashboard
            </h1>
            <p className="opacity-90">
              Manage users, events, and platform analytics
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👑</span>
            </div>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
