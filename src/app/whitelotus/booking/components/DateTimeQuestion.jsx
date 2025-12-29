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
  const [eventType, setEventType] = useState(
    formData.eventType || ""
  );
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [needsEarlyAccess, setNeedsEarlyAccess] = useState(
    formData.needsEarlyAccess !== undefined ? formData.needsEarlyAccess : undefined
  );
  const [setupTime, setSetupTime] = useState(formData.setupTime || "");
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

  const eventTypes = [
    { value: "afmaeli", label: "Afmæli" },
    { value: "vinnustofa", label: "Vinnustofa" },
    { value: "fundur", label: "Fundur" },
    { value: "tonleikar", label: "Tónleikar" },
    { value: "athofn", label: "Athöfn" },
    { value: "brudkaup", label: "Brúðkaup" },
  ];

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
    if (formData.setupTime) {
      setSetupTime(formData.setupTime);
    }
    if (formData.eventType) {
      setEventType(formData.eventType);
    }
  }, [formData.dateTime, formData.setupTime, formData.eventType]);

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

  const handleEventTypeChange = (e) => {
    const value = e.target.value;
    setEventType(value);
    updateFormData({
      eventType: value,
    });
  };

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

  const handleEarlyAccessChange = (value) => {
    const boolValue = value === "yes";
    setNeedsEarlyAccess(boolValue);
    updateFormData({
      needsEarlyAccess: boolValue,
      setupTime: boolValue ? setupTime : undefined,
    });
  };

  const handleSetupTimeChange = (e) => {
    const value = e.target.value;
    setSetupTime(value);
    updateFormData({
      setupTime: value,
    });
  };

  const updateDateTime = (dateValue, startTimeValue, endTimeValue) => {
    if (dateValue && startTimeValue) {
      const dateTime = new Date(`${dateValue}T${startTimeValue}`);
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

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

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
    return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  };

  const generateMinutes = () => {
    return ["00", "15", "30", "45"];
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
          Upplýsingar um viðburð
        </h2>

        <div className="max-w-lg mx-auto space-y-6">
          {/* Event Type Autocomplete Text Field */}
          <div>
            <label className="block text-sm font-light text-[#fefff5] mb-2">
              Hvers konar viðburður er þetta?
            </label>
            <motion.input
              type="text"
              value={eventType}
              onChange={handleEventTypeChange}
              list="event-type-suggestions"
              placeholder="Sláðu inn eða veldu tegund viðburðar"
              autoComplete="off"
              className="w-full p-4 bg-slate-900/50 border border-slate-600/30 rounded-xl text-[#fefff5] font-light placeholder-slate-400 focus:ring-2 focus:ring-[#a77d3b]/50 focus:border-transparent transition-all"
              whileFocus={{ scale: 1.01 }}
            />
            <datalist id="event-type-suggestions">
              {eventTypes.map((type) => (
                <option key={type.value} value={type.label} />
              ))}
            </datalist>
          </div>

          {/* Date Picker */}
          <div className="relative" ref={datePickerRef}>
            <label className="block text-sm font-light text-[#fefff5] mb-2">
              Hvaða dagsetningu viltu bóka?
            </label>
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

            <AnimatePresence>
              {showDatePicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-sm border border-slate-600/30 rounded-xl p-3 z-50"
                >
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

          {/* Start Time Picker */}
          <div className="relative" ref={startTimePickerRef}>
            <label className="block text-sm font-light text-[#fefff5] mb-2">
              Hvenær byrjar viðburðurinn?
            </label>
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

            <AnimatePresence>
              {showStartTimePicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-sm border border-slate-600/30 rounded-xl p-4 z-50"
                >
                  <div className="flex items-center justify-center space-x-6">
                    <div className="flex flex-col items-center">
                      <label className="text-xs font-light text-slate-400 mb-2">
                        Klst
                      </label>
                      <div className="h-32 overflow-y-auto scrollbar-hide">
                        <div className="space-y-1">
                          {generateHours().map((hour) => (
                            <motion.button
                              key={hour}
                              onClick={() => {
                                const finalMinute = selectedStartMinute || "00";
                                setSelectedStartHour(hour);
                                setSelectedStartMinute(finalMinute);
                                const timeString = `${hour}:${finalMinute}`;
                                setStartTime(timeString);
                                handleStartTimeChange(timeString);
                                if (finalMinute) {
                                  setShowStartTimePicker(false);
                                }
                              }}
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

                    <div className="text-xl font-light text-[#a77d3b]">:</div>

                    <div className="flex flex-col items-center">
                      <label className="text-xs font-light text-slate-400 mb-2">
                        Mín
                      </label>
                      <div className="h-32 overflow-y-auto scrollbar-hide">
                        <div className="space-y-1">
                          {generateMinutes().map((minute) => (
                            <motion.button
                              key={minute}
                              onClick={() => {
                                const finalHour = selectedStartHour || "00";
                                setSelectedStartHour(finalHour);
                                setSelectedStartMinute(minute);
                                const timeString = `${finalHour}:${minute}`;
                                setStartTime(timeString);
                                handleStartTimeChange(timeString);
                                if (finalHour) {
                                  setShowStartTimePicker(false);
                                }
                              }}
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

          {/* End Time Picker */}
          <div className="relative" ref={endTimePickerRef}>
            <label className="block text-sm font-light text-[#fefff5] mb-2">
              Hvenær lýkur viðburðinum?
            </label>
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

            <AnimatePresence>
              {showEndTimePicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-sm border border-slate-600/30 rounded-xl p-4 z-50"
                >
                  <div className="flex items-center justify-center space-x-6">
                    <div className="flex flex-col items-center">
                      <label className="text-xs font-light text-slate-400 mb-2">
                        Klst
                      </label>
                      <div className="h-32 overflow-y-auto scrollbar-hide">
                        <div className="space-y-1">
                          {generateHours().map((hour) => (
                            <motion.button
                              key={hour}
                              onClick={() => {
                                const finalMinute = selectedEndMinute || "00";
                                setSelectedEndHour(hour);
                                setSelectedEndMinute(finalMinute);
                                const timeString = `${hour}:${finalMinute}`;
                                setEndTime(timeString);
                                handleEndTimeChange(timeString);
                                if (finalMinute) {
                                  setShowEndTimePicker(false);
                                }
                              }}
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

                    <div className="text-xl font-light text-[#a77d3b]">:</div>

                    <div className="flex flex-col items-center">
                      <label className="text-xs font-light text-slate-400 mb-2">
                        Mín
                      </label>
                      <div className="h-32 overflow-y-auto scrollbar-hide">
                        <div className="space-y-1">
                          {generateMinutes().map((minute) => (
                            <motion.button
                              key={minute}
                              onClick={() => {
                                const finalHour = selectedEndHour || "00";
                                setSelectedEndHour(finalHour);
                                setSelectedEndMinute(minute);
                                const timeString = `${finalHour}:${minute}`;
                                setEndTime(timeString);
                                handleEndTimeChange(timeString);
                                if (finalHour) {
                                  setShowEndTimePicker(false);
                                }
                              }}
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

          {/* Early Access Question */}
          <div>
            <label className="block text-sm font-light text-[#fefff5] mb-2">
              Þarftu aðgang að salnum fyrr fyrir uppsetningu?
            </label>
            <div className="flex gap-4">
              <motion.button
                onClick={() => handleEarlyAccessChange("yes")}
                className={`
                  flex-1 p-4 bg-slate-900/50 border rounded-xl text-[#fefff5] font-light transition-all duration-200
                  ${
                    needsEarlyAccess === true
                      ? "bg-[#a77d3b]/20 border-[#a77d3b] text-[#a77d3b]"
                      : "border-slate-600/30 hover:border-[#a77d3b]/50 hover:bg-slate-800/50"
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Já
              </motion.button>
              <motion.button
                onClick={() => handleEarlyAccessChange("no")}
                className={`
                  flex-1 p-4 bg-slate-900/50 border rounded-xl text-[#fefff5] font-light transition-all duration-200
                  ${
                    needsEarlyAccess === false
                      ? "bg-[#a77d3b]/20 border-[#a77d3b] text-[#a77d3b]"
                      : "border-slate-600/30 hover:border-[#a77d3b]/50 hover:bg-slate-800/50"
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Nei
              </motion.button>
            </div>
          </div>

          {/* Setup Time Text Field - Conditional */}
          {needsEarlyAccess === true && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-light text-[#fefff5] mb-2">
                Klukkan hvað viltu mæta í uppsetningu?
              </label>
              <motion.input
                type="text"
                value={setupTime}
                onChange={handleSetupTimeChange}
                placeholder="T.d. 14:00"
                className="w-full p-4 bg-slate-900/50 border border-slate-600/30 rounded-xl text-[#fefff5] font-light placeholder-slate-400 focus:ring-2 focus:ring-[#a77d3b]/50 focus:border-transparent transition-all"
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
}
