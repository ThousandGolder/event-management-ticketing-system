"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Calendar,
  Ticket,
  DollarSign,
  RefreshCw,
  Clock,
  Shield,
  Settings,
  Lock,
  Bell,
  Eye,
  Trash2,
  Edit,
  Loader2,
  CreditCard,
  MapPin,
  Phone,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  ticketStats: {
    total: number;
    upcoming: number;
    totalSpent: number;
  };
}

// Form schemas
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(6, {
      message: "Current password must be at least 6 characters.",
    }),
    newPassword: z.string().min(6, {
      message: "New password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Confirm password must be at least 6 characters.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

// Safe default values for ticketStats
const DEFAULT_TICKET_STATS = {
  total: 0,
  upcoming: 0,
  totalSpent: 0,
};

export default function UserProfilePage() {
  const { user, token, logout } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Profile form - using Controller instead of FormField
  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  // Password form - using Controller instead of FormField
  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const fetchUserProfile = async () => {
    try {
      setRefreshing(true);

      if (!token || !user) {
        toast({
          title: "Authentication required",
          description: "Please login again",
          variant: "destructive",
        });
        logout();
        return;
      }

      // Use the new profile endpoint
      const profileResponse = await fetch(
        `http://localhost:3001/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (profileResponse.status === 401) {
        toast({
          title: "Session expired",
          description: "Please login again",
          variant: "destructive",
        });
        logout();
        return;
      }

      const profileResult = await profileResponse.json();

      if (profileResult.success) {
        // FIX: Ensure ticketStats exists with default values
        const safeProfileData = {
          ...profileResult.data,
          ticketStats: profileResult.data.ticketStats || DEFAULT_TICKET_STATS,
        };

        setProfile(safeProfileData);
        // Update form with current values
        resetProfileForm({
          name: safeProfileData.name,
          email: safeProfileData.email,
        });
      } else {
        throw new Error(profileResult.message || "Failed to fetch profile");
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);

      // Fallback to using auth user data if profile endpoint fails
      if (user) {
        const fallbackProfile: UserProfile = {
          id: user.id,
          name: user.name || "User",
          email: user.email,
          role: user.role || "user",
          createdAt: new Date().toISOString(),
          ticketStats: DEFAULT_TICKET_STATS, // FIX: Use default values
        };
        setProfile(fallbackProfile);

        toast({
          title: "Using basic profile",
          description: "Could not load full profile data",
          variant: "default",
        });
      } else {
        toast({
          title: "Error loading profile",
          description: error.message || "Could not load your profile data",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateProfile = async (data: ProfileFormValues) => {
    try {
      if (!token || !user) {
        toast({
          title: "Authentication required",
          description: "Please login again",
          variant: "destructive",
        });
        logout();
        return;
      }

      const response = await fetch(`http://localhost:3001/user/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        toast({
          title: "Session expired",
          description: "Please login again",
          variant: "destructive",
        });
        logout();
        return;
      }

      const result = await response.json();

      if (result.success) {
        // FIX: Ensure ticketStats exists with default values
        const updatedProfile = {
          ...result.data,
          ticketStats: result.data.ticketStats || DEFAULT_TICKET_STATS,
        };

        setProfile(updatedProfile);
        setIsEditingProfile(false);

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
          variant: "default",
        });
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: error.message || "Could not update your profile",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async (data: PasswordFormValues) => {
    try {
      // In a real app, you would call your backend password change endpoint
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate success
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully",
        variant: "default",
      });

      resetPasswordForm();
      setIsChangingPassword(false);
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Change failed",
        description: error.message || "Could not change your password",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // In a real app, you would call your backend delete account endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
        variant: "default",
      });

      // Logout and redirect
      logout();
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Deletion failed",
        description: error.message || "Could not delete your account",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // FIX: Create safe variables with defaults
  const safeProfile = profile || {
    id: "",
    name: "User",
    email: "",
    role: "user",
    createdAt: new Date().toISOString(),
    ticketStats: DEFAULT_TICKET_STATS,
  };

  const safeTicketStats = safeProfile.ticketStats || DEFAULT_TICKET_STATS;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">
            Manage your account and view your statistics
          </p>
        </div>
        <Button
          onClick={fetchUserProfile}
          disabled={refreshing}
          variant="outline"
          className="w-full md:w-auto"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* FIX: Always render content, use safe variables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your account details and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {safeProfile.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{safeProfile.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {safeProfile.email}
                </p>
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-medium capitalize">
                    {safeProfile.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">
                  Full Name
                </Label>
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{safeProfile.name}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email Address
                </Label>
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{safeProfile.email}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Account Role</Label>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium capitalize">
                  {safeProfile.role}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Member Since</Label>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {new Date(safeProfile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Sheet open={isEditingProfile} onOpenChange={setIsEditingProfile}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Edit Profile</SheetTitle>
                  <p className="text-sm text-muted-foreground">
                    Make changes to your profile here. Click save when you're
                    done.
                  </p>
                </SheetHeader>
                <form
                  onSubmit={handleProfileSubmit(handleUpdateProfile)}
                  className="space-y-4 mt-4"
                >
                  <div className="space-y-2">
                    <FormLabel>Full Name</FormLabel>
                    <Controller
                      name="name"
                      control={profileControl}
                      render={({ field }) => (
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                      )}
                    />
                    {profileErrors.name && (
                      <FormMessage>{profileErrors.name.message}</FormMessage>
                    )}
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Email</FormLabel>
                    <Controller
                      name="email"
                      control={profileControl}
                      render={({ field }) => (
                        <FormControl>
                          <Input
                            placeholder="your.email@example.com"
                            {...field}
                          />
                        </FormControl>
                      )}
                    />
                    {profileErrors.email && (
                      <FormMessage>{profileErrors.email.message}</FormMessage>
                    )}
                  </div>

                  <Button type="submit" className="w-full">
                    Save Changes
                  </Button>
                </form>
              </SheetContent>
            </Sheet>
          </CardFooter>
        </Card>

        {/* Ticket Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Ticket Statistics
            </CardTitle>
            <CardDescription>
              Your event participation and spending
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-primary/10 p-3 mb-3">
                      <Ticket className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Tickets
                    </p>
                    {/* FIX: Use safeTicketStats instead of profile.ticketStats */}
                    <p className="text-3xl font-bold mt-2">
                      {safeTicketStats.total}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-green-100 p-3 mb-3">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Upcoming Events
                    </p>
                    {/* FIX: Use safeTicketStats instead of profile.ticketStats */}
                    <p className="text-3xl font-bold mt-2 text-green-600">
                      {safeTicketStats.upcoming}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="rounded-full bg-blue-100 p-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Amount Spent
                      </p>
                    </div>
                    {/* FIX: Use safeTicketStats instead of profile.ticketStats */}
                    <p className="text-3xl font-bold">
                      ${safeTicketStats.totalSpent.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Across all your tickets
                    </p>
                  </div>
                  <DollarSign className="h-10 w-10 text-muted-foreground opacity-20" />
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Settings
          </CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Change Password Sheet */}
            <Sheet
              open={isChangingPassword}
              onOpenChange={setIsChangingPassword}
            >
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Change Password</SheetTitle>
                  <p className="text-sm text-muted-foreground">
                    Enter your current password and new password below.
                  </p>
                </SheetHeader>
                <form
                  onSubmit={handlePasswordSubmit(handleChangePassword)}
                  className="space-y-4 mt-4"
                >
                  <div className="space-y-2">
                    <FormLabel>Current Password</FormLabel>
                    <Controller
                      name="currentPassword"
                      control={passwordControl}
                      render={({ field }) => (
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                      )}
                    />
                    {passwordErrors.currentPassword && (
                      <FormMessage>
                        {passwordErrors.currentPassword.message}
                      </FormMessage>
                    )}
                  </div>

                  <div className="space-y-2">
                    <FormLabel>New Password</FormLabel>
                    <Controller
                      name="newPassword"
                      control={passwordControl}
                      render={({ field }) => (
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                      )}
                    />
                    {passwordErrors.newPassword && (
                      <FormMessage>
                        {passwordErrors.newPassword.message}
                      </FormMessage>
                    )}
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Confirm New Password</FormLabel>
                    <Controller
                      name="confirmPassword"
                      control={passwordControl}
                      render={({ field }) => (
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                      )}
                    />
                    {passwordErrors.confirmPassword && (
                      <FormMessage>
                        {passwordErrors.confirmPassword.message}
                      </FormMessage>
                    )}
                  </div>

                  <Button type="submit" className="w-full">
                    Change Password
                  </Button>
                </form>
              </SheetContent>
            </Sheet>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "Notification settings will be available soon",
                  variant: "default",
                });
              }}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "Privacy settings will be available soon",
                  variant: "default",
                });
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Privacy
            </Button>

            {/* Delete Account Dialog */}
            <AlertDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
            >
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Account
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button variant="outline" onClick={logout} className="w-full">
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
