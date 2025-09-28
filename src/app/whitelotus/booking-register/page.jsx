"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  QueueListIcon,
  BeakerIcon,
  UsersIcon,
  HomeIcon,
  TableCellsIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function BookingRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Contact Information
    contact: {
      name: "",
      email: "",
      phone: "",
    },
    // Tech Contact Information
    techContact: {
      name: "",
      email: "",
      phone: "",
    },
    // Date and Time
    dateTime: {
      date: "",
      startTime: "",
      endTime: "",
    },
    // Services
    services: [],
    // Food
    food: {
      type: "", // buffet or plated
      details: [], // appetizers, mainCourse, dessert, fingerFood
    },
    // Drinks
    drinks: {
      preOrder: {
        beerKeg: 0,
        whiteWine: 0,
        redWine: 0,
        sparklingWine: 0,
        cocktails: 0,
      },
      openBar: false,
      nonAlcoholicCocktails: false,
    },
    // Guest Information
    guestCount: 0,
    // Room Setup
    roomSetup: "",
    customSetupDetails: "",
    // Tablecloth
    tablecloth: "",
    // Additional Notes
    notes: "",
    // Section Notes
    contactNotes: "",
    dateTimeNotes: "",
    servicesNotes: "",
    foodNotes: "",
    drinksNotes: "",
    roomSetupNotes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openNotes, setOpenNotes] = useState({});

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear error when user starts typing
    if (errors[section]?.[field]) {
      setErrors((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: null,
        },
      }));
    }
  };

  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter((id) => id !== serviceId)
        : [...prev.services, serviceId],
    }));
  };

  const handleFoodDetailToggle = (detailId) => {
    setFormData((prev) => ({
      ...prev,
      food: {
        ...prev.food,
        details: prev.food.details.includes(detailId)
          ? prev.food.details.filter((id) => id !== detailId)
          : [...prev.food.details, detailId],
      },
    }));
  };

  const handleDrinkQuantityChange = (drinkId, quantity) => {
    setFormData((prev) => ({
      ...prev,
      drinks: {
        ...prev.drinks,
        preOrder: {
          ...prev.drinks.preOrder,
          [drinkId]: Math.max(0, quantity),
        },
      },
    }));
  };

  const toggleNotes = (section) => {
    setOpenNotes((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Contact validation
    if (!formData.contact.name.trim())
      newErrors.contact = { ...newErrors.contact, name: "Nafn er nauðsynlegt" };
    if (!formData.contact.email.trim())
      newErrors.contact = {
        ...newErrors.contact,
        email: "Netfang er nauðsynlegt",
      };
    if (!formData.contact.phone.trim())
      newErrors.contact = {
        ...newErrors.contact,
        phone: "Símanúmer er nauðsynlegt",
      };

    // Date/Time validation
    if (!formData.dateTime.date)
      newErrors.dateTime = {
        ...newErrors.dateTime,
        date: "Dagsetning er nauðsynleg",
      };
    if (!formData.dateTime.startTime)
      newErrors.dateTime = {
        ...newErrors.dateTime,
        startTime: "Byrjunartími er nauðsynlegur",
      };
    if (!formData.dateTime.endTime)
      newErrors.dateTime = {
        ...newErrors.dateTime,
        endTime: "Endatími er nauðsynlegur",
      };

    // Services validation
    if (formData.services.length === 0)
      newErrors.services = "At least one service must be selected";

    // Guest count validation
    if (formData.guestCount <= 0)
      newErrors.guestCount = "Guest count must be more than 0";

    // Room setup validation
    if (!formData.roomSetup) newErrors.roomSetup = "Room setup is required";

    // Custom setup validation
    if (
      formData.roomSetup === "custom" &&
      !formData.customSetupDetails.trim()
    ) {
      newErrors.customSetupDetails = "Custom setup details are required";
    }

    // Tablecloth validation
    if (!formData.tablecloth) newErrors.tablecloth = "Tablecloth is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would submit to your API
      console.log("Submitting booking data:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Booking has been registered!");
      // Reset form
      setFormData({
        contact: { name: "", email: "", phone: "" },
        techContact: { name: "", email: "", phone: "" },
        dateTime: { date: "", startTime: "", endTime: "" },
        services: [],
        food: { type: "", details: [] },
        drinks: {
          preOrder: {
            beerKeg: 0,
            whiteWine: 0,
            redWine: 0,
            sparklingWine: 0,
            cocktails: 0,
          },
          openBar: false,
          nonAlcoholicCocktails: false,
        },
        guestCount: 0,
        roomSetup: "",
        customSetupDetails: "",
        tablecloth: "",
        notes: "",
        contactNotes: "",
        dateTimeNotes: "",
        servicesNotes: "",
        foodNotes: "",
        drinksNotes: "",
        roomSetupNotes: "",
      });
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("Error occurred while registering booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen mt-10 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mt-8 mb-6">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Booking Registration
          </h1>
          <p className="text-gray-600 text-center">
            Fill out all booking information to prepare the venue for the event
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-center mb-6">
              <UserIcon className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Contact Info
              </h2>
              <button
                type="button"
                onClick={() => toggleNotes("contact")}
                className="ml-4 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {openNotes.contact ? "Hide Notes" : "Add Notes"}
              </button>
            </div>

            {/* Contact Notes */}
            {openNotes.contact && (
              <div className="mb-6">
                <textarea
                  value={formData.contactNotes}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      contactNotes: e.target.value,
                    }));
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add notes about contact information..."
                />
              </div>
            )}

            {/* Customer Contact */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Customer Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    value={formData.contact.name}
                    onChange={(e) =>
                      handleInputChange("contact", "name", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.contact?.name
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Full name *"
                  />
                  {errors.contact?.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.contact.name}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) =>
                      handleInputChange("contact", "email", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.contact?.email
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Email *"
                  />
                  {errors.contact?.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.contact.email}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="tel"
                    value={formData.contact.phone}
                    onChange={(e) =>
                      handleInputChange("contact", "phone", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.contact?.phone
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Phone Number *"
                  />
                  {errors.contact?.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.contact.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tech Contact */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Tech person contact info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    value={formData.techContact?.name || ""}
                    onChange={(e) =>
                      handleInputChange("techContact", "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Tech Contact Name"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    value={formData.techContact?.email || ""}
                    onChange={(e) =>
                      handleInputChange("techContact", "email", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Tech Contact Email"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    value={formData.techContact?.phone || ""}
                    onChange={(e) =>
                      handleInputChange("techContact", "phone", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Tech Contact Phone"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-center mb-4">
              <CalendarIcon className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Date and Time
              </h2>
              <button
                type="button"
                onClick={() => toggleNotes("dateTime")}
                className="ml-4 text-sm text-green-600 hover:text-green-800 underline"
              >
                {openNotes.dateTime ? "Hide Notes" : "Add Notes"}
              </button>
            </div>

            {/* Date Time Notes */}
            {openNotes.dateTime && (
              <div className="mb-4">
                <textarea
                  value={formData.dateTimeNotes}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      dateTimeNotes: e.target.value,
                    }));
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Add notes about date and time..."
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.dateTime.date}
                  onChange={(e) =>
                    handleInputChange("dateTime", "date", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.dateTime?.date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.dateTime?.date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.dateTime.date}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.dateTime.startTime}
                  onChange={(e) =>
                    handleInputChange("dateTime", "startTime", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.dateTime?.startTime
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.dateTime?.startTime && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.dateTime.startTime}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.dateTime.endTime}
                  onChange={(e) =>
                    handleInputChange("dateTime", "endTime", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.dateTime?.endTime
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.dateTime?.endTime && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.dateTime.endTime}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-center mb-4">
              <QueueListIcon className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Services</h2>
              <button
                type="button"
                onClick={() => toggleNotes("services")}
                className="ml-4 text-sm text-purple-600 hover:text-purple-800 underline"
              >
                {openNotes.services ? "Hide Notes" : "Add Notes"}
              </button>
            </div>

            {/* Services Notes */}
            {openNotes.services && (
              <div className="mb-4">
                <textarea
                  value={formData.servicesNotes}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      servicesNotes: e.target.value,
                    }));
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Add notes about services..."
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: "food",
                  label: "Food",
                  description: "Catering and food service",
                },
                {
                  id: "drinks",
                  label: "Drinks",
                  description: "Beverage service and bar",
                },
                {
                  id: "neither",
                  label: "Neither",
                  description: "I only need the venue",
                },
              ].map((service) => (
                <label
                  key={service.id}
                  className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.services.includes(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">
                      {service.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {service.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.services && (
              <p className="text-red-500 text-sm mt-2">
                At least one service must be selected
              </p>
            )}
          </div>

          {/* Food Options */}
          {formData.services.includes("food") && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-center mb-4">
                <QueueListIcon className="w-6 h-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Food</h2>
                <button
                  type="button"
                  onClick={() => toggleNotes("food")}
                  className="ml-4 text-sm text-orange-600 hover:text-orange-800 underline"
                >
                  {openNotes.food ? "Hide Notes" : "Add Notes"}
                </button>
              </div>

              {/* Food Notes */}
              {openNotes.food && (
                <div className="mb-4">
                  <textarea
                    value={formData.foodNotes}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        foodNotes: e.target.value,
                      }));
                    }}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Add notes about food preferences..."
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        id: "buffet",
                        label: "Buffet",
                        description: "Varied selection on buffet table",
                      },
                      {
                        id: "plated",
                        label: "Plated Service",
                        description: "Served on plate for each guest",
                      },
                    ].map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="foodType"
                          value={option.id}
                          checked={formData.food.type === option.id}
                          onChange={(e) =>
                            handleInputChange("food", "type", e.target.value)
                          }
                          className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">
                            {option.label}
                          </div>
                          <div className="text-sm text-gray-500">
                            {option.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Components
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        id: "appetizers",
                        label: "Appetizers",
                        description: "Light appetizers and small dishes",
                      },
                      {
                        id: "mainCourse",
                        label: "Main Course",
                        description: "Main courses and meat dishes",
                      },
                      {
                        id: "dessert",
                        label: "Dessert",
                        description: "Sweet desserts and cakes",
                      },
                      {
                        id: "fingerFood",
                        label: "Finger Food",
                        description: "Light finger food",
                      },
                    ].map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={formData.food.details.includes(option.id)}
                          onChange={() => handleFoodDetailToggle(option.id)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">
                            {option.label}
                          </div>
                          <div className="text-sm text-gray-500">
                            {option.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drinks Options */}
          {formData.services.includes("drinks") && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-center mb-4">
                <BeakerIcon className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Drinks</h2>
                <button
                  type="button"
                  onClick={() => toggleNotes("drinks")}
                  className="ml-4 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  {openNotes.drinks ? "Hide Notes" : "Add Notes"}
                </button>
              </div>

              {/* Drinks Notes */}
              {openNotes.drinks && (
                <div className="mb-4">
                  <textarea
                    value={formData.drinksNotes}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        drinksNotes: e.target.value,
                      }));
                    }}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add notes about drink preferences..."
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Pre-order Drinks
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        id: "beerKeg",
                        label: "Beer Keg",
                        description: "About 75 beers",
                        price: "70.000 kr per keg",
                      },
                      {
                        id: "whiteWine",
                        label: "White Wine",
                        description: "Bottle of white wine",
                        price: "7.000 kr per bottle",
                      },
                      {
                        id: "redWine",
                        label: "Red Wine",
                        description: "Bottle of red wine",
                        price: "7.000 kr per bottle",
                      },
                      {
                        id: "sparklingWine",
                        label: "Sparkling Wine",
                        description: "Bottle of sparkling wine",
                        price: "7.000 kr per bottle",
                      },
                      {
                        id: "cocktails",
                        label: "Cocktails",
                        description: "Write to us for special requests",
                        price: "Special pricing",
                      },
                    ].map((drink) => (
                      <div
                        key={drink.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {drink.label}
                          </div>
                          <div className="text-sm text-gray-500">
                            {drink.description}
                          </div>
                          <div className="text-sm text-blue-600 font-medium">
                            {drink.price}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleDrinkQuantityChange(
                                drink.id,
                                formData.drinks.preOrder[drink.id] - 1
                              )
                            }
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">
                            {formData.drinks.preOrder[drink.id] || 0}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleDrinkQuantityChange(
                                drink.id,
                                formData.drinks.preOrder[drink.id] + 1
                              )
                            }
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Open Bar
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Includes general shots and 3 basic cocktails plus beer,
                      wine and basic soft drinks
                    </p>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="openBar"
                          checked={formData.drinks.openBar === true}
                          onChange={() =>
                            handleInputChange("drinks", "openBar", true)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-900">Já</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="openBar"
                          checked={formData.drinks.openBar === false}
                          onChange={() =>
                            handleInputChange("drinks", "openBar", false)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-900">Nei</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Non-Alcoholic Cocktails
                    </h3>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="nonAlcoholicCocktails"
                          checked={
                            formData.drinks.nonAlcoholicCocktails === true
                          }
                          onChange={() =>
                            handleInputChange(
                              "drinks",
                              "nonAlcoholicCocktails",
                              true
                            )
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-900">Já</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="nonAlcoholicCocktails"
                          checked={
                            formData.drinks.nonAlcoholicCocktails === false
                          }
                          onChange={() =>
                            handleInputChange(
                              "drinks",
                              "nonAlcoholicCocktails",
                              false
                            )
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-900">Nei</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Room Setup */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-center mb-4">
              <HomeIcon className="w-6 h-6 text-teal-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Room Setup
              </h2>
              <button
                type="button"
                onClick={() => toggleNotes("roomSetup")}
                className="ml-4 text-sm text-teal-600 hover:text-teal-800 underline"
              >
                {openNotes.roomSetup ? "Hide Notes" : "Add Notes"}
              </button>
            </div>

            {/* Room Setup Notes */}
            {openNotes.roomSetup && (
              <div className="mb-4">
                <textarea
                  value={formData.roomSetupNotes}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      roomSetupNotes: e.target.value,
                    }));
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Add notes about room setup requirements..."
                />
              </div>
            )}

            <div className="space-y-6">
              {/* Guest Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How many people? *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.guestCount}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      guestCount: parseInt(e.target.value) || 0,
                    }));
                    // Clear error when user types
                    if (errors.guestCount) {
                      setErrors((prev) => ({
                        ...prev,
                        guestCount: null,
                      }));
                    }
                  }}
                  className={`w-32 px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    errors.guestCount ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0"
                />
                {errors.guestCount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.guestCount}
                  </p>
                )}
              </div>

              {/* Room Setup Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How many tables or the setup? *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      id: "all-tables",
                      label: "All Tables",
                      description: "Everyone seated at tables",
                    },
                    {
                      id: "all-standing",
                      label: "All Standing",
                      description: "Cocktail style, no tables",
                    },
                    {
                      id: "fifty-fifty",
                      label: "50/50",
                      description: "Half tables, half standing",
                    },
                    {
                      id: "custom",
                      label: "Custom Setup",
                      description: "Specify in notes section",
                    },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="roomSetup"
                        value={option.id}
                        checked={formData.roomSetup === option.id}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            roomSetup: e.target.value,
                          }));
                          // Clear error when user selects
                          if (errors.roomSetup) {
                            setErrors((prev) => ({
                              ...prev,
                              roomSetup: null,
                            }));
                          }
                        }}
                        className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.roomSetup && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.roomSetup}
                  </p>
                )}
              </div>

              {/* Custom Setup Details */}
              {formData.roomSetup === "custom" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Setup Details *
                  </label>
                  <textarea
                    value={formData.customSetupDetails}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        customSetupDetails: e.target.value,
                      }));
                      // Clear error when user types
                      if (errors.customSetupDetails) {
                        setErrors((prev) => ({
                          ...prev,
                          customSetupDetails: null,
                        }));
                      }
                    }}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      errors.customSetupDetails
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Describe your custom room setup requirements..."
                  />
                  {errors.customSetupDetails && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customSetupDetails}
                    </p>
                  )}
                </div>
              )}

              {/* Tablecloth Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What tablecloth would you like? *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      id: "white",
                      label: "White",
                      description: "White tablecloth",
                    },
                    {
                      id: "black",
                      label: "Black",
                      description: "Black tablecloth",
                    },
                    {
                      id: "none",
                      label: "None (Guest brings)",
                      description: "Guest provides their own tablecloth",
                    },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="tablecloth"
                        value={option.id}
                        checked={formData.tablecloth === option.id}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            tablecloth: e.target.value,
                          }));
                          // Clear error when user selects
                          if (errors.tablecloth) {
                            setErrors((prev) => ({
                              ...prev,
                              tablecloth: null,
                            }));
                          }
                        }}
                        className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.tablecloth && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.tablecloth}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <DocumentTextIcon className="w-6 h-6 text-gray-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Additional Information
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments or special requests
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }));
                }}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                placeholder="Write all additional information here..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5 mr-3" />
                  Submit Booking
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
