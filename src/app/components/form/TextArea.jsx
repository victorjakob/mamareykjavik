import React from "react";

export default function Textarea({
  label,
  name,
  register,
  required,
  placeholder,
}) {
  return (
    <div className="mb-4">
      <label
        className="block text-sm font-medium text-gray-700 mb-2"
        htmlFor={name}
      >
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        {...register(name, { required })}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      ></textarea>
    </div>
  );
}
