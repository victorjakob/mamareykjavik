import Image from "next/image";

export default function ImageUpload({
  imagePreview,
  onImageChange,
  onError,
  imageProcessing,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="Event preview"
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1">
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Upload a new image
          </label>
          <input
            id="image"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
            onChange={onImageChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100
              focus:outline-none"
            disabled={imageProcessing}
          />
          {imageProcessing && (
            <p className="mt-2 text-sm text-indigo-600 flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing image...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
