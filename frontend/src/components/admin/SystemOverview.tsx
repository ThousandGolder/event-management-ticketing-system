"use client";

import {
  Server,
  Database,
  Cpu,
  Shield,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function SystemOverview() {
  const systemMetrics = [
    { label: "API Response", value: "98ms", status: "good", icon: Cpu },
    { label: "Server Load", value: "45%", status: "good", icon: Server },
    { label: "Database", value: "2.3GB", status: "warning", icon: Database },
    { label: "Security", value: "Active", status: "good", icon: Shield },
  ];

  const activeIssues = [
    { id: 1, title: "Database backup pending", priority: "medium" },
    { id: 2, title: "SSL certificate renewal", priority: "low" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">System Overview</h2>
        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
          All Systems Operational
        </span>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {systemMetrics.map((metric) => (
          <div key={metric.label} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <metric.icon
                className={`h-5 w-5 ${
                  metric.status === "good"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              />
              <span
                className={`h-2 w-2 rounded-full ${
                  metric.status === "good" ? "bg-green-500" : "bg-yellow-500"
                }`}
              />
            </div>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            <p className="text-sm text-gray-600">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Active Issues */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-900">Active Issues</h3>
          </div>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
            {activeIssues.length} issues
          </span>
        </div>

        <div className="space-y-3">
          {activeIssues.map((issue) => (
            <div
              key={issue.id}
              className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`h-2 w-2 rounded-full ${
                    issue.priority === "high"
                      ? "bg-red-500"
                      : issue.priority === "medium"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
                />
                <span className="text-sm text-gray-900">{issue.title}</span>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Resolve
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Last Update */}
      <div className="mt-6 pt-6 border-t text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>Last updated: Just now</span>
        </div>
      </div>
    </div>
  );
}
