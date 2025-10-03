import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/util/supabase/client";
import { toast } from "react-hot-toast";

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
  hasSlidingScale: z.boolean().optional(),
  sliding_scale_min: z.string().optional(),
  sliding_scale_max: z.string().optional(),
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

const DEFAULT_IMAGE_URL =
  "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2FGenerated_Logo_White_Lotus_darktext_transparent.png?alt=media&token=59618fb8-21e8-483e-b4c0-b49d4651955f";

// Local storage keys
const STORAGE_KEYS = {
  EVENT_FORM_DRAFT: "event_form_draft",
  SHOW_EARLY_BIRD: "event_form_show_early_bird",
  TICKET_VARIANTS: "event_form_ticket_variants",
  SHOW_SLIDING_SCALE: "event_form_show_sliding_scale",
};

export function useEventForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(DEFAULT_IMAGE_URL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [duplicatedImageUrl, setDuplicatedImageUrl] = useState(null);

  // Initialize state from localStorage or defaults
  const [showEarlyBird, setShowEarlyBird] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEYS.SHOW_EARLY_BIRD);
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });

  const [showSlidingScale, setShowSlidingScale] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEYS.SHOW_SLIDING_SCALE);
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });

  const [showCustomLocation, setShowCustomLocation] = useState(false);

  const [ticketVariants, setTicketVariants] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEYS.TICKET_VARIANTS);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [hostUsers, setHostUsers] = useState([]);
  const isAdmin = session?.user?.role === "admin";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      shortdescription: "",
      description: "",
      date: "",
      duration: "",
      location: "Bankastræti 2, 101 Reykjavik",
      price: "",
      payment: "online",
      host: session?.user?.email || "team@whitelotus.is",
      hasEarlyBird: false,
      early_bird_price: "",
      early_bird_date: "",
      hasSlidingScale: false,
      sliding_scale_min: "",
      sliding_scale_max: "",
      facebook_link: "",
    },
  });

  // Watch form values for auto-save
  const watchedValues = watch();

  // Auto-save form data to localStorage
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      Object.keys(watchedValues).length > 0
    ) {
      const formData = {
        ...watchedValues,
        showEarlyBird,
        showSlidingScale,
        ticketVariants,
      };
      localStorage.setItem(
        STORAGE_KEYS.EVENT_FORM_DRAFT,
        JSON.stringify(formData)
      );
    }
  }, [watchedValues, showEarlyBird, showSlidingScale, ticketVariants]);

  // Persist showEarlyBird state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEYS.SHOW_EARLY_BIRD,
        JSON.stringify(showEarlyBird)
      );
    }
  }, [showEarlyBird]);

  // Persist ticketVariants state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEYS.TICKET_VARIANTS,
        JSON.stringify(ticketVariants)
      );
    }
  }, [ticketVariants]);

  // Persist showSlidingScale state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEYS.SHOW_SLIDING_SCALE,
        JSON.stringify(showSlidingScale)
      );
    }
  }, [showSlidingScale]);

  // Load saved form data on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem(STORAGE_KEYS.EVENT_FORM_DRAFT);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          // Restore form values
          reset({
            name: parsed.name || "",
            shortdescription: parsed.shortdescription || "",
            description: parsed.description || "",
            date: parsed.date || "",
            duration: parsed.duration || "",
            price: parsed.price || "",
            payment: parsed.payment || "online",
            host: parsed.host || session?.user?.email || "team@whitelotus.is",
            hasEarlyBird: parsed.hasEarlyBird || false,
            early_bird_price: parsed.early_bird_price || "",
            early_bird_date: parsed.early_bird_date || "",
            facebook_link: parsed.facebook_link || "",
          });

          // Restore UI state
          if (parsed.showEarlyBird !== undefined) {
            setShowEarlyBird(parsed.showEarlyBird);
          }
          if (parsed.ticketVariants && Array.isArray(parsed.ticketVariants)) {
            setTicketVariants(parsed.ticketVariants);
          }
        } catch (error) {
          console.warn("Failed to restore form data:", error);
        }
      }
    }
  }, [reset]);

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

  const handleImageChange = useCallback((file, previewUrl) => {
    setImageFile(file);
    setImagePreview(previewUrl);
    setDuplicatedImageUrl(null);
  }, []);

  // Clear saved form data after successful submission
  const clearSavedForm = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.EVENT_FORM_DRAFT);
      localStorage.removeItem(STORAGE_KEYS.SHOW_EARLY_BIRD);
      localStorage.removeItem(STORAGE_KEYS.SHOW_SLIDING_SCALE);
      localStorage.removeItem(STORAGE_KEYS.TICKET_VARIANTS);
    }
  }, []);

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

      // Validate sliding scale price range
      if (data.hasSlidingScale) {
        const mainPrice = parseInt(data.price, 10) || 0;
        const minPrice = parseInt(data.sliding_scale_min, 10) || 0;
        const maxPrice = parseInt(data.sliding_scale_max, 10) || 0;

        // Check if min is less than max
        if (minPrice >= maxPrice) {
          setError("sliding_scale_min", {
            type: "manual",
            message: "Minimum price must be less than maximum price.",
          });
          setIsSubmitting(false);
          return;
        }

        // Check if main price is within range
        if (mainPrice < minPrice || mainPrice > maxPrice) {
          setError("price", {
            type: "manual",
            message: `When sliding scale is enabled, the main price must be between ${minPrice} and ${maxPrice} ISK.`,
          });
          setIsSubmitting(false);
          return;
        }
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

        // Parse the datetime-local input and treat it as Iceland time
        const eventDate = new Date(data.date + "+00:00"); // Treat as UTC to avoid timezone conversion
        if (isNaN(eventDate.getTime())) {
          throw new Error("Invalid date format");
        }

        const eventData = {
          name: data.name,
          shortdescription: data.shortdescription,
          description: data.description,
          duration: data.duration ? parseFloat(data.duration) : null,
          location: showCustomLocation
            ? data.location
            : "Bankastræti 2, 101 Reykjavik",
          price: parseInt(data.price, 10) || 0,
          early_bird_price: data.hasEarlyBird
            ? parseInt(data.early_bird_price, 10) || 0
            : null,
          early_bird_date: data.hasEarlyBird
            ? new Date(data.early_bird_date + "+00:00").toISOString()
            : null,
          has_sliding_scale: data.hasSlidingScale || false,
          sliding_scale_min: data.hasSlidingScale
            ? parseInt(data.sliding_scale_min, 10) || 0
            : null,
          sliding_scale_max: data.hasSlidingScale
            ? parseInt(data.sliding_scale_max, 10) || 0
            : null,
          sliding_scale_suggested: data.hasSlidingScale
            ? parseInt(data.price, 10) || 0
            : null,
          facebook_link: data.facebook_link,
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

        const createdEvent = await response.json();

        // Clear saved form data after successful submission
        clearSavedForm();

        // Navigate to the newly created event page
        if (createdEvent.slug) {
          router.push(`/events/${createdEvent.slug}`);
        } else {
          // Fallback to events list if slug is not available
          router.push("/events");
        }
        router.refresh();
      } catch (error) {
        // Handle specific error types with human-readable messages
        let errorMessage = "Failed to create event. Please try again.";

        if (
          error.message.includes(
            'duplicate key value violates unique constraint "events_slug_key"'
          )
        ) {
          errorMessage =
            "An event with this name and date already exists. Please choose a different name or date.";
        } else if (error.message.includes("Failed to create event:")) {
          // Extract the actual error message from the API response
          const apiError = error.message.replace(
            "Failed to create event: ",
            ""
          );
          if (
            apiError.includes("duplicate key value violates unique constraint")
          ) {
            errorMessage =
              "An event with this name and date already exists. Please choose a different name or date.";
          } else {
            errorMessage = apiError;
          }
        }

        toast.error(errorMessage);
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
      clearSavedForm,
    ]
  );

  // Load initial data for duplication
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
              duration: event.duration ? event.duration.toString() : "",
              price: event.price.toString(),
              payment: event.payment,
              host: event.host,
              hasEarlyBird: !!event.early_bird_price,
              early_bird_price: event.early_bird_price?.toString() || "",
              early_bird_date: event.early_bird_date
                ? new Date(event.early_bird_date).toISOString().slice(0, 16)
                : "",
              hasSlidingScale: !!event.has_sliding_scale,
              sliding_scale_min: event.sliding_scale_min?.toString() || "",
              sliding_scale_max: event.sliding_scale_max?.toString() || "",
              location: event.location || "Bankastræti 2, 101 Reykjavik",
              facebook_link: "", // Always clear Facebook link when duplicating
            });

            if (event.image && event.image !== DEFAULT_IMAGE_URL) {
              setImagePreview(event.image);
              setDuplicatedImageUrl(event.image);
            }

            // Set early bird state
            setShowEarlyBird(!!event.early_bird_price);

            // Set sliding scale state
            setShowSlidingScale(!!event.has_sliding_scale);

            // Set custom location state (if location is not the default)
            setShowCustomLocation(
              event.location !== "Bankastræti 2, 101 Reykjavik"
            );

            // Set ticket variants if they exist
            if (event.ticket_variants && Array.isArray(event.ticket_variants)) {
              setTicketVariants(event.ticket_variants);
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

  // Set host email from session (only if no saved data exists)
  useEffect(() => {
    if (session?.user?.email && typeof window !== "undefined") {
      const savedData = localStorage.getItem(STORAGE_KEYS.EVENT_FORM_DRAFT);
      if (!savedData) {
        reset((formValues) => ({
          ...formValues,
          host: session.user.email,
        }));
      }
    }
  }, [session, reset]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  // Fetch host users for admin
  useEffect(() => {
    if (isAdmin) {
      const fetchHosts = async () => {
        const { data, error } = await supabase
          .from("users")
          .select("email, name")
          .in("role", ["host", "admin"]);
        if (!error) setHostUsers(data || []);
      };
      fetchHosts();
    }
  }, [isAdmin]);

  return {
    // Form state
    register,
    handleSubmit,
    errors,
    setError,
    reset,
    watch,
    setValue,
    isSubmitting,
    imageProcessing,

    // Image state
    imagePreview,
    handleImageChange,

    // Ticket variants
    ticketVariants,
    addTicketVariant,
    removeTicketVariant,
    updateTicketVariant,

    // Early bird
    showEarlyBird,
    setShowEarlyBird,

    // Sliding scale
    showSlidingScale,
    setShowSlidingScale,

    // Custom location
    showCustomLocation,
    setShowCustomLocation,

    // Host users
    hostUsers,
    isAdmin,

    // Session
    session,
    status,

    // Submit
    onSubmit,
  };
}
