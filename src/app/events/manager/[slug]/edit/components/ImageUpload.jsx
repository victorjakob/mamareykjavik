import Image from "next/image";

// Branded image upload for the edit form — matches the create flow's look.
// Stays a "dumb" input: the actual processing (HEIC convert / compression)
// happens in the edit hook, so onChange just forwards the file.
export default function ImageUpload({
  imagePreview,
  onImageChange,
  onError,
  imageProcessing,
}) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        {imagePreview ? (
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
        ) : (
          <div
            className="relative w-full sm:w-64 h-48 sm:h-36 rounded-xl overflow-hidden border-4 border-white flex items-center justify-center"
            style={{ background: "#faf6f2" }}
          >
            <svg className="w-12 h-12" fill="none" stroke="#c0a890" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        <label
          className="cursor-pointer inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm font-medium text-[#ff914d] hover:text-[#c76a2b] transition-all duration-200 group w-full sm:w-auto justify-center"
          style={{ background: "#faf6f2", border: "2px dashed #e8ddd3" }}
        >
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
          {imageProcessing ? "Processing..." : "Upload a new image"}
          <input
            id="image"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
            onChange={onImageChange}
            className="hidden"
            disabled={imageProcessing}
          />
        </label>
      </div>
      {imageProcessing && (
        <p className="mt-2 text-sm text-[#ff914d] flex items-center gap-1">
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
