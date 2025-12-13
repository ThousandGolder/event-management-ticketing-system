import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Calendar, MapPin } from "lucide-react";

interface TicketCardProps {
  ticket: {
    id: string;
    eventName: string;
    ticketType: string;
    price: number;
    purchaseDate: string;
    eventDate: string;
    location: string;
    status: "valid" | "used" | "cancelled";
    qrCode?: string;
  };
}

export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{ticket.eventName}</CardTitle>
          <Badge
            variant={
              ticket.status === "valid"
                ? "default"
                : ticket.status === "used"
                ? "secondary"
                : "destructive"
            }
          >
            {ticket.status.toUpperCase()}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {ticket.ticketType} • ${ticket.price}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4" />
            Purchased: {ticket.purchaseDate}
          </div>
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4" />
            Event: {ticket.eventDate}
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4" />
            {ticket.location}
          </div>
        </div>
        {ticket.qrCode && (
          <div className="mt-4 flex justify-center">
            <div className="border p-4 rounded-lg">
              <QrCode className="h-24 w-24" />
              <p className="text-center text-xs mt-2">Scan QR at entrance</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Transfer</Button>
        <Button variant="outline">Download</Button>
        <Button variant="destructive">Cancel</Button>
      </CardFooter>
    </Card>
  );
}
