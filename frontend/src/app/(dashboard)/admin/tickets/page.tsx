"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface Ticket {
  id: string;
  ticketNumber: string;
  eventName: string;
  userName: string;
  userEmail: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  purchaseDate: string;
  status: "pending" | "confirmed" | "cancelled" | "checked_in";
  paymentStatus: "pending" | "paid" | "failed";
}

export default function AdminTicketsPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data. Replace with actual API call later.
      const mockTickets: Ticket[] = [
        {
          id: "1",
          ticketNumber: "TKT-2024-001",
          eventName: "Summer Music Festival",
          userName: "John Doe",
          userEmail: "john@example.com",
          ticketType: "VIP",
          quantity: 2,
          totalAmount: 300,
          purchaseDate: "2024-01-15",
          status: "confirmed",
          paymentStatus: "paid",
        },
        {
          id: "2",
          ticketNumber: "TKT-2024-002",
          eventName: "Tech Conference",
          userName: "Jane Smith",
          userEmail: "jane@example.com",
          ticketType: "General",
          quantity: 1,
          totalAmount: 150,
          purchaseDate: "2024-01-16",
          status: "pending",
          paymentStatus: "pending",
        },
      ];

      setTickets(mockTickets);
      toast({
        title: "Success",
        description: "Tickets loaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCheckIn = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setCheckInDialogOpen(true);
  };

  const confirmCheckIn = () => {
    if (!selectedTicket) return;

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === selectedTicket.id
          ? { ...ticket, status: "checked_in" as const }
          : ticket
      )
    );

    setCheckInDialogOpen(false);
    setSelectedTicket(null);

    toast({
      title: "Success",
      description: `Ticket ${selectedTicket.ticketNumber} checked in`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status: Ticket["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "checked_in":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: Ticket["paymentStatus"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Ticket Management</h1>
        <p className="text-gray-600">Manage and track all ticket purchases</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{tickets.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(
                tickets.reduce((sum, ticket) => sum + ticket.totalAmount, 0)
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {tickets.filter((t) => t.status === "confirmed").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {tickets.filter((t) => t.status === "pending").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button onClick={fetchTickets} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
          <Button variant="outline">Export</Button>
        </div>
        <Button variant="default">Create Ticket</Button>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{ticket.ticketNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>{ticket.eventName}</div>
                      <div className="text-sm text-gray-500">
                        {ticket.ticketType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>{ticket.userName}</div>
                      <div className="text-sm text-gray-500">
                        {ticket.userEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">
                        {formatCurrency(ticket.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Qty: {ticket.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(
                          ticket.paymentStatus
                        )}`}
                      >
                        {ticket.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCheckIn(ticket)}
                          disabled={
                            ticket.status === "checked_in" ||
                            ticket.status === "cancelled"
                          }
                        >
                          Check In
                        </Button>
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Check In Dialog */}
      <AlertDialog open={checkInDialogOpen} onOpenChange={setCheckInDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Check In Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to check in ticket{" "}
              {selectedTicket?.ticketNumber}?
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <p>
                  <strong>Customer:</strong> {selectedTicket?.userName}
                </p>
                <p>
                  <strong>Event:</strong> {selectedTicket?.eventName}
                </p>
                <p>
                  <strong>Type:</strong> {selectedTicket?.ticketType}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCheckIn}>
              Confirm Check In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Empty State */}
      {tickets.length === 0 && !loading && (
        <Card className="mt-6">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No tickets found.</p>
            <Button onClick={fetchTickets} className="mt-4">
              Load Sample Tickets
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
