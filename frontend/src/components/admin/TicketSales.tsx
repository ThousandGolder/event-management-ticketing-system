"use client";

import { Ticket, TrendingUp, TrendingDown } from "lucide-react";

export default function TicketSales() {
  const salesData = [
    {
      event: "Music Festival",
      sold: 1500,
      total: 2000,
      revenue: "750,000 ETB",
    },
    { event: "Tech Conference", sold: 500, total: 800, revenue: "150,000 ETB" },
    { event: "Art Exhibition", sold: 300, total: 400, revenue: "60,000 ETB" },
    { event: "Food Festival", sold: 2000, total: 2000, revenue: "500,000 ETB" },
    { event: "Startup Pitch", sold: 200, total: 300, revenue: "40,000 ETB" },
  ];

  const totalSold = salesData.reduce((sum, item) => sum + item.sold, 0);
  const totalRevenue = salesData.reduce((sum, item) => {
    const revenue = parseInt(item.revenue.replace(/[^0-9]/g, ""));
    return sum + revenue;
  }, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Ticket Sales</h2>
          <p className="text-gray-600 text-sm">
            Real-time ticket sales overview
          </p>
        </div>
        <div className="flex items-center space-x-2 text-green-600">
          <TrendingUp className="h-5 w-5" />
          <span className="font-semibold">+24%</span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tickets Sold</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalSold.toLocaleString()}
              </p>
            </div>
            <Ticket className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalRevenue.toLocaleString()} ETB
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 text-sm font-medium text-gray-600">
                Event
              </th>
              <th className="text-left py-3 text-sm font-medium text-gray-600">
                Sold
              </th>
              <th className="text-left py-3 text-sm font-medium text-gray-600">
                Total
              </th>
              <th className="text-left py-3 text-sm font-medium text-gray-600">
                Revenue
              </th>
              <th className="text-left py-3 text-sm font-medium text-gray-600">
                Progress
              </th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((item, index) => {
              const percentage = (item.sold / item.total) * 100;
              return (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-4">
                    <span className="font-medium text-gray-900">
                      {item.event}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="font-medium text-gray-900">
                      {item.sold.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="text-gray-600">
                      {item.total.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="font-bold text-gray-900">
                      {item.revenue}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percentage >= 80
                            ? "bg-green-500"
                            : percentage >= 50
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 mt-1">
                      {percentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
