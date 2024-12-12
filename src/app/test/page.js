"use client";

import { useForm } from "react-hook-form";

function FormComponent() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Form submitted with data:", data);
  };

  return (
    <form
      className="flex flex-col gap-4 m-32"
      onSubmit={handleSubmit(onSubmit)}
    >
      <input
        {...register("name", { required: "Name is required" })}
        type="text"
      />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register("email")} type="email" />
      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

export default function Test() {
  return (
    <div className="min-h-screen">
      <FormComponent />
    </div>
  );
}
