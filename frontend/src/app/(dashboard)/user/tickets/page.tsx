"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Download,
  Eye,
  Filter,
  Search,
  Ticket,
  Calendar,
  MapPin,
} from "lucide-react";

export default function UserTicketsPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const filters = [
    { id: "all", label: "All Tickets" },
    { id: "confirmed", label: "Confirmed" },
    { id: "pending", label: "Pending" },
    { id: "cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    if (!user) return;

    const fetchTickets = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/tickets?userId=${user.id}`
        );
        const data = await res.json();
        if (res.ok) {
          setTickets(data);
        } else {
          console.error("Failed to fetch tickets:", data.message || data.error);
        }
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  const filteredTickets =
    activeFilter === "all"
      ? tickets
      : tickets.filter((ticket) => ticket.status === activeFilter);

  if (isLoading) return <p>Loading tickets...</p>;
  if (!user) return <p>Please log in to view your tickets.</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          My Tickets
        </h1>
        <p className="text-gray-600 mt-2">
          Manage and view all your purchased tickets
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search tickets by event or ticket ID..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeFilter === filter.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      ticket.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : ticket.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {ticket.status.charAt(0).toUpperCase() +
                      ticket.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    #{ticket.ticketId}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {ticket.event}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {ticket.price}
                </p>
                <p className="text-sm text-gray-600">
                  {ticket.quantity} ticket{ticket.quantity > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 space-y-3">
              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                <span>{ticket.date}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                <span>{ticket.location}</span>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6 pt-6 border-t">
                <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                  <Eye className="h-5 w-5" />
                  <span>View Details</span>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Download className="h-5 w-5" />
                  <span>Download Ticket</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tickets found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {activeFilter === "all"
              ? "You haven't purchased any tickets yet."
              : `No ${activeFilter} tickets found.`}
          </p>
          <button className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Browse Events
          </button>
        </div>
      )}
    </div>
  );
}
