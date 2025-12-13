"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  TrendingUp,
  Download,
  BarChart3,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  city: string;
  organizer: string;
  organizerEmail: string;
  ticketsSold: number;
  totalTickets: number;
  revenue: number;
  status: "active" | "pending" | "completed" | "cancelled" | "suspended";
  category: string;
  createdAt: string;
  lastUpdated: string;
}

export default function AdminEventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8;

  const events: Event[] = [
    {
      id: 1,
      title: "Music Festival 2024",
      date: "Mar 15, 2024",
      time: "6:00 PM",
      location: "Addis Ababa Stadium",
      city: "Addis Ababa",
      organizer: "Ethiopian Arts Council",
      organizerEmail: "arts@council.et",
      ticketsSold: 1500,
      totalTickets: 2000,
      revenue: 750000,
      status: "active",
      category: "Music",
      createdAt: "2024-01-15",
      lastUpdated: "2024-03-01",
    },
    {
      id: 2,
      title: "Tech Conference & Expo",
      date: "Mar 22, 2024",
      time: "9:00 AM",
      location: "Millennium Hall",
      city: "Addis Ababa",
      organizer: "Ethio Tech Hub",
      organizerEmail: "info@ethiotech.et",
      ticketsSold: 500,
      totalTickets: 800,
      revenue: 150000,
      status: "active",
      category: "Technology",
      createdAt: "2024-01-20",
      lastUpdated: "2024-02-28",
    },
    {
      id: 3,
      title: "Traditional Art Exhibition",
      date: "Apr 5, 2024",
      time: "10:00 AM",
      location: "National Museum",
      city: "Addis Ababa",
      organizer: "Cultural Heritage Association",
      organizerEmail: "heritage@culture.et",
      ticketsSold: 300,
      totalTickets: 400,
      revenue: 60000,
      status: "pending",
      category: "Art & Culture",
      createdAt: "2024-02-01",
      lastUpdated: "2024-02-25",
    },
    {
      id: 4,
      title: "Food Festival & Cooking Show",
      date: "Feb 28, 2024",
      time: "11:00 AM",
      location: "Meskel Square",
      city: "Addis Ababa",
      organizer: "Ethiopian Chefs Association",
      organizerEmail: "chefs@association.et",
      ticketsSold: 2000,
      totalTickets: 2000,
      revenue: 500000,
      status: "completed",
      category: "Food & Drink",
      createdAt: "2024-01-10",
      lastUpdated: "2024-02-28",
    },
    {
      id: 5,
      title: "Startup Pitch Competition",
      date: "Apr 18, 2024",
      time: "2:00 PM",
      location: "Blue Moon Hotel",
      city: "Adama",
      organizer: "Startup Ethiopia",
      organizerEmail: "pitch@startup.et",
      ticketsSold: 200,
      totalTickets: 300,
      revenue: 40000,
      status: "active",
      category: "Business",
      createdAt: "2024-02-15",
      lastUpdated: "2024-03-05",
    },
    {
      id: 6,
      title: "Marathon for Charity",
      date: "Apr 25, 2024",
      time: "7:00 AM",
      location: "Unity Park",
      city: "Bahir Dar",
      organizer: "Charity Run Ethiopia",
      organizerEmail: "run@charity.et",
      ticketsSold: 1000,
      totalTickets: 1500,
      revenue: 50000,
      status: "pending",
      category: "Sports",
      createdAt: "2024-02-20",
      lastUpdated: "2024-03-02",
    },
    {
      id: 7,
      title: "Jazz Night Concert",
      date: "Mar 30, 2024",
      time: "8:00 PM",
      location: "Sheraton Hotel",
      city: "Addis Ababa",
      organizer: "Jazz Society",
      organizerEmail: "jazz@society.et",
      ticketsSold: 400,
      totalTickets: 500,
      revenue: 120000,
      status: "cancelled",
      category: "Music",
      createdAt: "2024-01-25",
      lastUpdated: "2024-02-20",
    },
    {
      id: 8,
      title: "Health & Wellness Expo",
      date: "Apr 12, 2024",
      time: "9:00 AM",
      location: "Hilton Hotel",
      city: "Addis Ababa",
      organizer: "Health Ministry",
      organizerEmail: "info@health.gov.et",
      ticketsSold: 0,
      totalTickets: 1000,
      revenue: 0,
      status: "suspended",
      category: "Health & Wellness",
      createdAt: "2024-02-10",
      lastUpdated: "2024-03-01",
    },
    {
      id: 9,
      title: "Educational Seminar",
      date: "Apr 20, 2024",
      time: "10:00 AM",
      location: "Addis Ababa University",
      city: "Addis Ababa",
      organizer: "Education Board",
      organizerEmail: "seminar@education.et",
      ticketsSold: 150,
      totalTickets: 300,
      revenue: 30000,
      status: "active",
      category: "Education",
      createdAt: "2024-02-25",
      lastUpdated: "2024-03-03",
    },
    {
      id: 10,
      title: "Film Festival",
      date: "May 5, 2024",
      time: "4:00 PM",
      location: "City Cinema",
      city: "Mekelle",
      organizer: "Film Association",
      organizerEmail: "film@association.et",
      ticketsSold: 600,
      totalTickets: 800,
      revenue: 180000,
      status: "active",
      category: "Entertainment",
      createdAt: "2024-02-28",
      lastUpdated: "2024-03-04",
    },
  ];

  const categories = [
    "All Categories",
    "Music",
    "Technology",
    "Art & Culture",
    "Food & Drink",
    "Business",
    "Sports",
    "Education",
    "Health & Wellness",
    "Entertainment",
  ];

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || event.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  // Calculate statistics
  const totalRevenue = filteredEvents.reduce(
    (sum, event) => sum + event.revenue,
    0
  );
  const totalTicketsSold = filteredEvents.reduce(
    (sum, event) => sum + event.ticketsSold,
    0
  );
  const totalTicketsAvailable = filteredEvents.reduce(
    (sum, event) => sum + event.totalTickets,
    0
  );
  const activeEvents = filteredEvents.filter(
    (event) => event.status === "active"
  ).length;
  const pendingEvents = filteredEvents.filter(
    (event) => event.status === "pending"
  ).length;

  const handleSelectEvent = (id: number) => {
    setSelectedEvents((prev) =>
      prev.includes(id)
        ? prev.filter((eventId) => eventId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEvents.length === currentEvents.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(currentEvents.map((event) => event.id));
    }
  };

  const handleAction = (action: string, eventId: number) => {
    switch (action) {
      case "approve":
        alert(`Approving event ${eventId}`);
        break;
      case "reject":
        alert(`Rejecting event ${eventId}`);
        break;
      case "suspend":
        alert(`Suspending event ${eventId}`);
        break;
      case "delete":
        if (confirm("Are you sure you want to delete this event?")) {
          alert(`Deleting event ${eventId}`);
        }
        break;
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedEvents.length === 0) {
      alert("Please select events first");
      return;
    }
    alert(`Performing ${action} on ${selectedEvents.length} events`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Event Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all platform events, approve submissions, and track
            performance
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard/admin/events/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Create Event
          </Link>
          <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center">
            <Download className="h-5 w-5 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {filteredEvents.length}
              </p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {activeEvents}
              </p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {pendingEvents}
              </p>
            </div>
            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tickets Sold</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalTicketsSold.toLocaleString()}
              </p>
            </div>
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ETB {totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search events by title, organizer, location, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[160px]"
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category === "All Categories" ? "all" : category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery ||
          statusFilter !== "all" ||
          categoryFilter !== "all") && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {categoryFilter !== "all" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    Category: {categoryFilter}
                    <button
                      onClick={() => setCategoryFilter("all")}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedEvents.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {selectedEvents.length}
                </span>
              </div>
              <span className="text-blue-800 font-medium">
                {selectedEvents.length} event
                {selectedEvents.length > 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkAction("approve")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Selected
              </button>
              <button
                onClick={() => handleBulkAction("suspend")}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium flex items-center"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Suspend Selected
              </button>
              <button
                onClick={() => handleBulkAction("delete")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedEvents([])}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-4 px-6">
                  <input
                    type="checkbox"
                    checked={
                      selectedEvents.length === currentEvents.length &&
                      currentEvents.length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                  Event Details
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                  Date & Location
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                  Organizer
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                  Tickets
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                  Revenue
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentEvents.map((event) => (
                <tr key={event.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event.id)}
                      onChange={() => handleSelectEvent(event.id)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-600">
                        ID: #{event.id} • {event.category}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {event.createdAt}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <span className="text-gray-900">{event.date}</span>
                          <span className="text-gray-500 ml-2">
                            {event.time}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <span className="text-gray-900">
                            {event.location}
                          </span>
                          <span className="text-gray-500 ml-2">
                            • {event.city}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">
                        {event.organizer}
                      </p>
                      <p className="text-sm text-gray-600">
                        {event.organizerEmail}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-900 font-medium">
                          {event.ticketsSold.toLocaleString()}
                        </span>
                        <span className="text-gray-600">
                          of {event.totalTickets.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            event.ticketsSold / event.totalTickets >= 0.8
                              ? "bg-green-500"
                              : event.ticketsSold / event.totalTickets >= 0.5
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                          }`}
                          style={{
                            width: `${
                              (event.ticketsSold / event.totalTickets) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(
                          (event.ticketsSold / event.totalTickets) * 100
                        )}
                        % sold
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-bold text-gray-900">
                        ETB {event.revenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Avg:{" "}
                        {event.ticketsSold > 0
                          ? Math.round(event.revenue / event.ticketsSold)
                          : 0}{" "}
                        ETB/ticket
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        event.status === "active"
                          ? "bg-green-100 text-green-800"
                          : event.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : event.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : event.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {event.status.charAt(0).toUpperCase() +
                        event.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/admin/events/${event.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/admin/events/${event.id}/edit`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Edit Event"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      {event.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleAction("approve", event.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleAction("reject", event.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleAction("delete", event.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {currentEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {filteredEvents.length > 0 && (
          <div className="px-6 py-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstEvent + 1} to{" "}
              {Math.min(indexOfLastEvent, filteredEvents.length)} of{" "}
              {filteredEvents.length} events
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
