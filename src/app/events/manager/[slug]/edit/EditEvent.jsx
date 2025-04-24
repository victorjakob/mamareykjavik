"use client";

import { useForm } from "react-hook-form";
import { supabase } from "@/util/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { PropagateLoader } from "react-spinners";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRole } from "@/lib/useRole";

const eventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(100),
  shortdescription: z.string().min(1, "Short description is required").max(400),
  description: z.string().min(1, "Full description is required").max(100000),
  date: z.string().min(1, "Event date is required"),
  duration: z.string().min(1, "Duration is required"),
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
  ticketVariants: z
    .array(
      z.object({
        name: z.string().min(1, "Variant name is required"),
        price: z.number().min(0, "Price must be positive"),
        capacity: z.number().min(1, "Capacity must be at least 1").optional(),
        meta: z.record(z.any()).optional(),
      })
    )
    .optional(),
});

const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export default function EditEvent() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const role = useRole();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [event, setEvent] = useState(null);
  const [ticketVariants, setTicketVariants] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (status === "loading") return;
        if (!session) throw new Error("Not authenticated");

        // First fetch the event
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("slug", params.slug)
          .single();

        if (eventError) throw eventError;

        // Check if user is either the host or an admin
        if (eventData.host !== session.user.email && role !== "admin") {
          throw new Error(
            "Unauthorized: You are not the host or admin of this event"
          );
        }

        console.log("eventData.id");
        console.log(eventData.id);
        // Then fetch the ticket variants
        const { data: variantsData, error: variantsError } = await supabase
          .from("ticket_variants")
          .select("*")
          .eq("event_id", eventData.id);

        if (variantsError) throw variantsError;

        setEvent(eventData);
        setImagePreview(eventData.image);
        setTicketVariants(variantsData || []);

        reset({
          name: eventData.name,
          shortdescription: eventData.shortdescription,
          description: eventData.description,
          date: new Date(eventData.date).toISOString().slice(0, 16),
          duration: eventData.duration.toString(),
          price: eventData.price.toString(),
          early_bird_price: eventData.early_bird_price?.toString() || "",
          early_bird_date: eventData.early_bird_date
            ? new Date(eventData.early_bird_date).toISOString().slice(0, 16)
            : "",
          payment: eventData.payment,
          host: eventData.host,
        });
      } catch (err) {
        toast.error(err.message);
        router.push("/events/manager");
      }
    };

    fetchEvent();
  }, [params.slug, reset, router, session, status, role]);

  const processImage = useCallback(async (file) => {
    const isHEIC =
      file.type.toLowerCase().includes("heic") ||
      file.type.toLowerCase().includes("heif");

    let processedFile = file;

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

    try {
      const imageCompression = (await import("browser-image-compression"))
        .default;
      return await imageCompression(processedFile, IMAGE_COMPRESSION_OPTIONS);
    } catch (error) {
      console.error("Compression error:", error);
      throw new Error("Failed to compress image. Please try again.");
    }
  }, []);

  const handleImageChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
        setError("image", {
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
        setError("image", {
          type: "manual",
          message: error.message,
        });
      } finally {
        setImageProcessing(false);
      }
    },
    [processImage, setError]
  );

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

  const addTicketVariant = () => {
    setTicketVariants([
      ...ticketVariants,
      { name: "", price: 0, capacity: null, meta: {} },
    ]);
  };

  const removeTicketVariant = (index) => {
    setTicketVariants(ticketVariants.filter((_, i) => i !== index));
  };

  const updateTicketVariant = (index, field, value) => {
    const newVariants = [...ticketVariants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setTicketVariants(newVariants);
  };

  const onSubmit = async (data) => {
    if (!event) return;

    try {
      setIsSubmitting(true);
      const imageUrl = await uploadImage();

      const eventDate = new Date(data.date);
      if (isNaN(eventDate.getTime())) {
        throw new Error("Invalid date format");
      }

      // First update the event
      const { error: eventError } = await supabase
        .from("events")
        .update({
          name: data.name,
          shortdescription: data.shortdescription,
          description: data.description,
          date: eventDate.toISOString(),
          duration: parseFloat(data.duration) || 0,
          price: parseInt(data.price, 10) || 0,
          early_bird_price: data.early_bird_price
            ? parseInt(data.early_bird_price, 10)
            : null,
          early_bird_date: data.early_bird_date
            ? new Date(data.early_bird_date).toISOString()
            : null,
          image: imageUrl,
          payment: data.payment,
          host: data.host || "team@whitelotus.is",
        })
        .eq("id", event.id);

      if (eventError) throw eventError;

      // Always delete existing variants first
      const { error: deleteError } = await supabase
        .from("ticket_variants")
        .delete()
        .eq("event_id", event.id);

      if (deleteError) throw deleteError;

      // Only insert new variants if there are any
      if (ticketVariants.length > 0) {
        const variantsWithEventId = ticketVariants.map((variant) => {
          // Create a new object without the id field
          const { id, ...variantWithoutId } = variant;
          return {
            ...variantWithoutId,
            event_id: event.id,
            created_at: new Date().toISOString(),
          };
        });

        const { error: insertError } = await supabase
          .from("ticket_variants")
          .insert(variantsWithEventId);

        if (insertError) throw insertError;
      }

      toast.success("Event updated successfully");
      router.push("/events/manager");
      router.refresh();
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <PropagateLoader color="#4F46E5" size={12} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
        <p className="mt-2 text-sm text-gray-500">
          Update your event details and ticket information
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Event Image
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Event preview"
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Upload a new image
                </label>
                <input
                  id="image"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100
                    focus:outline-none"
                  disabled={imageProcessing}
                />
                {imageProcessing && (
                  <p className="mt-2 text-sm text-indigo-600 flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing image...
                  </p>
                )}
                {errors.image && (
                  <p className="mt-2 text-sm text-red-600" role="alert">
                    {errors.image.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Event Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries({
              name: "Event Name",
              shortdescription: "Short Description",
              description: "Full Description",
              date: "Date and Time",
              duration: "Duration (hours)",
              price: "Price (ISK)",
              early_bird_price: "Early Bird Price (ISK)",
              early_bird_date: "Early Bird End Date",
            }).map(([field, label]) => (
              <div
                key={field}
                className={field === "description" ? "md:col-span-2" : ""}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                {field === "description" ? (
                  <textarea
                    {...register(field)}
                    rows={4}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                ) : field === "date" || field === "early_bird_date" ? (
                  <input
                    type="datetime-local"
                    {...register(field)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                ) : (
                  <input
                    type={
                      field === "duration" ||
                      field === "price" ||
                      field === "early_bird_price"
                        ? "number"
                        : "text"
                    }
                    step={field === "duration" ? "0.1" : "1"}
                    {...register(field)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                )}
                {errors[field] && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors[field].message}
                  </p>
                )}
              </div>
            ))}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Option
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["online", "door", "free"].map((option) => (
                  <label
                    key={option}
                    className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      {...register("payment")}
                      type="radio"
                      value={option}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700 capitalize">
                      {option === "door"
                        ? "Pay at the Door"
                        : option === "online"
                        ? "Pay Online"
                        : "Free Event"}
                    </span>
                  </label>
                ))}
              </div>
              {errors.payment && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.payment.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {ticketVariants.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  Price Variants
                </h2>
                <button
                  type="button"
                  onClick={addTicketVariant}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Variant
                </button>
              </div>

              <div className="grid gap-4">
                {ticketVariants.map((variant, index) => (
                  <div
                    key={index}
                    className="p-6 border rounded-lg space-y-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <h3 className="text-md font-medium text-gray-800">
                          Variant {index + 1}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTicketVariant(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) =>
                            updateTicketVariant(index, "name", e.target.value)
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="e.g., VIP, General Admission"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (ISK)
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">kr</span>
                          </div>
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) =>
                              updateTicketVariant(
                                index,
                                "price",
                                parseInt(e.target.value)
                              )
                            }
                            min="0"
                            className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Capacity (optional)
                        </label>
                        <input
                          type="number"
                          value={variant.capacity || ""}
                          onChange={(e) =>
                            updateTicketVariant(
                              index,
                              "capacity",
                              e.target.value ? parseInt(e.target.value) : null
                            )
                          }
                          min="1"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Leave empty for unlimited"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ticketVariants.length === 0 && (
            <button
              type="button"
              onClick={addTicketVariant}
              className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors duration-200 flex flex-col items-center justify-center space-y-2"
            >
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-lg font-medium">Add Price Variants</span>
              <span className="text-sm text-gray-500">
                Click to add different ticket types and prices
              </span>
            </button>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => router.push("/events/manager")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || imageProcessing}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
