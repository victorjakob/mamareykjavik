"use client";
import Image from "next/image";

export default function ProductCard({
  item,
  cartItems,
  onRemove,
  onUpdateQuantity,
}) {
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) {
      onRemove(item.id);
    } else {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="flex items-center p-6">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <Image
            src={item.products.image}
            alt={item.products.name}
            width={96}
            height={96}
            className="object-cover rounded-lg shadow-sm"
          />
        </div>

        {/* Product Details */}
        <div className="ml-6 flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {item.products.name}
          </h3>
          <div className="space-y-1">
            <p className="text-gray-500 text-sm">
              Unit price: {item.products.price} kr
            </p>
            <p className="text-emerald-600 font-medium">
              Total: {item.products.price * item.quantity} kr
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-6">
          {/* Quantity Controls */}
          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-l-lg transition-colors"
            >
              −
            </button>
            <span className="w-12 text-center font-medium text-gray-700">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-r-lg transition-colors"
            >
              +
            </button>
          </div>

          {/* Delete Button */}
          <button
            onClick={() => handleQuantityChange(0)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
