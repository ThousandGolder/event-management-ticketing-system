"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Mail, Phone, Trash2, Edit, Loader2 } from "lucide-react";
import {
  toastSuccess,
  toastInfo,
  toastError,
} from "@/components/ui/toaster-simple";
import { useAuth } from "../providers/AuthProvider";

/* ---------------- TYPES ---------------- */
export type UserRole =
  | "Admin"
  | "Moderator"
  | "User"
  | "Organizer"
  | "Attendee";
export type UserStatus = "Active" | "Inactive";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  userId?: string; // Add backend userId
};

interface Props {
  users: User[];
  setUsers: (users: User[]) => void; // Changed to accept array
  loading?: boolean;
}

/* ---------------- COMPONENT ---------------- */
export function UserManagement({ users, setUsers, loading = false }: Props) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [updatingUser, setUpdatingUser] = useState<number | null>(null);
  const { user: authUser } = useAuth();

  const getToken = () => {
    // Get token from localStorage or cookies
    return (
      localStorage.getItem("token") ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]
    );
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;

    const userToDelete = users.find((u) => u.id === deleteUserId);
    if (!userToDelete) return;

    try {
      const token = getToken();
      if (!token) {
        toastError("Authentication required", "Please login again");
        return;
      }

      // Don't allow deleting yourself
      if (userToDelete.userId === authUser?.id) {
        toastError(
          "Cannot delete yourself",
          "You cannot delete your own account"
        );
        setDeleteUserId(null);
        return;
      }

      // TODO: Call backend DELETE endpoint when you create it
      // For now, just update frontend state
      const updatedUsers = users.filter((u) => u.id !== deleteUserId);
      setUsers(updatedUsers);

      toastSuccess("User deleted", `${userToDelete.name} has been removed`);
    } catch (error) {
      console.error("Error deleting user:", error);
      toastError("Delete failed", "Could not delete user");
    } finally {
      setDeleteUserId(null);
    }
  };

  const handleEdit = async (id: number) => {
    const userToEdit = users.find((u) => u.id === id);
    if (!userToEdit) return;

    setUpdatingUser(id);

    const newName = prompt("Enter new name:", userToEdit.name);
    if (!newName || newName === userToEdit.name) {
      setUpdatingUser(null);
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        toastError("Authentication required", "Please login again");
        return;
      }

      // TODO: Call backend UPDATE endpoint when you create it
      // For now, just update frontend state
      const updatedUsers = users.map((u) =>
        u.id === id ? { ...u, name: newName } : u
      );
      setUsers(updatedUsers);

      toastSuccess("User updated", `${userToEdit.name} updated to ${newName}`);
    } catch (error) {
      console.error("Error updating user:", error);
      toastError("Update failed", "Could not update user");
    } finally {
      setUpdatingUser(null);
    }
  };

  const toggleRole = async (id: number) => {
    const userToUpdate = users.find((u) => u.id === id);
    if (!userToUpdate) return;

    setUpdatingUser(id);

    // Determine new role based on current role
    let newRole: UserRole = "User";
    if (userToUpdate.role === "User") newRole = "Organizer";
    else if (userToUpdate.role === "Organizer") newRole = "Attendee";
    else if (userToUpdate.role === "Attendee") newRole = "Moderator";
    else if (userToUpdate.role === "Moderator") newRole = "Admin";
    else newRole = "User";

    try {
      const token = getToken();
      if (!token) {
        toastError("Authentication required", "Please login again");
        return;
      }

      // Don't allow changing your own role
      if (userToUpdate.userId === authUser?.id) {
        toastError("Cannot change your own role", "Please ask another admin");
        setUpdatingUser(null);
        return;
      }

      // TODO: Call backend UPDATE endpoint when you create it
      // For now, just update frontend state
      const updatedUsers = users.map((u) =>
        u.id === id ? { ...u, role: newRole } : u
      );
      setUsers(updatedUsers);

      toastInfo("User role changed", `${userToUpdate.name} is now ${newRole}`);
    } catch (error) {
      console.error("Error changing role:", error);
      toastError("Role change failed", "Could not update user role");
    } finally {
      setUpdatingUser(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No users found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <Badge variant="outline" className="ml-2">
            {users.length} users
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col sm:flex-row justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
            >
              {/* USER INFO */}
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                  {user.name.charAt(0)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{user.name}</p>
                    {user.userId === authUser?.id && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <p>{user.email}</p>
                  </div>
                  {user.userId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {user.userId}
                    </p>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <Badge
                  variant={user.role === "Admin" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {user.role}
                </Badge>
                <Badge
                  variant={user.status === "Active" ? "outline" : "secondary"}
                  className={
                    user.status === "Active"
                      ? "text-green-600 border-green-600"
                      : "text-gray-600"
                  }
                >
                  {user.status}
                </Badge>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleRole(user.id)}
                  disabled={
                    updatingUser === user.id || user.userId === authUser?.id
                  }
                >
                  {updatingUser === user.id ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : null}
                  Change Role
                </Button>

                <div className="relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setOpenMenuId(openMenuId === user.id ? null : user.id)
                    }
                    disabled={user.userId === authUser?.id}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>

                  {openMenuId === user.id && (
                    <div className="absolute right-0 mt-2 w-36 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
                      <button
                        className="w-full px-4 py-2 flex gap-2 items-center hover:bg-accent transition-colors"
                        onClick={() => {
                          handleEdit(user.id);
                          setOpenMenuId(null);
                        }}
                        disabled={updatingUser === user.id}
                      >
                        {updatingUser === user.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Edit className="h-3 w-3" />
                        )}
                        Edit Name
                      </button>
                      <button
                        className="w-full px-4 py-2 flex gap-2 items-center text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => {
                          setDeleteUserId(user.id);
                          setOpenMenuId(null);
                        }}
                        disabled={user.userId === authUser?.id}
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CONFIRM DELETE MODAL */}
      {deleteUserId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg space-y-4 max-w-sm w-full mx-4">
            <h2 className="font-bold text-lg">Delete User?</h2>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The user will be permanently
              removed.
            </p>

            {(() => {
              const userToDelete = users.find((u) => u.id === deleteUserId);
              if (userToDelete?.userId === authUser?.id) {
                return (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded">
                    <p className="text-sm text-destructive font-medium">
                      ⚠️ You cannot delete your own account
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteUserId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={(() => {
                  const userToDelete = users.find((u) => u.id === deleteUserId);
                  return userToDelete?.userId === authUser?.id;
                })()}
              >
                Delete User
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
