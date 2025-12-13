"use client";

import {
  Calendar,
  MapPin,
  Users,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { useState } from "react";

const events = [
  {
    id: 1,
    title: "የኢትዮጵያ ሙዚቃ ፌስቲቫል",
    category: "ሙዚቃ",
    date: "ጁን 15, 2024",
    time: "6:00 PM",
    venue: "ሚለኒየም አዳራሽ",
    ticketsSold: 850,
    totalTickets: 1000,
    revenue: "₦425,000",
    status: "እየተሸጠ",
    statusColor: "bg-green-100 text-green-800",
  },
  {
    id: 2,
    title: "የቴክኖሎጂ ስብሰባ 2024",
    category: "ስብሰባ",
    date: "ጁላይ 20, 2024",
    time: "9:00 AM",
    venue: "ሸራተን አዲስ",
    ticketsSold: 320,
    totalTickets: 500,
    revenue: "₦480,000",
    status: "እየተሸጠ",
    statusColor: "bg-green-100 text-green-800",
  },
  {
    id: 3,
    title: "እስፖርታዊ ውድድር",
    category: "እስፖርት",
    date: "ሚያዝያ 10, 2024",
    time: "3:00 PM",
    venue: "አዲስ አበባ ስታዲየም",
    ticketsSold: 1200,
    totalTickets: 1500,
    revenue: "₦600,000",
    status: "ተጠናቋል",
    statusColor: "bg-blue-100 text-blue-800",
  },
  {
    id: 4,
    title: "የባህል ማሳያ",
    category: "ባህል",
    date: "ሰኔ 5, 2024",
    time: "10:00 AM",
    venue: "አፍሪካ ሆል",
    ticketsSold: 450,
    totalTickets: 800,
    revenue: "₦225,000",
    status: "በማጠናቀቅ ላይ",
    statusColor: "bg-yellow-100 text-yellow-800",
  },
];

export default function RecentEvents() {
  const [activeEvent, setActiveEvent] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ዝግጅት
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ቀን & ሰዓት
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ትኬቶች
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ገቢ
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ሁኔታ
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              እርምጃ
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {events.map((event) => (
            <tr key={event.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {event.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {event.category}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{event.date}</div>
                <div className="text-sm text-gray-500">{event.time}</div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {event.venue}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {event.ticketsSold}/{event.totalTickets}
                    </div>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (event.ticketsSold / event.totalTickets) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {event.revenue}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${event.statusColor}`}
                >
                  {event.status}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium relative">
                <button
                  onClick={() =>
                    setActiveEvent(activeEvent === event.id ? null : event.id)
                  }
                  className="text-gray-400 hover:text-gray-600"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                {activeEvent === event.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>ይመልከቱ</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 flex items-center space-x-2">
                      <Edit className="h-4 w-4" />
                      <span>አርትዕ</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2">
                      <Trash2 className="h-4 w-4" />
                      <span>ሰርዝ</span>
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
