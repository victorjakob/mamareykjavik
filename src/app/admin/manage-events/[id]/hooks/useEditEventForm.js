import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
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

export function useEditEventForm() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(DEFAULT_IMAGE_URL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [event, setEvent] = useState(null);
  const [showEarlyBird, setShowEarlyBird] = useState(false);
  const [ticketVariants, setTicketVariants] = useState([]);
  const [hostUsers, setHostUsers] = useState([]);
  const isAdmin = session?.user?.role === "admin";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
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
  }, []);

  const onSubmit = useCallback(
    async (data) => {
      if (!session?.user) {
        setFormError("root", {
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
        } else {
          imageUrl = imagePreview;
        }

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
            duration: parseFloat(data.duration) || 0,
            price: parseInt(data.price, 10) || 0,
            early_bird_price: data.early_bird_price
              ? parseInt(data.early_bird_price, 10)
              : null,
            early_bird_date: earlyBirdDate ? earlyBirdDate.toISOString() : null,
            image: imageUrl,
            payment: data.payment,
            host: data.host || "team@whitelotus.is",
            ticket_variants: ticketVariants.length > 0 ? ticketVariants : null,
          })
          .eq("id", id);

        if (error) throw error;

        toast.success("Event updated successfully");
        router.push("/admin/manage-events");
      } catch (err) {
        toast.error(err.message);
        setFormError("root", {
          type: "manual",
          message: err.message,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      session,
      setFormError,
      imageFile,
      imagePreview,
      uploadImage,
      ticketVariants,
      id,
      router,
    ]
  );

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

        // Set ticket variants if they exist
        if (data.ticket_variants && Array.isArray(data.ticket_variants)) {
          setTicketVariants(data.ticket_variants);
        }

        // Set early bird state
        if (data.early_bird_price || data.early_bird_date) {
          setShowEarlyBird(true);
        }

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
    setFormError,
    reset,
    loading,
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
