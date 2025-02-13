"use client";

import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { PropagateLoader } from "react-spinners";
import { toast } from "react-hot-toast";

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [event, setEvent] = useState(null);

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
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("slug", params.slug)
          .single();

        if (eventError) throw eventError;

        if (eventData.host !== user.email) {
          throw new Error("Unauthorized: You are not the host of this event");
        }

        setEvent(eventData);
        setImagePreview(eventData.image);

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
  }, [params.slug, reset, router]);

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

  const onSubmit = async (data) => {
    if (!event) return;

    try {
      setIsSubmitting(true);
      const imageUrl = await uploadImage();

      const eventDate = new Date(data.date);
      if (isNaN(eventDate.getTime())) {
        throw new Error("Invalid date format");
      }

      const { error } = await supabase
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

      if (error) throw error;

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
    <div className="max-w-2xl mx-auto mt-20 p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>

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

        <div className="space-y-6">
          {Object.entries({
            name: "Event Name",
            shortdescription: "Short Description",
            description: "Full Description",
            date: "Date and Time",
            duration: "Duration (hours)",
            price: "Price (ISK)",
            early_bird_price: "Early Bird Price (ISK) (optional)",
            early_bird_date: "Early Bird End Date (optional)",
          }).map(([field, label]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              {field === "description" ? (
                <textarea
                  {...register(field)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              ) : field === "date" || field === "early_bird_date" ? (
                <input
                  type="datetime-local"
                  {...register(field)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              )}
              {errors[field] && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors[field].message}
                </p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Option
            </label>
            <div className="mt-2 space-x-4">
              {["online", "door", "free"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    {...register("payment")}
                    type="radio"
                    value={option}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2 capitalize">
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

        {errors.root && (
          <p className="text-sm text-red-600 text-center" role="alert">
            {errors.root.message}
          </p>
        )}

        <div className="flex justify-end space-x-4">
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
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
