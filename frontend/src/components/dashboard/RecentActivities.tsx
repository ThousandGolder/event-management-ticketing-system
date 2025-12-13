import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activities = [
  {
    user: "Olivia Martin",
    action: "Purchased Ticket",
    event: "Summer Concert",
    time: "2 min ago",
  },
  {
    user: "Jackson Lee",
    action: "Registered for",
    event: "Tech Conference",
    time: "5 min ago",
  },
  {
    user: "Isabella Nguyen",
    action: "Created Event",
    event: "Art Exhibition",
    time: "10 min ago",
  },
  {
    user: "William Kim",
    action: "Cancelled Ticket",
    event: "Food Festival",
    time: "15 min ago",
  },
  {
    user: "Sofia Davis",
    action: "Updated Profile",
    event: "",
    time: "20 min ago",
  },
];

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center">
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.user} {activity.action} {activity.event}
                </p>
                <p className="text-sm text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
