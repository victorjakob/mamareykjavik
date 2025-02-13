"use client";

// Import required dependencies
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { PropagateLoader } from "react-spinners";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { toast } from "react-hot-toast";

// Define validation schema for event form
const eventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(100),
  shortdescription: z.string().min(1, "Short description is required").max(400),
  description: z.string().min(1, "Full description is required").max(100000),
  date: z.string().min(1, "Event date is required"),
  duration: z.string().min(1, "Duration is required"), // Allow decimal numbers
  price: z.string().min(1, "Price is required"),
  early_bird_price: z.string().optional(),
  early_bird_date: z.string().optional(),
  payment: z.enum(["online", "door", "free"], {
    errorMap: () => ({ message: "Please select a payment option" }),
  }),
  host: z
    .string()
    .email("Invalid email address")
    .optional()
    .default("team@whitelotus.is"),
});

// Configuration for image compression
const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

// Define accepted image file types
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export default function EditEvent() {
  // Get route parameters and router instance
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  // Define state variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [event, setEvent] = useState(null);

  // Initialize form with validation
  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
  });

  // Fetch event data on component mount
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setEvent(data);
        setImagePreview(data.image);

        // Reset form with fetched data
        reset({
          name: data.name,
          shortdescription: data.shortdescription,
          description: data.description,
          date: new Date(data.date).toISOString().slice(0, 16),
          duration: data.duration.toString(),
          price: data.price.toString(),
          early_bird_price: data.early_bird_price?.toString() || "",
          early_bird_date: data.early_bird_date
            ? new Date(data.early_bird_date).toISOString().slice(0, 16)
            : "",
          payment: data.payment,
          host: data.host,
        });
      } catch (err) {
        toast.error(err.message);
        router.push("/admin/manage-events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, reset, router]);

  // Handle image processing including HEIC conversion and compression
  const processImage = async (file) => {
    const isHEIC =
      file.type.toLowerCase().includes("heic") ||
      file.type.toLowerCase().includes("heif");

    let processedFile = file;

    // Convert HEIC/HEIF to JPEG if necessary
    if (isHEIC) {
      try {
        const heic2any = (await import("heic2any")).default;
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8,
        });
        processedFile = new File(
          [convertedBlob],
          file.name.replace(/\.(heic|heif)$/i, ".jpg"),
          { type: "image/jpeg" }
        );
      } catch (error) {
        console.error("HEIC conversion error:", error);
        throw new Error(
          "Failed to convert HEIC image. Please try another format."
        );
      }
    }

    // Compress the image
    try {
      const imageCompression = (await import("browser-image-compression"))
        .default;
      return await imageCompression(processedFile, IMAGE_COMPRESSION_OPTIONS);
    } catch (error) {
      console.error("Compression error:", error);
      throw new Error("Failed to compress image. Please try again.");
    }
  };

  // Handle image file selection
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      setFormError("image", {
        type: "manual",
        message:
          "Please upload a valid image file (JPEG, PNG, WebP, or HEIC/HEIF)",
      });
      return;
    }

    setImageProcessing(true);
    try {
      const processedFile = await processImage(file);
      setImageFile(processedFile);
      setImagePreview(URL.createObjectURL(processedFile));
    } catch (error) {
      setFormError("image", {
        type: "manual",
        message: error.message,
      });
    } finally {
      setImageProcessing(false);
    }
  };

  // Upload image to Supabase storage
  const uploadImage = async () => {
    if (!imageFile) return imagePreview;

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `event-images/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("event-images").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      toast.error("Error uploading image");
      throw error;
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    if (!event) return;

    try {
      setLoading(true);
      const imageUrl = await uploadImage();

      const eventDate = new Date(data.date);
      if (isNaN(eventDate.getTime())) {
        throw new Error("Invalid date format");
      }

      let earlyBirdDate = null;
      if (data.early_bird_date) {
        earlyBirdDate = new Date(data.early_bird_date);
        if (isNaN(earlyBirdDate.getTime())) {
          throw new Error("Invalid early bird date format");
        }
      }

      // Update event in database
      const { error } = await supabase
        .from("events")
        .update({
          name: data.name,
          shortdescription: data.shortdescription,
          description: data.description,
          date: eventDate.toISOString(),
          duration: parseFloat(data.duration) || 0, // Parse as float to allow decimals
          price: parseInt(data.price, 10) || 0,
          early_bird_price: data.early_bird_price
            ? parseInt(data.early_bird_price, 10)
            : null,
          early_bird_date: earlyBirdDate ? earlyBirdDate.toISOString() : null,
          image: imageUrl,
          payment: data.payment,
          host: data.host || "team@whitelotus.is",
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Event updated successfully");
      router.push("/admin/manage-events");
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PropagateLoader color="#4F46E5" size={12} />
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="min-h-screen pt-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-700">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Render the edit event form
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Event</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Image upload section */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Image
                </label>
                <div className="mt-2 flex items-center gap-4">
                  {imagePreview && (
                    <div className="relative w-32 h-32">
                      <Image
                        src={imagePreview}
                        alt="Event preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    {imageProcessing ? "Processing..." : "Change Image"}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={imageProcessing}
                    />
                  </label>
                </div>
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.image.message}
                  </p>
                )}
              </div>

              {/* Event name field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Event Name
                </label>
                <input
                  type="text"
                  id="name"
                  {...register("name")}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Short description field */}
              <div>
                <label
                  htmlFor="shortdescription"
                  className="block text-sm font-medium text-gray-700"
                >
                  Short Description
                </label>
                <input
                  type="text"
                  id="shortdescription"
                  {...register("shortdescription")}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {errors.shortdescription && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.shortdescription.message}
                  </p>
                )}
              </div>

              {/* Full description field */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Description
                </label>
                <textarea
                  id="description"
                  {...register("description")}
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Date/time and duration fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date and Time
                  </label>
                  <input
                    type="datetime-local"
                    id="date"
                    {...register("date")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.date.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    step="0.1" // Allow decimal numbers
                    {...register("duration")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.duration.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Price and payment method fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Price (ISK)
                  </label>
                  <input
                    type="number"
                    id="price"
                    {...register("price")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="payment"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Payment Method
                  </label>
                  <select
                    id="payment"
                    {...register("payment")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="online">Online Payment</option>
                    <option value="door">Pay at Door</option>
                    <option value="free">Free Event</option>
                  </select>
                  {errors.payment && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.payment.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Early Bird Price and Date fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="early_bird_price"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Early Bird Price (ISK) (optional)
                  </label>
                  <input
                    type="number"
                    id="early_bird_price"
                    {...register("early_bird_price")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="early_bird_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Early Bird Deadline (optional)
                  </label>
                  <input
                    type="datetime-local"
                    id="early_bird_date"
                    {...register("early_bird_date")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Host email field */}
              <div>
                <label
                  htmlFor="host"
                  className="block text-sm font-medium text-gray-700"
                >
                  Host Email
                </label>
                <input
                  type="email"
                  id="host"
                  {...register("host")}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {errors.host && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.host.message}
                  </p>
                )}
              </div>
            </div>

            {/* Form buttons */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push("/admin/manage-events")}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading || imageProcessing}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
