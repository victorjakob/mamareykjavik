"use client";

import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { useState, useCallback, useEffect, Suspense } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { supabase } from "@/util/supabase/client";

const eventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(100),
  shortdescription: z.string().min(1, "Short description is required").max(400),
  description: z.string().min(1, "Full description is required").max(100000),
  date: z.string().min(1, "Event date is required"),
  duration: z.string().min(1, "Duration is required"),
  price: z.string().min(1, "Price is required"),
  payment: z.enum(["online", "door", "free"], {
    errorMap: () => ({ message: "Please select a payment option" }),
  }),
  host: z
    .string()
    .email("Invalid email address")
    .optional()
    .default("team@hitelotus.is"),
  hasEarlyBird: z.boolean().optional(),
  early_bird_price: z.string().optional(),
  early_bird_date: z.string().optional(),
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
  maxSizeMB: 2,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.8,
  maxIteration: 10,
};

const DEFAULT_IMAGE_URL =
  "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2FGenerated_Logo_White_Lotus_darktext_transparent.png?alt=media&token=59618fb8-21e8-483e-b4c0-b49d4651955f";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

function SearchParamsWrapper({ children }) {
  const searchParams = useSearchParams();
  return children(searchParams);
}

export default function CreateEvent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(DEFAULT_IMAGE_URL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [duplicatedImageUrl, setDuplicatedImageUrl] = useState(null);
  const [showEarlyBird, setShowEarlyBird] = useState(false);
  const [ticketVariants, setTicketVariants] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      shortdescription: "",
      description: "",
      date: "",
      duration: "",
      price: "",
      payment: "online",
      host: "team@whitelotus.is",
    },
  });

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
        setDuplicatedImageUrl(null);
      } catch (error) {
        setError("image", {
          type: "manual",
          message:
            error.message || "Failed to process image. Please try again.",
        });
      } finally {
        setImageProcessing(false);
      }
    },
    [setError, processImage]
  );

  const uploadImage = useCallback(async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/events/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload image");
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }, []);

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

  const onSubmit = useCallback(
    async (data) => {
      if (!session?.user) {
        setError("root", {
          type: "manual",
          message: "Authentication required. Please log in again.",
        });
        return;
      }

      setIsSubmitting(true);
      try {
        let imageUrl;
        if (imageFile) {
          try {
            imageUrl = await uploadImage(imageFile);
          } catch (uploadError) {
            throw uploadError;
          }
        } else if (duplicatedImageUrl) {
          imageUrl = duplicatedImageUrl;
        } else {
          imageUrl = DEFAULT_IMAGE_URL;
        }

        const eventDate = new Date(data.date);
        if (isNaN(eventDate.getTime())) {
          throw new Error("Invalid date format");
        }

        const eventData = {
          name: data.name,
          shortdescription: data.shortdescription,
          description: data.description,
          duration: parseInt(data.duration, 10) || 0,
          price: parseInt(data.price, 10) || 0,
          early_bird_price: data.hasEarlyBird
            ? parseInt(data.early_bird_price, 10) || 0
            : null,
          early_bird_date: data.hasEarlyBird
            ? new Date(data.early_bird_date).toISOString()
            : null,
          slug: `${data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-${format(eventDate, "MM-dd")}`,
          image: imageUrl,
          payment: data.payment,
          host: data.host || session.user.email,
          created_at: new Date().toISOString(),
          date: eventDate.toISOString(),
          ticket_variants: ticketVariants.length > 0 ? ticketVariants : null,
        };

        const response = await fetch("/api/events/create-event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create event");
        }

        await response.json();
        router.push("/events");
        router.refresh();
      } catch (error) {
        setError("root", {
          type: "manual",
          message: `Failed to create event: ${error.message}`,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      imageFile,
      uploadImage,
      router,
      setError,
      duplicatedImageUrl,
      session,
      ticketVariants,
    ]
  );

  useEffect(() => {
    const fetchInitialData = async (duplicateId) => {
      if (duplicateId) {
        try {
          const { data: event, error } = await supabase
            .from("events")
            .select("*")
            .eq("id", duplicateId)
            .single();

          if (error) throw error;

          if (event) {
            const formattedDate = new Date(event.date)
              .toISOString()
              .slice(0, 16);

            reset({
              name: event.name,
              shortdescription: event.shortdescription,
              description: event.description,
              date: formattedDate,
              duration: event.duration.toString(),
              price: event.price.toString(),
              payment: event.payment,
              host: event.host,
            });

            if (event.image && event.image !== DEFAULT_IMAGE_URL) {
              setImagePreview(event.image);
              setDuplicatedImageUrl(event.image);
            }
          }
        } catch (error) {
          setError("root", {
            type: "manual",
            message: "Failed to load event data for duplication",
          });
        }
      }
    };

    const searchParams = new URLSearchParams(window.location.search);
    const duplicateId = searchParams.get("duplicate");
    fetchInitialData(duplicateId);
  }, [reset, setError]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to create events...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-20 p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700"
          >
            Event Image
          </label>
          <div className="mt-1">
            <input
              id="image"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100
                focus:outline-none"
              disabled={imageProcessing}
            />
            {imageProcessing && (
              <p className="mt-2 text-sm text-indigo-600">
                Processing image...
              </p>
            )}
            {errors.image && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.image.message}
              </p>
            )}
          </div>
          {imagePreview && (
            <div className="mt-2 aspect-[16/9] relative h-[225px]">
              <Image
                src={imagePreview}
                alt="Event preview"
                fill
                className="object-cover rounded-md"
                priority
              />
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Event Name
          </label>
          <input
            {...register("name")}
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="shortdescription"
            className="block text-sm font-medium text-gray-700"
          >
            Short Description
          </label>
          <input
            {...register("shortdescription")}
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
          />
          {errors.shortdescription && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.shortdescription.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Full Description
          </label>
          <textarea
            {...register("description")}
            rows={5}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none resize-vertical min-h-[8rem]"
            style={{ height: "auto", overflow: "hidden" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${Math.max(
                e.target.scrollHeight,
                8 * 16
              )}px`;
            }}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700"
          >
            Event Date
          </label>
          <input
            {...register("date")}
            type="datetime-local"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600" role="alert">
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
            {...register("duration")}
            type="number"
            min="0"
            step="0.5"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
          />
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.duration.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700"
          >
            Price (ISK)
          </label>
          <input
            {...register("price")}
            type="number"
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.price.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {ticketVariants.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Price Variants</h2>
                <button
                  type="button"
                  onClick={addTicketVariant}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Add Variant
                </button>
              </div>

              {ticketVariants.map((variant, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-4 bg-white"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-md font-medium">Variant {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeTicketVariant(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) =>
                        updateTicketVariant(index, "name", e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                      placeholder="e.g., VIP, General Admission"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price (ISK)
                    </label>
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
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
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
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {ticketVariants.length === 0 && (
            <button
              type="button"
              onClick={addTicketVariant}
              className="w-full p-4 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
            >
              + Add Price Variants
            </button>
          )}
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register("hasEarlyBird")}
              onChange={(e) => setShowEarlyBird(e.target.checked)}
              className="form-checkbox h-4 w-4 text-indigo-600"
            />
            <span className="text-sm font-medium text-gray-700">
              Enable Early Bird Pricing
            </span>
          </label>

          {showEarlyBird && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Early Bird Price (ISK)
                </label>
                <input
                  {...register("early_bird_price")}
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Early Bird Deadline
                </label>
                <input
                  {...register("early_bird_date")}
                  type="datetime-local"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="host"
            className="block text-sm font-medium text-gray-700"
          >
            Email for Signup Notifications
          </label>
          <input
            {...register("host")}
            type="email"
            placeholder="team@whitelotus.is"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
          />
          {errors.host && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.host.message}
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
          <div className="mt-2 space-x-4">
            <label className="inline-flex items-center">
              <input
                {...register("payment")}
                type="radio"
                value="online"
                defaultChecked
                className="form-radio h-4 w-4 text-indigo-600"
              />
              <span className="ml-2">Pay Online</span>
            </label>
            <label className="inline-flex items-center">
              <input
                {...register("payment")}
                type="radio"
                value="door"
                className="form-radio h-4 w-4 text-indigo-600"
              />
              <span className="ml-2">Pay at the Door</span>
            </label>
            <label className="inline-flex items-center">
              <input
                {...register("payment")}
                type="radio"
                value="free"
                className="form-radio h-4 w-4 text-indigo-600"
              />
              <span className="ml-2">Free Event</span>
            </label>
          </div>
          {errors.payment && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.payment.message}
            </p>
          )}
        </div>

        {errors.root && (
          <p className="text-sm text-red-600 text-center" role="alert">
            {errors.root.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || imageProcessing}
          className="w-full bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200"
        >
          {isSubmitting ? "Creating Event..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}
