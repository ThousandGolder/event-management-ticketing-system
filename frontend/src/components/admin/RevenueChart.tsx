"use client";

import { TrendingUp, DollarSign } from "lucide-react";
import { useState } from "react";

export default function RevenueChart() {
  const [timeRange, setTimeRange] = useState("month");

  const revenueData = {
    month: [65000, 59000, 80000, 81000, 56000, 55000, 70000],
    quarter: [180000, 210000, 190000, 240000],
    year: [1200000, 1400000, 1600000, 1800000],
  };

  const currentData = revenueData[timeRange as keyof typeof revenueData];
  const maxValue = Math.max(...currentData);
  const totalRevenue = currentData.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Revenue Overview</h2>
          <p className="text-gray-600 text-sm">
            Total revenue from ticket sales
          </p>
        </div>
        <div className="flex space-x-2">
          {["week", "month", "quarter", "year"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <div className="flex items-end justify-between h-48">
          {currentData.map((value, index) => {
            const height = (value / maxValue) * 100;
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="w-8 bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${height}%` }}
                />
                <div className="mt-2 text-xs text-gray-500">
                  {timeRange === "month"
                    ? `W${index + 1}`
                    : timeRange === "quarter"
                    ? `Q${index + 1}`
                    : `Month ${index + 1}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div>
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ETB {totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end space-x-1 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-semibold">+12.5%</span>
          </div>
          <p className="text-sm text-gray-600">from last {timeRange}</p>
        </div>
      </div>
    </div>
  );
}
