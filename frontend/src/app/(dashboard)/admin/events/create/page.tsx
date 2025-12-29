"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { eventsAPI } from "@/lib/api/events";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

// API Configuration
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
};

interface UploadResponse {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
  message?: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    city: "",
    category: "",
    organizer: "",
    organizerEmail: "",
    totalTickets: "100",
    ticketPrice: "0",
    revenue: "0",
    ticketsSold: "0",
    status: "pending",
    imageUrl: "",
    userId: "admin-user",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Test backend endpoint on mount (optional)
  useEffect(() => {
    // Uncomment to test backend on component mount
    // testUploadEndpoint();
  }, []);

  // Test the upload endpoint (for debugging)
  const testUploadEndpoint = async () => {
    try {
      console.log("Testing upload endpoint...");

      const testData = {
        fileName: "test-image.jpg",
        contentType: "image/jpeg",
        fileType: "image/jpeg",
      };

      const response = await fetch(
        `${API_CONFIG.baseURL}/upload/generate-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testData),
        }
      );

      const result = await response.json();
      console.log("Upload endpoint response:", result);

      if (!response.ok) {
        toast({
          title: "Backend Error",
          description: `Status: ${response.status}. Check console for details.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Backend OK",
          description: "Upload endpoint is responding correctly",
        });
      }

      return result;
    } catch (error) {
      console.error("Error testing upload endpoint:", error);
      toast({
        title: "Connection Error",
        description: "Could not reach upload endpoint",
        variant: "destructive",
      });
      return null;
    }
  };

  // Handle file selection
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `File type "${file.type}" is not supported. Please select JPEG, PNG, WebP, or GIF image.`,
        variant: "destructive",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `File size ${(file.size / (1024 * 1024)).toFixed(
          2
        )}MB exceeds 5MB limit.`,
        variant: "destructive",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to preview image",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  // Upload image to S3 - FIXED VERSION
  const uploadImageToS3 = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    try {
      setUploadingImage(true);

      // Extract file extension and create unique filename
      const fileExtension =
        selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const uniqueFileName = `event-images/${timestamp}-${randomString}.${fileExtension}`;

      console.log("Requesting presigned URL for:", {
        fileName: uniqueFileName,
        contentType: selectedFile.type,
      });

      // Step 1: Get presigned URL from backend
      const presignedResponse = await fetch(
        `${API_CONFIG.baseURL}/upload/generate-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: uniqueFileName,
            contentType: selectedFile.type,
            fileType: selectedFile.type,
          }),
        }
      );

      const presignedData: UploadResponse = await presignedResponse.json();
      console.log("Presigned URL response:", presignedData);

      if (!presignedData.success || !presignedData.url) {
        const errorMsg =
          presignedData.error ||
          presignedData.message ||
          "Failed to get upload URL";
        console.error("Presigned URL error:", errorMsg);
        throw new Error(errorMsg);
      }

      // Step 2: Upload file directly to S3 using presigned URL
      console.log("Uploading to S3 URL:", presignedData.url);
      const uploadResponse = await fetch(presignedData.url, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type,
        },
        body: selectedFile,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("S3 upload failed:", uploadResponse.status, errorText);
        throw new Error(
          `S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`
        );
      }

      console.log("S3 upload successful");

      // Step 3: Construct the public URL
      let imageUrl = "";

      if (presignedData.key) {
        // If backend returns S3 key
        imageUrl = `https://${
          process.env.NEXT_PUBLIC_S3_BUCKET || "event-images"
        }.s3.amazonaws.com/${presignedData.key}`;
      } else if (presignedData.url) {
        // If backend returns full URL, remove query parameters
        imageUrl = presignedData.url.split("?")[0];
      } else {
        // Fallback: construct URL from filename
        imageUrl = `https://${
          process.env.NEXT_PUBLIC_S3_BUCKET || "event-images"
        }.s3.amazonaws.com/${uniqueFileName}`;
      }

      console.log("Final image URL:", imageUrl);

      toast({
        title: "Success!",
        description: "Image uploaded successfully to S3",
      });

      return imageUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description:
          error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove selected image
  const removeSelectedImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // Upload image if file is selected
      if (selectedFile) {
        console.log(
          "Starting image upload:",
          selectedFile.name,
          selectedFile.type
        );
        const uploadedUrl = await uploadImageToS3();

        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
          console.log("Image uploaded successfully:", uploadedUrl);
        } else if (!formData.imageUrl) {
          // If upload failed and no existing URL, use default
          finalImageUrl =
            "https://images.unsplash.com/photo-1501281668745-f6f2612e4e71?w=800";
          toast({
            title: "Using default image",
            description: "Image upload failed, using default image instead",
            variant: "default",
          });
        }
      }

      const eventData = {
        ...formData,
        imageUrl: finalImageUrl || "", // Ensure imageUrl is always a string
        totalTickets: parseInt(formData.totalTickets, 10) || 100,
        ticketPrice: parseFloat(formData.ticketPrice) || 0,
        revenue: parseFloat(formData.revenue) || 0,
        ticketsSold: parseInt(formData.ticketsSold, 10) || 0,
        date: formData.date
          ? new Date(formData.date).toISOString()
          : new Date().toISOString(),
        userId: formData.userId || "admin-user",
      };

      console.log("Submitting event data:", eventData);

      const result = await eventsAPI.create(eventData);

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message || "Event created successfully",
        });
        router.push("/admin/events");
      } else {
        toast({
          title: "Error",
          description:
            result.error || result.message || "Failed to create event",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Music",
    "Sports",
    "Technology",
    "Business",
    "Art",
    "Food",
    "Education",
    "Health",
    "Other",
  ];

  const cities = [
    "Addis Ababa",
    "Dire Dawa",
    "Mekelle",
    "Gondar",
    "Bahir Dar",
    "Hawassa",
    "Jimma",
    "Other",
  ];

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "pending", label: "Pending" },
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Event</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={testUploadEndpoint}
            title="Test backend upload endpoint"
          >
            Test Upload
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Fill in the details for your new event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your event"
                  rows={4}
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date and Time *</Label>
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select status</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Venue/Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter venue name"
                  required
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select city</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Organizer */}
              <div className="space-y-2">
                <Label htmlFor="organizer">Organizer Name *</Label>
                <Input
                  id="organizer"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  placeholder="Enter organizer name"
                  required
                />
              </div>

              {/* Organizer Email */}
              <div className="space-y-2">
                <Label htmlFor="organizerEmail">Organizer Email</Label>
                <Input
                  id="organizerEmail"
                  name="organizerEmail"
                  type="email"
                  value={formData.organizerEmail}
                  onChange={handleChange}
                  placeholder="organizer@example.com"
                />
              </div>

              {/* Total Tickets */}
              <div className="space-y-2">
                <Label htmlFor="totalTickets">Total Tickets *</Label>
                <Input
                  id="totalTickets"
                  name="totalTickets"
                  type="number"
                  min="1"
                  value={formData.totalTickets}
                  onChange={handleChange}
                  placeholder="Enter total number of tickets"
                  required
                />
              </div>

              {/* Ticket Price */}
              <div className="space-y-2">
                <Label htmlFor="ticketPrice">Ticket Price (ETB)</Label>
                <Input
                  id="ticketPrice"
                  name="ticketPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.ticketPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              {/* Image Upload Section - Full Width */}
              <div className="space-y-4 md:col-span-2">
                <Label htmlFor="image">Event Image</Label>

                <div className="space-y-4">
                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      selectedFile
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="fileInput"
                    />

                    {previewUrl ? (
                      <div className="flex flex-col items-center">
                        <div className="relative w-48 h-48 mx-auto mb-4">
                          <Image
                            src={previewUrl}
                            alt="Preview"
                            fill
                            className="object-cover rounded-lg"
                            unoptimized // For data URLs
                          />
                        </div>
                        <p className="text-sm text-gray-600">
                          {selectedFile?.name} (
                          {Math.round((selectedFile?.size || 0) / 1024)}KB)
                        </p>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSelectedImage();
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-lg font-medium mb-2">
                          Upload Event Image
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          Click to browse or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">
                          Supports: JPEG, PNG, WebP (Max 5MB)
                        </p>
                      </>
                    )}
                  </div>

                  {/* OR Separator */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  {/* URL Input */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="imageUrl">Use Image URL</Label>
                    </div>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/event-image.jpg"
                      disabled={!!selectedFile}
                    />
                    <p className="text-sm text-gray-500">
                      {selectedFile
                        ? "URL will be ignored since file is uploaded"
                        : "Enter image URL or upload file above"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/events")}
                disabled={loading || uploadingImage}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || uploadingImage}
                className="min-w-[120px]"
              >
                {loading || uploadingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadingImage ? "Uploading..." : "Creating..."}
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
