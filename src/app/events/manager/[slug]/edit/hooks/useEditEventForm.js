import { useForm } from "react-hook-form";
import { supabase } from "@/util/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
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
        if (!session) {
          toast.error("Please log in to edit events");
          router.push("/auth/signin");
          return;
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
        if (eventData.host !== session.user.email && role !== "admin") {
          toast.error(
            "You don't have permission to edit this event. Only the event host or administrators can make changes."
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

    try {
      setIsSubmitting(true);
      const imageUrl = await uploadImage();

      const eventDate = new Date(data.date);
      if (isNaN(eventDate.getTime())) {
        toast.error("Please enter a valid date and time for your event.");
        return;
      }

      // Validate early bird date if provided
      if (data.early_bird_date) {
        const earlyBirdDate = new Date(data.early_bird_date);
        if (isNaN(earlyBirdDate.getTime())) {
          toast.error("Please enter a valid early bird end date.");
          return;
        }
        if (earlyBirdDate >= eventDate) {
          toast.error("Early bird end date must be before the event date.");
          return;
        }
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

      if (eventError) {
        console.error("Event update error:", eventError);
        if (eventError.code === "23505") {
          toast.error(
            "An event with this name already exists. Please choose a different name."
          );
        } else {
          toast.error(
            "Failed to update event details. Please check your connection and try again."
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
    event,
    onSubmit,
  };
}
