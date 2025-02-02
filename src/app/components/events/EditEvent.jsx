"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PropagateLoader } from "react-spinners";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { toast } from "react-hot-toast";

export default function EditEvent() {
  const router = useRouter();
  const params = useParams();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      shortdescription: "",
      description: "",
      date: "",
      duration: "",
      price: "",
      image: "",
    },
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
        setImageUrl(eventData.image);

        // Set form values
        reset({
          name: eventData.name,
          shortdescription: eventData.shortdescription,
          description: eventData.description,
          date: new Date(eventData.date).toISOString().slice(0, 16),
          duration: eventData.duration,
          price: eventData.price,
          image: eventData.image,
        });
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [params.slug, reset]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.includes("image")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) return imageUrl;

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `event-images/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("events")
        .upload(filePath, imageFile, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          },
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("events").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      toast.error("Error uploading image");
      throw error;
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const imageUrl = await uploadImage();

      const { error } = await supabase
        .from("events")
        .update({
          name: data.name,
          shortdescription: data.shortdescription,
          description: data.description,
          date: new Date(data.date).toISOString(),
          duration: data.duration,
          price: data.price,
          image: imageUrl || data.image,
        })
        .eq("id", event.id);

      if (error) throw error;

      toast.success("Event updated successfully");
      router.push("/events/manager");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <PropagateLoader color="#4F46E5" size={12} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-10">
          Edit Event
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Image
              </label>
              <div className="mt-2 flex flex-col items-center space-y-4">
                {imageUrl && (
                  <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt="Event preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Name
              </label>
              <input
                {...register("name", { required: "Event name is required" })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Short Description
              </label>
              <input
                {...register("shortdescription", {
                  required: "Short description is required",
                })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
              />
              {errors.shortdescription && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.shortdescription.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Description
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date and Time
                </label>
                <input
                  type="datetime-local"
                  {...register("date", { required: "Date is required" })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  {...register("duration", {
                    required: "Duration is required",
                    min: {
                      value: 0.5,
                      message: "Duration must be at least 0.5 hours",
                    },
                  })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.duration.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price ($)
              </label>
              <input
                type="number"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price cannot be negative" },
                })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.price.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.push("/events/manager")}
              className="px-6 py-3 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <PropagateLoader color="#ffffff" size={8} />
                  <span className="ml-2">Saving...</span>
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
