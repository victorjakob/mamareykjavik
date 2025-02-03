"use client";

import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useState, useCallback, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

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
    .default("team@whitelotus.is"),
});

const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
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

export default function CreateEvent() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(DEFAULT_IMAGE_URL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
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
    [setError, processImage]
  );

  const uploadImage = useCallback(async (file) => {
    const fileExt = file.type.split("/")[1];
    const fileName = `${
      typeof window !== "undefined" ? window.crypto.randomUUID() : ""
    }.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("event-images").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error("Failed to upload image");
    }
  }, []);

  const onSubmit = useCallback(
    async (data) => {
      if (imageProcessing) {
        setError("image", {
          type: "manual",
          message: "Please wait for image processing to complete",
        });
        return;
      }

      setIsSubmitting(true);
      try {
        const imageUrl = imageFile
          ? await uploadImage(imageFile)
          : DEFAULT_IMAGE_URL;

        const eventDate = new Date(data.date);
        if (isNaN(eventDate.getTime())) {
          throw new Error("Invalid date format");
        }

        const eventData = {
          ...data,
          duration: parseInt(data.duration, 10) || 0,
          price: parseInt(data.price, 10) || 0,
          slug: `${data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-${format(eventDate, "MM-dd")}`,
          image: imageUrl,
          payment: data.payment,
          host: data.host || "team@whitelotus.is",
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("events")
          .insert([eventData])
          .select();

        if (error) throw error;

        router.push("/events");
        router.refresh();
      } catch (error) {
        console.error("Error creating event:", error);
        setError("root", {
          type: "manual",
          message: "Failed to create event. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [imageFile, imageProcessing, uploadImage, router, setError]
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      // Any initial Supabase calls would go here
    };

    fetchInitialData();
  }, []);

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
            Price ($)
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
