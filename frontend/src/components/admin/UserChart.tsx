"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type User = {
  id: number;
  name: string;
  email: string;
  role: string; // Changed to string to accept any role
  status: "Active" | "Inactive";
};

type Props = {
  users: User[];
};

// Define colors for common roles
const ROLE_COLORS: Record<string, string> = {
  Admin: "#2563eb",
  Moderator: "#16a34a",
  Organizer: "#8b5cf6",
  User: "#f59e0b",
  Attendee: "#10b981",
};

const STATUS_COLORS = ["#10b981", "#ef4444"];

export function UserChart({ users }: Props) {
  // Count users by role dynamically
  const roleCounts: Record<string, number> = {};
  users.forEach((user) => {
    const role = user.role;
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });

  // Convert to array for chart
  const roleData = Object.entries(roleCounts).map(([name, value]) => ({
    name,
    value,
    color: ROLE_COLORS[name] || "#6b7280", // Default gray for unknown roles
  }));

  const statusData = [
    {
      name: "Active",
      value: users.filter((u) => u.status === "Active").length,
    },
    {
      name: "Inactive",
      value: users.filter((u) => u.status === "Inactive").length,
    },
  ];

  // If no users, show message
  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 w-full border rounded-lg">
        <p className="text-muted-foreground">
          No user data available for analytics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Active Users</p>
          <p className="text-2xl font-bold text-green-600">
            {statusData[0].value}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Inactive Users</p>
          <p className="text-2xl font-bold text-red-600">
            {statusData[1].value}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Unique Roles</p>
          <p className="text-2xl font-bold">{roleData.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Users by Role */}
        <div className="h-64 w-full">
          <h3 className="mb-2 font-semibold">Users by Role</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                {roleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Users by Status */}
        <div className="h-64 w-full">
          <h3 className="mb-2 font-semibold">User Status Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.name}: ${entry.value}`}
                labelLine={false}
              >
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Role distribution table */}
      <div className="border rounded-lg p-4">
        <h3 className="mb-4 font-semibold">Role Distribution Details</h3>
        <div className="space-y-2">
          {roleData.map((role) => (
            <div key={role.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: role.color }}
                />
                <span>{role.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium">{role.value} users</span>
                <span className="text-sm text-muted-foreground">
                  ({((role.value / users.length) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
