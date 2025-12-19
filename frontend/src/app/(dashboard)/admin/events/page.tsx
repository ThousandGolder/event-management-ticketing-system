//frontend/src/app/(dashboard)/admin/events/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  TrendingUp,
  Download,
  BarChart3,
  AlertCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { eventsAPI } from "@/lib/api/events";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type EventStatus =
  | "active"
  | "pending"
  | "completed"
  | "cancelled"
  | "suspended";

interface EventItem {
  eventId: string;
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
  status: EventStatus;
  category: string;
  description: string;
  imageUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Add this interface for statistics response
interface StatisticsResponse {
  success: boolean;
  totalEvents?: number;
  totalRevenue?: number;
  totalTicketsSold?: number;
  activeEvents?: number;
  pendingEvents?: number;
  error?: string;
}

export default function AdminEventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRevenue: 0,
    totalTicketsSold: 0,
    activeEvents: 0,
    pendingEvents: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EventStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | "bulk" | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchStatistics();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getAll({
        status: statusFilter !== "all" ? statusFilter : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        search: searchQuery || undefined,
      });

      if (response.success) {
        const eventsWithTime = response.events.map((event: any) => ({
          ...event,
          time: new Date(event.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          date: new Date(event.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          createdAt: new Date(event.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        }));
        setEvents(eventsWithTime);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch events",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fixed fetchStatistics function with proper type handling
  const fetchStatistics = async () => {
    try {
      const response = (await eventsAPI.getStatistics()) as StatisticsResponse;
      if (response.success) {
        setStats({
          totalEvents: response.totalEvents || 0,
          totalRevenue: response.totalRevenue || 0,
          totalTicketsSold: response.totalTicketsSold || 0,
          activeEvents: response.activeEvents || 0,
          pendingEvents: response.pendingEvents || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const categories = useMemo(() => {
    const set = new Set(events.map((e) => e.category));
    return ["All Categories", ...Array.from(set)];
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || ev.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || ev.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [events, searchQuery, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / eventsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const indexOfLast = currentPage * eventsPerPage;
  const indexOfFirst = indexOfLast - eventsPerPage;
  const currentEvents = filtered.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => events.some((e) => e.eventId === id))
    );
  }, [events]);

  useEffect(
    () => setCurrentPage(1),
    [searchQuery, statusFilter, categoryFilter]
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllOnPage = () => {
    const onPageIds = currentEvents.map((e) => e.eventId);
    const allSelected = onPageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !onPageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...onPageIds])));
    }
  };

  const updateEventStatus = async (id: string, status: EventStatus) => {
    setActionLoading(true);
    try {
      const response = await eventsAPI.updateStatus(id, status);
      if (response.success) {
        toast({
          title: "Success",
          description: `Event status updated to ${status}`,
        });
        fetchEvents();
        fetchStatistics();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    setActionLoading(true);
    try {
      const response = await eventsAPI.delete(id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Event deleted successfully",
        });
        fetchEvents();
        fetchStatistics();
        setSelectedIds((prev) => prev.filter((x) => x !== id));
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete event",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (
    action: "approve" | "reject" | "suspend" | "delete",
    id: string
  ) => {
    if (action === "delete") {
      setDeleteTarget(id);
      setConfirmDeleteOpen(true);
      return;
    }
    if (action === "approve") await updateEventStatus(id, "active");
    if (action === "reject") await updateEventStatus(id, "cancelled");
    if (action === "suspend") await updateEventStatus(id, "suspended");
  };

  const handleBulkAction = async (action: "approve" | "suspend" | "delete") => {
    if (selectedIds.length === 0) {
      toast({
        title: "No selection",
        description: "Select events to perform bulk actions",
        variant: "destructive",
      });
      return;
    }

    if (action === "delete") {
      setDeleteTarget("bulk");
      setConfirmDeleteOpen(true);
      return;
    }

    setActionLoading(true);
    try {
      const status = action === "approve" ? "active" : "suspended";
      const response = await eventsAPI.bulkUpdateStatus(selectedIds, status);

      if (response.success) {
        toast({
          title: "Success",
          description: `${selectedIds.length} events updated`,
        });
        fetchEvents();
        fetchStatistics();
        setSelectedIds([]);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update events",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update events",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    setActionLoading(true);
    try {
      if (deleteTarget === "bulk") {
        const response = await eventsAPI.bulkDelete(selectedIds);
        if (response.success) {
          toast({
            title: "Success",
            description: `${selectedIds.length} events deleted`,
          });
          fetchEvents();
          fetchStatistics();
          setSelectedIds([]);
        } else {
          toast({
            title: "Error",
            description: response.error || "Failed to delete events",
            variant: "destructive",
          });
        }
      } else if (typeof deleteTarget === "string") {
        await deleteEvent(deleteTarget);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
      setDeleteTarget(null);
      setConfirmDeleteOpen(false);
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    setConfirmDeleteOpen(false);
  };

  const exportToCSV = () => {
    if (filtered.length === 0) {
      toast({
        title: "No data",
        description: "There are no events to export",
        variant: "destructive",
      });
      return;
    }

    const csv = [
      [
        "ID",
        "Title",
        "Date",
        "Status",
        "Organizer",
        "Tickets Sold",
        "Total Tickets",
        "Revenue",
      ],
      ...filtered.map((event) => [
        event.eventId,
        event.title,
        event.date,
        event.status,
        event.organizer,
        event.ticketsSold,
        event.totalTickets,
        event.revenue,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `events_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export started",
      description: "CSV exported successfully",
    });
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [statusFilter, categoryFilter, searchQuery]);

  const StatCard = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: string;
    icon: React.ReactNode;
  }) => (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );

  const FilterChip = ({
    label,
    onRemove,
  }: {
    label: string;
    onRemove: () => void;
  }) => (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
      {label}
      <button
        onClick={onRemove}
        className="ml-2 text-gray-500 hover:text-gray-700"
      >
        ×
      </button>
    </span>
  );

  if (loading && events.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Event Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage platform events — approve, suspend, delete and review
            performance
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/admin/events/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Create Event
          </Link>
          <button
            onClick={exportToCSV}
            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Events"
          value={stats.totalEvents.toString()}
          icon={<Calendar className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          title="Active Events"
          value={stats.activeEvents.toString()}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          title="Pending"
          value={stats.pendingEvents.toString()}
          icon={<AlertCircle className="h-5 w-5 text-yellow-600" />}
        />
        <StatCard
          title="Tickets Sold"
          value={stats.totalTicketsSold.toLocaleString()}
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
        />
        <StatCard
          title="Total Revenue"
          value={`ETB ${stats.totalRevenue.toLocaleString()}`}
          icon={<BarChart3 className="h-5 w-5 text-red-600" />}
        />
      </div>

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
                onChange={(e) => setStatusFilter(e.target.value as any)}
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
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value === "all" ? "all" : e.target.value
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[160px]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c === "All Categories" ? "all" : c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchQuery ||
          statusFilter !== "all" ||
          categoryFilter !== "all") && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchQuery && (
                <FilterChip
                  label={`Search: "${searchQuery}"`}
                  onRemove={() => setSearchQuery("")}
                />
              )}
              {statusFilter !== "all" && (
                <FilterChip
                  label={`Status: ${statusFilter}`}
                  onRemove={() => setStatusFilter("all")}
                />
              )}
              {categoryFilter !== "all" && (
                <FilterChip
                  label={`Category: ${categoryFilter}`}
                  onRemove={() => setCategoryFilter("all")}
                />
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
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {selectedIds.length}
                </span>
              </div>
              <span className="text-blue-800 font-medium">
                {selectedIds.length} event{selectedIds.length > 1 ? "s" : ""}{" "}
                selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkAction("approve")}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Selected
              </button>
              <button
                onClick={() => handleBulkAction("suspend")}
                disabled={actionLoading}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium flex items-center disabled:opacity-50"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Suspend Selected
              </button>
              <button
                onClick={() => handleBulkAction("delete")}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-4 px-6">
                  <input
                    type="checkbox"
                    checked={
                      currentEvents.length > 0 &&
                      currentEvents.every((e) =>
                        selectedIds.includes(e.eventId)
                      )
                    }
                    onChange={selectAllOnPage}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                  Event
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
                <tr key={event.eventId} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(event.eventId)}
                      onChange={() => toggleSelect(event.eventId)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        ID: #{event.eventId.substring(0, 8)} • {event.category}
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
                        href={`/admin/events/${event.eventId}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/events/${event.eventId}/edit`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      {event.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleAction("approve", event.eventId)
                            }
                            disabled={actionLoading}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleAction("reject", event.eventId)
                            }
                            disabled={actionLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleAction("delete", event.eventId)}
                        disabled={actionLoading}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <button
                        className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                        title="More"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentEvents.length === 0 && !loading && (
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

        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {Math.min(indexOfFirst + 1, filtered.length)} to{" "}
              {Math.min(indexOfLast, filtered.length)} of {filtered.length}{" "}
              results
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2)
                  pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                if (pageNum < 1 || pageNum > totalPages) return null;
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
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
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

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget === "bulk"
                ? "Delete selected events?"
                : "Delete event?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget === "bulk"
                ? `This will permanently delete ${selectedIds.length} selected events. This action cannot be undone.`
                : `This will permanently delete the event. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
