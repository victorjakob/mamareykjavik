import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  CalendarIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function DateTimeQuestion({ formData, updateFormData, t }) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartHour, setSelectedStartHour] = useState("");
  const [selectedStartMinute, setSelectedStartMinute] = useState("");
  const [selectedEndHour, setSelectedEndHour] = useState("");
  const [selectedEndMinute, setSelectedEndMinute] = useState("");

  const datePickerRef = useRef(null);
  const startTimePickerRef = useRef(null);
  const endTimePickerRef = useRef(null);

  useEffect(() => {
    if (formData.dateTime?.preferred) {
      const dateObj = new Date(formData.dateTime.preferred);
      setDate(dateObj.toISOString().split("T")[0]);
      const timeString = dateObj.toTimeString().slice(0, 5);
      setStartTime(timeString);
      const [hour, minute] = timeString.split(":");
      setSelectedStartHour(hour);
      setSelectedStartMinute(minute);
    }
    if (formData.dateTime?.endTime) {
      const endTimeString = formData.dateTime.endTime;
      setEndTime(endTimeString);
      const [hour, minute] = endTimeString.split(":");
      setSelectedEndHour(hour);
      setSelectedEndMinute(minute);
    }
  }, [formData.dateTime]);

  // Click outside to close pickers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
      if (
        startTimePickerRef.current &&
        !startTimePickerRef.current.contains(event.target)
      ) {
        setShowStartTimePicker(false);
      }
      if (
        endTimePickerRef.current &&
        !endTimePickerRef.current.contains(event.target)
      ) {
        setShowEndTimePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    updateDateTime(newDate, startTime, endTime);
  };

  const handleStartTimeChange = (newTime) => {
    setStartTime(newTime);
    updateDateTime(date, newTime, endTime);
  };

  const handleEndTimeChange = (newTime) => {
    setEndTime(newTime);
    updateDateTime(date, startTime, newTime);
  };

  const updateDateTime = (dateValue, startTimeValue, endTimeValue) => {
    if (dateValue && startTimeValue) {
      const dateTime = new Date(`${dateValue}T${startTimeValue}`);
      // Check if the date is valid before calling toISOString()
      if (!isNaN(dateTime.getTime())) {
        updateFormData({
          dateTime: {
            ...formData.dateTime,
            preferred: dateTime.toISOString(),
            startTime: startTimeValue,
            endTime: endTimeValue,
          },
        });
      }
    }
  };

  const today = new Date().toISOString().split("T")[0];

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = (date) => {
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isToday = (day, month) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month.getMonth() === today.getMonth() &&
      month.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day, month) => {
    if (!date) return false;
    const selectedDate = new Date(date);
    return (
      day === selectedDate.getDate() &&
      month.getMonth() === selectedDate.getMonth() &&
      month.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isPast = (day, month) => {
    const today = new Date();
    const checkDate = new Date(month.getFullYear(), month.getMonth(), day);
    return checkDate < today;
  };

  const handleDateSelect = (day) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const dateString = selectedDate.toISOString().split("T")[0];
    handleDateChange(dateString);
    setShowDatePicker(false);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const monthNames = [
    "Janúar",
    "Febrúar",
    "Mars",
    "Apríl",
    "Maí",
    "Júní",
    "Júlí",
    "Ágúst",
    "September",
    "Október",
    "Nóvember",
    "Desember",
  ];

  const dayNames = [
    { short: "S", key: "sun" },
    { short: "M", key: "mon" },
    { short: "Þ", key: "tue" },
    { short: "M", key: "wed" },
    { short: "F", key: "thu" },
    { short: "F", key: "fri" },
    { short: "L", key: "sat" },
  ];

  // Time picker helper functions
  const generateHours = () => {
    return [
      "08",
      "09",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
    ];
  };

  const generateMinutes = () => {
    return ["00", "15", "30", "45"];
  };

  const handleStartTimeSelect = (hour, minute) => {
    setSelectedStartHour(hour);
    setSelectedStartMinute(minute);
    const timeString = `${hour}:${minute}`;
    setStartTime(timeString);
    handleStartTimeChange(timeString);

    // Auto-close picker when both hour and minute are selected
    if (hour && minute) {
      setShowStartTimePicker(false);
    }
  };

  const handleEndTimeSelect = (hour, minute) => {
    setSelectedEndHour(hour);
    setSelectedEndMinute(minute);
    const timeString = `${hour}:${minute}`;
    setEndTime(timeString);
    handleEndTimeChange(timeString);

    // Auto-close picker when both hour and minute are selected
    if (hour && minute) {
      setShowEndTimePicker(false);
    }
  };

  return (
    <>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-extralight text-[#fefff5] mb-8 text-center">
          Dagsetning
        </h2>

        <div className="text-center mb-6">
          <p className="text-[#fefff5] font-light">
            Hvenær á viðburðurinn að fara fram?
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          {/* Date Picker Button */}
          <div className="mb-8 relative" ref={datePickerRef}>
            <motion.button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full p-4 bg-slate-900/50 border border-slate-600/30 rounded-xl text-[#fefff5] hover:border-[#a77d3b]/50 hover:bg-slate-800/50 transition-all duration-200 flex items-center justify-between group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-5 h-5 text-[#a77d3b]" />
                <span className="font-light">
                  {date
                    ? new Date(date).toLocaleDateString("is-IS", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Veldu dagsetningu"}
                </span>
              </div>
              <ChevronDownIcon
                className={`w-5 h-5 text-[#a77d3b] transition-transform duration-200 ${
                  showDatePicker ? "rotate-180" : ""
                }`}
              />
            </motion.button>

            {/* Custom Calendar */}
            <AnimatePresence>
              {showDatePicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-sm border border-slate-600/30 rounded-xl p-3 z-50"
                >
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                    >
                      <ChevronLeftIcon className="w-5 h-5 text-[#a77d3b]" />
                    </button>
                    <h3 className="text-lg font-light text-[#fefff5]">
                      {monthNames[currentMonth.getMonth()]}{" "}
                      {currentMonth.getFullYear()}
                    </h3>
                    <button
                      onClick={() => navigateMonth(1)}
                      className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                    >
                      <ChevronRightIcon className="w-5 h-5 text-[#a77d3b]" />
                    </button>
                  </div>

                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {dayNames.map((day) => (
                      <div
                        key={day.key}
                        className="text-center text-sm font-light text-slate-400 py-1"
                      >
                        {day.short}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarDays(currentMonth).map((day, index) => (
                      <div key={index} className="h-8">
                        {day ? (
                          <motion.button
                            onClick={() =>
                              !isPast(day, currentMonth) &&
                              handleDateSelect(day)
                            }
                            disabled={isPast(day, currentMonth)}
                            className={`
                            w-full h-full rounded-lg text-sm font-light transition-all duration-200
                            ${
                              isSelected(day, currentMonth)
                                ? "bg-[#a77d3b] text-[#fefff5]"
                                : isToday(day, currentMonth)
                                  ? "bg-[#a77d3b]/20 text-[#a77d3b] border border-[#a77d3b]/30"
                                  : isPast(day, currentMonth)
                                    ? "text-slate-500 cursor-not-allowed"
                                    : "text-[#fefff5] hover:bg-slate-800/50 hover:text-[#a77d3b]"
                            }
                          `}
                            whileHover={
                              !isPast(day, currentMonth) &&
                              !isSelected(day, currentMonth)
                                ? { scale: 1.1 }
                                : {}
                            }
                            whileTap={
                              !isPast(day, currentMonth) ? { scale: 0.95 } : {}
                            }
                          >
                            {day}
                          </motion.button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Start Time Picker Button */}
          <div className="mb-6 relative" ref={startTimePickerRef}>
            <motion.button
              onClick={() => setShowStartTimePicker(!showStartTimePicker)}
              className="w-full p-4 bg-slate-900/50 border border-slate-600/30 rounded-xl text-[#fefff5] hover:border-[#a77d3b]/50 hover:bg-slate-800/50 transition-all duration-200 flex items-center justify-between group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <ClockIcon className="w-5 h-5 text-[#a77d3b]" />
                <span className="font-light">
                  {startTime
                    ? new Date(`2000-01-01T${startTime}`).toLocaleTimeString(
                        "is-IS",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "Veldu byrjunartíma"}
                </span>
              </div>
              <ChevronDownIcon
                className={`w-5 h-5 text-[#a77d3b] transition-transform duration-200 ${
                  showStartTimePicker ? "rotate-180" : ""
                }`}
              />
            </motion.button>

            {/* Custom Start Time Picker */}
            <AnimatePresence>
              {showStartTimePicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-sm border border-slate-600/30 rounded-xl p-4 z-50"
                >
                  <div className="flex items-center justify-center space-x-6">
                    {/* Hours */}
                    <div className="flex flex-col items-center">
                      <label className="text-xs font-light text-slate-400 mb-2">
                        Klst
                      </label>
                      <div className="h-32 overflow-y-auto scrollbar-hide">
                        <div className="space-y-1">
                          {generateHours().map((hour) => (
                            <motion.button
                              key={hour}
                              onClick={() =>
                                handleStartTimeSelect(hour, selectedStartMinute)
                              }
                              className={`
                              w-10 h-7 rounded text-xs font-light transition-all duration-200 block
                              ${
                                selectedStartHour === hour
                                  ? "bg-[#a77d3b] text-[#fefff5]"
                                  : "text-[#fefff5] hover:bg-slate-800/50 hover:text-[#a77d3b]"
                              }
                            `}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {hour}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="text-xl font-light text-[#a77d3b]">:</div>

                    {/* Minutes */}
                    <div className="flex flex-col items-center">
                      <label className="text-xs font-light text-slate-400 mb-2">
                        Mín
                      </label>
                      <div className="h-32 overflow-y-auto scrollbar-hide">
                        <div className="space-y-1">
                          {generateMinutes().map((minute) => (
                            <motion.button
                              key={minute}
                              onClick={() =>
                                handleStartTimeSelect(selectedStartHour, minute)
                              }
                              className={`
                              w-10 h-7 rounded text-xs font-light transition-all duration-200 block
                              ${
                                selectedStartMinute === minute
                                  ? "bg-[#a77d3b] text-[#fefff5]"
                                  : "text-[#fefff5] hover:bg-slate-800/50 hover:text-[#a77d3b]"
                              }
                            `}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {minute}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* End Time Picker Button */}
          <div className="mb-8 relative" ref={endTimePickerRef}>
            <motion.button
              onClick={() => setShowEndTimePicker(!showEndTimePicker)}
              className="w-full p-4 bg-slate-900/50 border border-slate-600/30 rounded-xl text-[#fefff5] hover:border-[#a77d3b]/50 hover:bg-slate-800/50 transition-all duration-200 flex items-center justify-between group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <ClockIcon className="w-5 h-5 text-[#a77d3b]" />
                <span className="font-light">
                  {endTime
                    ? new Date(`2000-01-01T${endTime}`).toLocaleTimeString(
                        "is-IS",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "Veldu endatíma"}
                </span>
              </div>
              <ChevronDownIcon
                className={`w-5 h-5 text-[#a77d3b] transition-transform duration-200 ${
                  showEndTimePicker ? "rotate-180" : ""
                }`}
              />
            </motion.button>

            {/* Custom End Time Picker */}
            <AnimatePresence>
              {showEndTimePicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-sm border border-slate-600/30 rounded-xl p-4 z-50"
                >
                  <div className="flex items-center justify-center space-x-6">
                    {/* Hours */}
                    <div className="flex flex-col items-center">
                      <label className="text-xs font-light text-slate-400 mb-2">
                        Klst
                      </label>
                      <div className="h-32 overflow-y-auto scrollbar-hide">
                        <div className="space-y-1">
                          {generateHours().map((hour) => (
                            <motion.button
                              key={hour}
                              onClick={() =>
                                handleEndTimeSelect(hour, selectedEndMinute)
                              }
                              className={`
                              w-10 h-7 rounded text-xs font-light transition-all duration-200 block
                              ${
                                selectedEndHour === hour
                                  ? "bg-[#a77d3b] text-[#fefff5]"
                                  : "text-[#fefff5] hover:bg-slate-800/50 hover:text-[#a77d3b]"
                              }
                            `}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {hour}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="text-xl font-light text-[#a77d3b]">:</div>

                    {/* Minutes */}
                    <div className="flex flex-col items-center">
                      <label className="text-xs font-light text-slate-400 mb-2">
                        Mín
                      </label>
                      <div className="h-32 overflow-y-auto scrollbar-hide">
                        <div className="space-y-1">
                          {generateMinutes().map((minute) => (
                            <motion.button
                              key={minute}
                              onClick={() =>
                                handleEndTimeSelect(selectedEndHour, minute)
                              }
                              className={`
                              w-10 h-7 rounded text-xs font-light transition-all duration-200 block
                              ${
                                selectedEndMinute === minute
                                  ? "bg-[#a77d3b] text-[#fefff5]"
                                  : "text-[#fefff5] hover:bg-slate-800/50 hover:text-[#a77d3b]"
                              }
                            `}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {minute}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
  );
}
