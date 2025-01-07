import React from "react";
import { motion } from "framer-motion";

const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  return (
    <motion.div
      className="flex items-center bg-gray-50 rounded-lg p-4 shadow-sm"
      whileHover={{ scale: 1.02 }}
    >
      <img
        src={item.image}
        alt={item.name}
        className="w-20 h-20 rounded-lg object-cover"
      />
      <div className="ml-4 flex-1">
        <h2 className="font-semibold text-lg">{item.name}</h2>
        <p className="text-gray-600 text-sm">{item.delivery}</p>
        <p className="text-gray-800 font-semibold">${item.price.toFixed(2)}</p>
        <div className="flex items-center mt-2">
          <button
            onClick={() => onDecrease(item.id)}
            className="px-2 py-1 bg-gray-300 rounded-lg text-gray-700 hover:bg-gray-400"
          >
            -
          </button>
          <span className="mx-2 text-lg font-semibold">{item.quantity}</span>
          <button
            onClick={() => onIncrease(item.id)}
            className="px-2 py-1 bg-gray-300 rounded-lg text-gray-700 hover:bg-gray-400"
          >
            +
          </button>
        </div>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="text-red-500 hover:underline text-sm ml-4"
      >
        Remove
      </button>
    </motion.div>
  );
};

export default CartItem;
