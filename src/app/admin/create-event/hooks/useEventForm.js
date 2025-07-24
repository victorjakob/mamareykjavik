import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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

const DEFAULT_IMAGE_URL =
  "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2FGenerated_Logo_White_Lotus_darktext_transparent.png?alt=media&token=59618fb8-21e8-483e-b4c0-b49d4651955f";

export function useEventForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(DEFAULT_IMAGE_URL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [duplicatedImageUrl, setDuplicatedImageUrl] = useState(null);
  const [showEarlyBird, setShowEarlyBird] = useState(false);
  const [ticketVariants, setTicketVariants] = useState([]);
  const [hostUsers, setHostUsers] = useState([]);
  const isAdmin = session?.user?.role === "admin";

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

  // Set host email from session
  useEffect(() => {
    if (session?.user?.email) {
      reset((formValues) => ({
        ...formValues,
        host: session.user.email,
      }));
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
