export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="absolute top-6 left-6">
        <h1 className="text-2xl font-bold text-primary">EventHub</h1>
      </div>
      {children}
    </div>
  );
}
