import { useForm } from "react-hook-form";
import { supabase } from "@/util/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRole } from "@/hooks/useRole";

const eventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(100),
  shortdescription: z.string().min(1, "Short description is required").max(400),
  description: z.string().min(1, "Full description is required").max(100000),
  date: z.string().min(1, "Event date is required"),
  duration: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
      message: "Duration must be a valid positive number",
    }),
  location: z.string().min(1, "Location is required"),
  price: z.string().min(1, "Price is required"),
  hasEarlyBird: z.boolean().optional(),
  early_bird_price: z.string().optional(),
  early_bird_date: z.string().optional(),
  has_sliding_scale: z.boolean().optional(),
  sliding_scale_min: z.string().optional(),
  sliding_scale_max: z.string().optional(),
  capacity: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 0), {
      message: "Capacity must be a valid non-negative number",
    }),
  payment: z.enum(["online", "door", "free"], {
    errorMap: () => ({ message: "Please select a payment option" }),
  }),
  host: z
    .string()
    .email("Invalid email address")
    .optional()
    .default("team@whitelotus.is"),
  host_secondary: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  facebook_link: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
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

export function useEditEventForm() {
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
  const [showEarlyBird, setShowEarlyBird] = useState(false);
  const [showSlidingScale, setShowSlidingScale] = useState(false);
  const [showCustomLocation, setShowCustomLocation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(eventSchema),
  });
  
  // Watch form values to save to sessionStorage
  const watchedValues = watch();
  
  // Auto-save form values to sessionStorage to preserve unsaved changes
  useEffect(() => {
    if (event && typeof window !== "undefined") {
      const sessionKey = `event_edit_draft_${params.slug}`;
      if (Object.keys(watchedValues).length > 0) {
        sessionStorage.setItem(sessionKey, JSON.stringify(watchedValues));
      }
    }
  }, [watchedValues, event, params.slug]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (status === "loading") return;
        if (!session) {
          toast.error("Please log in to edit events");
          router.push("/auth/signin");
          return;
        }

        // Check if we have saved form draft in sessionStorage
        const draftKey = `event_edit_draft_${params.slug}`;
        let savedDraft = null;
        if (typeof window !== "undefined") {
          const draftData = sessionStorage.getItem(draftKey);
          if (draftData) {
            try {
              savedDraft = JSON.parse(draftData);
            } catch (e) {
              console.warn("Failed to parse saved draft", e);
            }
          }
        }

        // First fetch the event
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("slug", params.slug)
          .single();

        if (eventError) {
          if (eventError.code === "PGRST116") {
            toast.error("Event not found. It may have been deleted or moved.");
            router.push("/events/manager");
            return;
          }
          throw new Error("Failed to load event. Please try again.");
        }

        // Check if user is either the host or an admin
        if (
          eventData.host !== session.user.email &&
          eventData.host_secondary !== session.user.email &&
          role !== "admin"
        ) {
          toast.error(
            "You don't have permission to edit this event. Only event managers or administrators can make changes."
          );
          router.push("/events/manager");
          return;
        }

        // Then fetch the ticket variants
        const { data: variantsData, error: variantsError } = await supabase
          .from("ticket_variants")
          .select("*")
          .eq("event_id", eventData.id);

        if (variantsError) {
          console.error("Ticket variants error:", variantsError);
          // Don't fail the whole operation for ticket variants
        }

        setEvent(eventData);
        setImagePreview(eventData.image);
        setTicketVariants(variantsData || []);
        setShowEarlyBird(!!eventData.early_bird_price);
        setShowSlidingScale(!!eventData.has_sliding_scale);
        setShowCustomLocation(
          !!eventData.location &&
            eventData.location !== "Bankastræti 2, 101 Reykjavik"
        );

        reset({
          name: eventData.name,
          shortdescription: eventData.shortdescription,
          description: eventData.description,
          date: new Date(eventData.date).toISOString().slice(0, 16),
          duration: eventData.duration ? eventData.duration.toString() : "",
          location: eventData.location || "Bankastræti 2, 101 Reykjavik",
          price: eventData.price.toString(),
          hasEarlyBird: !!eventData.early_bird_price,
          early_bird_price: eventData.early_bird_price?.toString() || "",
          early_bird_date: eventData.early_bird_date
            ? new Date(eventData.early_bird_date).toISOString().slice(0, 16)
            : "",
          has_sliding_scale: eventData.has_sliding_scale || false,
          sliding_scale_min: eventData.sliding_scale_min?.toString() || "",
          sliding_scale_max: eventData.sliding_scale_max?.toString() || "",
          capacity: 
            eventData.capacity === null || 
            eventData.capacity === undefined || 
            eventData.capacity === 0
              ? ""
              : eventData.capacity.toString(),
          payment: eventData.payment,
          host: eventData.host,
          host_secondary: eventData.host_secondary || "",
          facebook_link: eventData.facebook_link || "",
        });
        
        // If we have a saved draft, restore it (preserves user's unsaved changes)
        if (savedDraft) {
          reset({
            ...savedDraft,
            // Ensure capacity is properly handled
            capacity: savedDraft.capacity || "",
            host_secondary: savedDraft.host_secondary || "",
          });
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        toast.error(
          "Something went wrong while loading the event. Please try again."
        );
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
        toast.error(
          "Please choose a valid image file (JPEG, PNG, WebP, or HEIC/HEIF)"
        );
        return;
      }

      // Check file size (max 5MB before compression)
      if (file.size > 5 * 1024 * 1024) {
        setError("image", {
          type: "manual",
          message: "Image file is too large. Please choose a smaller image.",
        });
        toast.error(
          "Image file is too large. Please choose a smaller image (max 5MB)."
        );
        return;
      }

      setImageProcessing(true);
      try {
        const processedFile = await processImage(file);
        setImageFile(processedFile);
        setImagePreview(URL.createObjectURL(processedFile));
        toast.success("Image processed successfully!");
      } catch (error) {
        console.error("Image processing error:", error);
        setError("image", {
          type: "manual",
          message: error.message,
        });
        toast.error("Failed to process image. Please try a different image.");
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

      if (uploadError) {
        console.error("Image upload error:", uploadError);
        if (uploadError.message?.includes("file size")) {
          toast.error(
            "Image file is too large. Please choose a smaller image (max 1MB)."
          );
        } else if (uploadError.message?.includes("file type")) {
          toast.error(
            "Invalid image format. Please use JPEG, PNG, or WebP files."
          );
        } else {
          toast.error("Failed to upload image. Please try again.");
        }
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("event-images").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(
        "Failed to upload image. Please try again or use a different image."
      );
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
    if (!event) {
      toast.error(
        "Event data not loaded. Please refresh the page and try again."
      );
      return;
    }

    // Validate sliding scale price range
    if (data.has_sliding_scale) {
      const mainPrice = parseInt(data.price, 10) || 0;
      const minPrice = parseInt(data.sliding_scale_min, 10) || 0;
      const maxPrice = parseInt(data.sliding_scale_max, 10) || 0;

      // Check if min is less than max
      if (minPrice >= maxPrice) {
        toast.error("Minimum price must be less than maximum price.");
        return;
      }

      // Check if main price is within range
      if (mainPrice < minPrice || mainPrice > maxPrice) {
        toast.error(
          `When sliding scale is enabled, the main price must be between ${minPrice} and ${maxPrice} ISK.`
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const imageUrl = await uploadImage();

      // Parse the datetime-local input and treat it as Iceland time
      const eventDate = new Date(data.date + "+00:00"); // Treat as UTC to avoid timezone conversion
      if (isNaN(eventDate.getTime())) {
        toast.error("Please enter a valid date and time for your event.");
        return;
      }

      // Validate early bird date if provided
      if (data.early_bird_date) {
        const earlyBirdDate = new Date(data.early_bird_date + "+00:00");
        if (isNaN(earlyBirdDate.getTime())) {
          toast.error("Please enter a valid early bird end date.");
          return;
        }
        if (earlyBirdDate >= eventDate) {
          toast.error("Early bird end date must be before the event date.");
          return;
        }
      }

      // Prepare update data - only include fields that exist and have values
      const updateData = {
        name: data.name,
        shortdescription: data.shortdescription,
        description: data.description,
        date: eventDate.toISOString(),
        duration: data.duration ? parseFloat(data.duration) : null,
        price: parseInt(data.price, 10) || 0,
        // Clear early bird pricing if hasEarlyBird is false
        early_bird_price:
          data.hasEarlyBird && data.early_bird_price
            ? parseInt(data.early_bird_price, 10)
            : null,
        early_bird_date:
          data.hasEarlyBird && data.early_bird_date
            ? new Date(data.early_bird_date + "+00:00").toISOString()
            : null,
        has_sliding_scale: data.has_sliding_scale || false,
        sliding_scale_min: data.sliding_scale_min
          ? parseInt(data.sliding_scale_min, 10)
          : null,
        sliding_scale_max: data.sliding_scale_max
          ? parseInt(data.sliding_scale_max, 10)
          : null,
        sliding_scale_suggested: data.has_sliding_scale
          ? parseInt(data.price, 10)
          : null,
        capacity: data.capacity ? parseInt(data.capacity, 10) || null : null,
        image: imageUrl,
        payment: data.payment,
        host: data.host || "team@whitelotus.is",
        host_secondary: data.host_secondary ? data.host_secondary : null,
      };

      // Add optional fields
      if (showCustomLocation && data.location) {
        updateData.location = data.location;
      }

      // Always include facebook_link (can be empty string)
      updateData.facebook_link = data.facebook_link || null;

      // First update the event
      const { error: eventError } = await supabase
        .from("events")
        .update(updateData)
        .eq("id", event.id);

      if (eventError) {
        console.error("Event update error:", eventError);
        console.error("Update data:", updateData);
        if (eventError.code === "23505") {
          toast.error(
            "An event with this name already exists. Please choose a different name."
          );
        } else {
          toast.error(
            `Failed to update event details: ${eventError.message}. Please check your connection and try again.`
          );
        }
        return;
      }

      // Handle ticket variants
      try {
        // Always delete existing variants first
        const { error: deleteError } = await supabase
          .from("ticket_variants")
          .delete()
          .eq("event_id", event.id);

        if (deleteError) {
          console.error("Delete variants error:", deleteError);
          // Continue anyway, don't fail the whole operation
        }

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

          if (insertError) {
            console.error("Insert variants error:", insertError);
            toast.error(
              "Event updated but there was an issue with ticket variants. You can edit them later."
            );
          }
        }
      } catch (variantError) {
        console.error("Ticket variants error:", variantError);
        toast.error(
          "Event updated but there was an issue with ticket variants. You can edit them later."
        );
      }

      toast.success("Event updated successfully! 🎉");
      
      // Clear saved draft from sessionStorage after successful save
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`event_edit_draft_${params.slug}`);
      }
      
      router.push("/events/manager");
      router.refresh();
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error(
        "Something went wrong while updating the event. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    setError,
    watch,
    isSubmitting,
    imageProcessing,
    imagePreview,
    handleImageChange,
    ticketVariants,
    addTicketVariant,
    removeTicketVariant,
    updateTicketVariant,
    showEarlyBird,
    setShowEarlyBird,
    showSlidingScale,
    setShowSlidingScale,
    showCustomLocation,
    setShowCustomLocation,
    event,
    onSubmit,
  };
}
