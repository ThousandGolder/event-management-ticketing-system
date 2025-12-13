import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Mail, Phone } from "lucide-react";

const users = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "Admin",
    status: "Active",
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria@example.com",
    role: "User",
    status: "Active",
    lastActive: "1 day ago",
  },
  {
    id: 3,
    name: "David Smith",
    email: "david@example.com",
    role: "Moderator",
    status: "Inactive",
    lastActive: "1 week ago",
  },
  {
    id: 4,
    name: "Lisa Wang",
    email: "lisa@example.com",
    role: "User",
    status: "Active",
    lastActive: "5 hours ago",
  },
];

export function UserManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold">{user.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge
                  variant={user.status === "Active" ? "default" : "secondary"}
                >
                  {user.role}
                </Badge>
                <Badge variant="outline">{user.status}</Badge>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
