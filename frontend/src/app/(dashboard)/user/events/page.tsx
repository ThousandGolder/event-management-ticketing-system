"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  Search,
  Filter,
  Star,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  CheckCircle,
  Clock,
  TrendingUp,
  Share2,
  Download,
} from "lucide-react";

interface UserEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  city: string;
  category: string;
  ticketsSold: number;
  totalTickets: number;
  revenue: number;
  status: "active" | "upcoming" | "completed" | "draft" | "cancelled";
  role: "organizer" | "attendee";
  registrationDate?: string;
  ticketCount?: number;
  isSaved?: boolean;
}

export default function UserEventsPage() {
  const [activeTab, setActiveTab] = useState("attending");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const userEvents: UserEvent[] = [
    // Events user is attending
    {
      id: 1,
      title: "Music Festival 2024",
      date: "Mar 15, 2024",
      time: "6:00 PM",
      location: "Addis Ababa Stadium",
      city: "Addis Ababa",
      category: "Music",
      ticketsSold: 1500,
      totalTickets: 2000,
      revenue: 750000,
      status: "active",
      role: "attendee",
      registrationDate: "2024-02-15",
      ticketCount: 2,
      isSaved: true,
    },
    {
      id: 2,
      title: "Tech Conference & Expo",
      date: "Mar 22, 2024",
      time: "9:00 AM",
      location: "Millennium Hall",
      city: "Addis Ababa",
      category: "Technology",
      ticketsSold: 500,
      totalTickets: 800,
      revenue: 150000,
      status: "active",
      role: "attendee",
      registrationDate: "2024-02-20",
      ticketCount: 1,
      isSaved: true,
    },
    {
      id: 3,
      title: "Art Exhibition",
      date: "Apr 5, 2024",
      time: "10:00 AM",
      location: "National Museum",
      city: "Addis Ababa",
      category: "Art & Culture",
      ticketsSold: 300,
      totalTickets: 400,
      revenue: 60000,
      status: "upcoming",
      role: "attendee",
      registrationDate: "2024-03-01",
      ticketCount: 4,
      isSaved: false,
    },

    // Events user is organizing
    {
      id: 4,
      title: "Local Startup Meetup",
      date: "Apr 18, 2024",
      time: "2:00 PM",
      location: "Innovation Hub",
      city: "Addis Ababa",
      category: "Business",
      ticketsSold: 50,
      totalTickets: 100,
      revenue: 10000,
      status: "active",
      role: "organizer",
    },
    {
      id: 5,
      title: "Yoga & Meditation Retreat",
      date: "May 10, 2024",
      time: "7:00 AM",
      location: "Entoto Park",
      city: "Addis Ababa",
      category: "Health & Wellness",
      ticketsSold: 0,
      totalTickets: 30,
      revenue: 0,
      status: "draft",
      role: "organizer",
    },
    {
      id: 6,
      title: "Food Tasting Festival",
      date: "Feb 28, 2024",
      time: "11:00 AM",
      location: "Local Market",
      city: "Addis Ababa",
      category: "Food & Drink",
      ticketsSold: 120,
      totalTickets: 150,
      revenue: 36000,
      status: "completed",
      role: "organizer",
    },

    // Past events attended
    {
      id: 7,
      title: "Charity Run 2023",
      date: "Dec 10, 2023",
      time: "7:00 AM",
      location: "Unity Park",
      city: "Bahir Dar",
      category: "Sports",
      ticketsSold: 1000,
      totalTickets: 1200,
      revenue: 50000,
      status: "completed",
      role: "attendee",
      registrationDate: "2023-11-15",
      ticketCount: 1,
      isSaved: false,
    },
    {
      id: 8,
      title: "Film Screening Night",
      date: "Jan 20, 2024",
      time: "6:00 PM",
      location: "City Cinema",
      city: "Addis Ababa",
      category: "Entertainment",
      ticketsSold: 200,
      totalTickets: 250,
      revenue: 40000,
      status: "completed",
      role: "attendee",
      registrationDate: "2024-01-10",
      ticketCount: 2,
      isSaved: true,
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
    "Health & Wellness",
    "Entertainment",
  ];

  const tabs = [
    {
      id: "attending",
      label: "Events I'm Attending",
      count: userEvents.filter(
        (e) => e.role === "attendee" && e.status !== "completed"
      ).length,
    },
    {
      id: "organizing",
      label: "Events I'm Organizing",
      count: userEvents.filter((e) => e.role === "organizer").length,
    },
    {
      id: "past",
      label: "Past Events",
      count: userEvents.filter((e) => e.status === "completed").length,
    },
    {
      id: "saved",
      label: "Saved Events",
      count: userEvents.filter((e) => e.isSaved).length,
    },
  ];

  const filteredEvents = userEvents.filter((event) => {
    const matchesTab =
      (activeTab === "attending" &&
        event.role === "attendee" &&
        event.status !== "completed") ||
      (activeTab === "organizing" && event.role === "organizer") ||
      (activeTab === "past" && event.status === "completed") ||
      (activeTab === "saved" && event.isSaved);

    const matchesSearch =
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || event.category === categoryFilter;

    return matchesTab && matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const attendingCount = userEvents.filter(
    (e) => e.role === "attendee" && e.status !== "completed"
  ).length;
  const organizingCount = userEvents.filter(
    (e) => e.role === "organizer"
  ).length;
  const totalTickets = userEvents
    .filter((e) => e.role === "attendee")
    .reduce((sum, event) => sum + (event.ticketCount || 0), 0);
  const savedCount = userEvents.filter((e) => e.isSaved).length;

  const handleSaveEvent = (id: number) => {
    // Toggle save status
    console.log("Toggling save for event:", id);
  };

  const handleDownloadTicket = (id: number) => {
    console.log("Downloading ticket for event:", id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            My Events
          </h1>
          <p className="text-gray-600 mt-2">
            Manage events you're attending and organizing
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/events/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Event
          </Link>
          <Link
            href="/events"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Browse Events
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Attending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {attendingCount}
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
              <p className="text-sm text-gray-600">Organizing</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {organizingCount}
              </p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalTickets}
              </p>
            </div>
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Ticket className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saved Events</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {savedCount}
              </p>
            </div>
            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-4 text-sm font-medium rounded-md transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="Search my events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          event.status === "active" ||
                          event.status === "upcoming"
                            ? "bg-green-100 text-green-800"
                            : event.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {event.status.charAt(0).toUpperCase() +
                          event.status.slice(1)}
                      </span>
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {event.role === "organizer" ? "Organizer" : "Attendee"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 mt-1">{event.category}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {event.role === "attendee" && (
                      <button
                        onClick={() => handleSaveEvent(event.id)}
                        className={`p-2 rounded-lg ${
                          event.isSaved
                            ? "text-yellow-500 hover:bg-yellow-50"
                            : "text-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        <Star
                          className={`h-5 w-5 ${
                            event.isSaved ? "fill-current" : ""
                          }`}
                        />
                      </button>
                    )}
                    <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{event.date}</span>
                      <span className="text-gray-500 ml-2">{event.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{event.location}</span>
                      <span className="text-gray-500 ml-2">• {event.city}</span>
                    </div>
                  </div>
                  {event.role === "attendee" && event.registrationDate && (
                    <div className="flex items-center text-gray-700">
                      <Clock className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Registered on:</span>
                        <span className="text-gray-500 ml-2">
                          {event.registrationDate}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats and Actions */}
                <div className="flex items-center justify-between pt-6 border-t">
                  {event.role === "organizer" ? (
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Tickets Sold
                        </span>
                        <span className="font-bold text-gray-900">
                          {event.ticketsSold} / {event.totalTickets}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{
                            width: `${
                              (event.ticketsSold / event.totalTickets) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>
                          Revenue: ETB {event.revenue.toLocaleString()}
                        </span>
                        <span>
                          {Math.round(
                            (event.ticketsSold / event.totalTickets) * 100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm text-gray-600">Your Tickets</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {event.ticketCount}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    {event.role === "organizer" ? (
                      <>
                        <Link
                          href={`/dashboard/user/events/${event.id}/edit`}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDownloadTicket(event.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Ticket
                        </button>
                        <Link
                          href={`/events/${event.id}`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                        >
                          View
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === "attending" && (
                <Calendar className="h-8 w-8 text-gray-400" />
              )}
              {activeTab === "organizing" && (
                <TrendingUp className="h-8 w-8 text-gray-400" />
              )}
              {activeTab === "past" && (
                <CheckCircle className="h-8 w-8 text-gray-400" />
              )}
              {activeTab === "saved" && (
                <Star className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === "attending" && "No events to attend"}
              {activeTab === "organizing" && "No events organized"}
              {activeTab === "past" && "No past events"}
              {activeTab === "saved" && "No saved events"}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === "attending" &&
                "Start browsing events to find ones you'd like to attend"}
              {activeTab === "organizing" &&
                "Create your first event and start selling tickets"}
              {activeTab === "past" && "Attend events to see them here"}
              {activeTab === "saved" && "Save events you're interested in"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {activeTab === "attending" && (
                <Link
                  href="/events"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Browse Events
                </Link>
              )}
              {activeTab === "organizing" && (
                <Link
                  href="/events/create"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Event
                </Link>
              )}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Ready to create your own event?
            </h2>
            <p className="text-blue-100">
              Share your passion with others and earn revenue from ticket sales
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/events/create"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 text-center"
            >
              Create Event
            </Link>
            <Link
              href="/help/organizers"
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 text-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
