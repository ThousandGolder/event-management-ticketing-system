"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage platform-wide configurations and preferences.
        </p>
      </div>

      {/* General Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="platform-name">Platform Name</Label>
            <Input
              id="platform-name"
              placeholder="EventHub"
              defaultValue="EventHub"
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="support-email">Support Email</Label>
            <Input
              id="support-email"
              placeholder="support@example.com"
              defaultValue="support@example.com"
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="timezone">Default Timezone</Label>
            <Input id="timezone" placeholder="UTC+3" defaultValue="UTC+3" />
          </div>

          <Button className="mt-4" variant="outline">
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="password-policy">Password Policy</Label>
            <Input
              id="password-policy"
              placeholder="Minimum 8 characters"
              defaultValue="Minimum 8 characters"
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
            <Input id="session-timeout" placeholder="30" defaultValue="30" />
          </div>

          <Button className="mt-4" variant="outline">
            Save Security Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
