"use client";

import React from "react";
import { useForm } from "react-hook-form";
import Input from "../form/input";
import Textarea from "../form/TextArea";

export default function FormWL() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    // Here we'll add email integration in the next step
  };

  return (
    <div className="max-w-lg mx-auto mt-32 p-6 border border-gray-200 rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-6">Event Registration Form</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Name"
          name="name"
          register={register}
          required
          placeholder="John Doe"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">Name is required.</p>
        )}

        <Input
          label="Email"
          name="email"
          type="email"
          register={register}
          required
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">Email is required.</p>
        )}

        <Input
          label="What is the event?"
          name="event"
          register={register}
          required
          placeholder="Birthday Party, Wedding, etc."
        />
        {errors.event && (
          <p className="text-red-500 text-sm">Event is required.</p>
        )}

        <Input
          label="Time and Date"
          name="timeAndDate"
          type="datetime-local"
          register={register}
          required
        />
        {errors.timeAndDate && (
          <p className="text-red-500 text-sm">Time and Date are required.</p>
        )}

        <Input
          label="How many people are you expecting?"
          name="guestCount"
          type="number"
          register={register}
          required
          placeholder="e.g., 50"
        />
        {errors.guestCount && (
          <p className="text-red-500 text-sm">Guest count is required.</p>
        )}

        <Textarea
          label="Any questions or comments?"
          name="comments"
          register={register}
          placeholder="Let us know if you have any specific requests."
        />

        <button
          type="submit"
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
