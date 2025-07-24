"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 2,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.8,
  maxIteration: 10,
};

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export default function ImageUpload({
  imagePreview,
  onImageChange,
  onError,
  defaultImageUrl = "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2FGenerated_Logo_White_Lotus_darktext_transparent.png?alt=media&token=59618fb8-21e8-483e-b4c0-b49d4651955f",
}) {
  const [imageProcessing, setImageProcessing] = useState(false);

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
        onError("image", {
          type: "manual",
          message:
            "Please upload a valid image file (JPEG, PNG, WebP, or HEIC/HEIF)",
        });
        return;
      }

      setImageProcessing(true);
      try {
        const processedFile = await processImage(file);
        onImageChange(processedFile, URL.createObjectURL(processedFile));
      } catch (error) {
        onError("image", {
          type: "manual",
          message:
            error.message || "Failed to process image. Please try again.",
        });
      } finally {
        setImageProcessing(false);
      }
    },
    [onImageChange, onError, processImage]
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        {imagePreview && (
          <div className="relative w-full sm:w-64 h-48 sm:h-36 rounded-xl overflow-hidden shadow-lg border-4 border-white">
            <Image
              src={imagePreview}
              alt="Event preview"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        )}
        <label className="cursor-pointer inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border-2 border-dashed border-indigo-300 rounded-xl text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400 transition-all duration-200 group w-full sm:w-auto justify-center">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          {imageProcessing ? "Processing..." : "Upload Image"}
          <input
            id="image"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
            onChange={handleImageChange}
            className="hidden"
            disabled={imageProcessing}
          />
        </label>
      </div>
      {imageProcessing && (
        <p className="mt-2 text-sm text-indigo-600 flex items-center gap-1">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing image...
        </p>
      )}
    </div>
  );
}
