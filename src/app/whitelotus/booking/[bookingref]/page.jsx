"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/hooks/useRole";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "../hooks/useTranslations";
import SectionCommentButton from "./components/SectionCommentButton";
import AdminCommentManager from "./components/AdminCommentManager";
import CommentsList from "./components/CommentsList";
import EditableField from "./components/EditableField";
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  ClipboardDocumentIcon,
  PrinterIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  QueueListIcon,
  BeakerIcon,
  SpeakerWaveIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useSession } from "next-auth/react";

const pageFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
};

const rise = {
  initial: { opacity: 0, y: 14 },
  animate: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: d, ease: [0.21, 0.8, 0.2, 1] },
  }),
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// These functions will be moved inside the component to use language context

function moneyIS(n) {
  return Number(n || 0).toLocaleString("is-IS");
}

/** ---------- UI atoms ---------- */

function Surface({ className, children }) {
  return (
    <div
      className={cn(
        "bg-white/75 backdrop-blur-md border border-gray-200/70 rounded-2xl shadow-[0_10px_40px_-24px_rgba(0,0,0,0.35)]",
        className
      )}
    >
      {children}
    </div>
  );
}

function Section({ title, icon, children, subtle, extraSubtle, headerAction }) {
  if (extraSubtle) {
    return (
      <Surface className="p-3 md:p-4">
        <div className="flex items-center justify-center gap-2 pb-2 mb-3 border-b border-gray-100/30">
          {icon ? (
            <div className="h-6 w-6 rounded-lg grid place-items-center bg-gray-100/50 text-gray-500">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.15em] text-gray-400 font-semibold">
              {title}
            </p>
          </div>
        </div>
        {children}
      </Surface>
    );
  }

  return (
    <Surface className="p-5 md:p-7">
      <div className="flex items-center justify-between gap-2 md:gap-3 pb-4 mb-5 border-b border-gray-100/70">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          {icon ? (
            <div
              className={cn(
                "h-9 w-9 rounded-xl grid place-items-center flex-shrink-0",
                subtle
                  ? "bg-gray-100/70 text-gray-600"
                  : "bg-[#a77d3b]/10 text-[#a77d3b]"
              )}
            >
              {icon}
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm md:text-base uppercase tracking-[0.18em] text-gray-500 font-semibold truncate">
              {title}
            </p>
          </div>
        </div>
        {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
      </div>
      {children}
    </Surface>
  );
}

function Label({ children }) {
  return (
    <p className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-gray-400 font-light">
      {children}
    </p>
  );
}

function Value({ children, className }) {
  return (
    <p
      className={cn(
        "text-[15px] md:text-[16px] text-gray-900 font-light",
        className
      )}
    >
      {children}
    </p>
  );
}

function Pill({ children, tone = "neutral" }) {
  const styles =
    tone === "gold"
      ? "bg-[#a77d3b]/10 text-[#8b6a2f] border-[#a77d3b]/20"
      : tone === "green"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : tone === "red"
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-light border",
        styles
      )}
    >
      {children}
    </span>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
  mono,
  editable,
  fieldPath,
  isAdmin,
  onUpdate,
  bookingRef,
  inputType = "text", // "text", "date", "time", "select"
  options = [], // For select type
  rawValue, // Raw value for date/time inputs
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saving, setSaving] = useState(false);

  // Initialize editValue when editing starts
  useEffect(() => {
    if (isEditing) {
      // For date/time inputs, use rawValue if available, otherwise parse from value
      if (inputType === "date" && rawValue) {
        // Convert date string to YYYY-MM-DD format
        const date = new Date(rawValue);
        if (!isNaN(date.getTime())) {
          setEditValue(date.toISOString().split("T")[0]);
        } else {
          setEditValue(value);
        }
      } else if (inputType === "time" && rawValue) {
        // Convert time string to HH:MM format
        if (typeof rawValue === "string" && rawValue.includes(":")) {
          setEditValue(rawValue.substring(0, 5)); // Get HH:MM part
        } else {
          setEditValue(value);
        }
      } else if (inputType === "select") {
        setEditValue(rawValue !== undefined ? rawValue : value);
      } else {
        setEditValue(value);
      }
    }
  }, [isEditing, value, rawValue, inputType]);

  // Fields that are direct database columns (use /booking endpoint)
  const directTableFields = [
    "contact_name",
    "contact_email",
    "contact_phone",
    "contact_company",
    "contact_kennitala",
    "preferred_datetime",
    "start_time",
    "end_time",
  ];

  // Check if this is a direct table field or a booking_data JSON field
  const isDirectTableField = directTableFields.includes(fieldPath);

  const handleSave = async () => {
    // For select, allow empty string. For others, check if value changed
    if (inputType === "select") {
      if (editValue === rawValue || (editValue === "" && !rawValue)) {
        setEditValue(value);
        setIsEditing(false);
        return;
      }
    } else {
      // Normalize both values for comparison (trim whitespace)
      const normalizedEdit = editValue?.trim() || "";
      const normalizedValue = value?.trim() || "";

      if (
        normalizedEdit === normalizedValue ||
        (!normalizedEdit && inputType !== "date" && inputType !== "time")
      ) {
        setEditValue(value);
        setIsEditing(false);
        return;
      }
    }

    setSaving(true);
    try {
      let response;

      if (isDirectTableField) {
        // Direct table column - use /booking endpoint
        // Format value based on input type
        let valueToSave = editValue;
        if (inputType === "date") {
          // For date, save as ISO string
          if (editValue) {
            const date = new Date(editValue);
            if (!isNaN(date.getTime())) {
              valueToSave = date.toISOString();
            }
          }
        } else if (inputType === "time") {
          // For time, save as HH:MM:SS format
          valueToSave = editValue ? `${editValue}:00` : editValue;
        } else if (inputType === "select") {
          // For select, use value as-is (could be boolean, string, etc.)
          valueToSave =
            editValue === "true"
              ? true
              : editValue === "false"
                ? false
                : editValue;
        } else {
          valueToSave = editValue.trim();
        }

        response = await fetch(`/api/wl/booking/${bookingRef}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [fieldPath]: valueToSave }),
        });
      } else {
        // booking_data JSON field - use /field endpoint
        // Map fieldPath to the field name in booking_data
        const fieldMap = {
          event_type: "eventType",
          preferred_datetime: "dateTime.preferred",
          start_time: "dateTime.startTime",
          end_time: "dateTime.endTime",
          needs_early_access: "needsEarlyAccess",
          setup_time: "setupTime",
          guest_count: "guestCount",
          services: "services",
          food: "food",
          "drinks.barType": "drinks.barType",
          "drinks.specialRequests": "drinks.specialRequests",
          room_setup: "roomSetup",
          notes: "notes",
          "techAndMusic.equipmentBrought": "techAndMusic.equipmentBrought",
          "tableclothData.decorationComments":
            "tableclothData.decorationComments",
        };

        const fieldKey = fieldMap[fieldPath] || fieldPath;

        response = await fetch(`/api/wl/booking/${bookingRef}/field`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            field: fieldKey,
            value: editValue.trim(),
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update");
      }

      const data = await response.json();
      if (onUpdate) {
        onUpdate(data.booking);
      }
      // Update the displayed value to reflect the saved value
      setEditValue(value);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating field:", error);
      setEditValue(value);
      alert("Villa kom upp við að uppfæra: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="mt-0.5 text-gray-400">{icon}</div>
        ) : (
          <div className="mt-0.5 w-5" />
        )}
        <div className="min-w-0 flex-1">
          <Label>{label}</Label>
          <div className="flex items-center gap-2 mt-1">
            {inputType === "select" && options.length > 0 ? (
              <select
                value={editValue ?? ""}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm md:text-[15px] border border-[#a77d3b]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/25 focus:border-[#a77d3b] bg-white"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Escape") handleCancel();
                }}
              >
                <option value="">—</option>
                {options.map((option) => (
                  <option
                    key={option.value || option}
                    value={option.value || option}
                  >
                    {option.label || option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={inputType}
                value={editValue ?? ""}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm md:text-[15px] border border-[#a77d3b]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/25 focus:border-[#a77d3b]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") handleCancel();
                }}
              />
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50"
              title="Vista"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
              title="Hætta við"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const content = (
    <div className="flex items-start gap-3 group/item">
      {icon ? (
        <div className="mt-0.5 text-gray-400">{icon}</div>
      ) : (
        <div className="mt-0.5 w-5" />
      )}
      <div className="min-w-0 flex-1">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          <Value
            className={cn(
              mono && "font-mono text-[13px] md:text-[14px]",
              href && "hover:text-[#a77d3b] transition-colors"
            )}
          >
            {value ?? "—"}
          </Value>
          {isAdmin && editable && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="opacity-0 group-hover/item:opacity-100 p-1 text-gray-400 hover:text-[#a77d3b] hover:bg-[#a77d3b]/5 rounded transition-all"
              title="Breyta"
            >
              <PencilIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (href && !isAdmin) {
    return (
      <a
        href={href}
        className="group block rounded-xl p-3 -m-3 hover:bg-gray-50/70 transition-colors"
      >
        {content}
        <div className="mt-2 h-px bg-transparent group-hover:bg-gray-100" />
      </a>
    );
  }

  return content;
}

function Note({ children, prefix = "💬" }) {
  return (
    <div className="mt-3 rounded-xl border border-gray-200/70 bg-gray-50/50 px-4 py-3">
      <p className="text-sm md:text-[15px] text-gray-700 font-light leading-relaxed">
        <span className="mr-2">{prefix}</span>
        {children}
      </p>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-gray-100/80 my-6" />;
}

/** ---------- Page ---------- */

export default function BookingDetailPage() {
  const params = useParams();
  const bookingref = params?.bookingref;

  const role = useRole();
  const isAdmin = role === "admin";
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  const { setLanguage, language } = useLanguage();
  const { t } = useTranslations();

  const [booking, setBooking] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Formatting functions that use language context
  const formatDateIS = (dateTimeString) => {
    if (!dateTimeString) return t("notSelected") || "Not selected";
    const date = new Date(dateTimeString);
    const locale = language === "en" ? "en-US" : "is-IS";
    return date.toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return t("notSelected") || "Not selected";
    if (timeString.includes(":") && timeString.length <= 5) return timeString;
    return timeString;
  };

  const formatGuestCount = (count) => {
    if (!count) return "—";
    const counts = {
      is: {
        "undir-10": "Undir 10 gestir",
        "10-25": "10–25 gestir",
        "26-50": "26–50 gestir",
        "51-75": "51–75 gestir",
        "76-100": "76–100 gestir",
        "100+": "100+ gestir",
      },
      en: {
        "undir-10": "Under 10 guests",
        "10-25": "10–25 guests",
        "26-50": "26–50 guests",
        "51-75": "51–75 guests",
        "76-100": "76–100 guests",
        "100+": "100+ guests",
      },
    };
    return counts[language]?.[count] || counts.is[count] || count;
  };

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/wl/booking/${bookingref}`);
        if (!response.ok) throw new Error("Bókun fannst ekki");
        const data = await response.json();

        // Set language from booking FIRST, before setting booking data
        // This ensures the page renders with the correct language
        if (data.booking?.language) {
          setLanguage(data.booking.language);
          // Also update URL hash to match booking language
          if (typeof window !== "undefined") {
            window.location.hash = data.booking.language;
          }
        }

        setBooking(data.booking);
        setComments(data.comments || []);
      } catch (err) {
        setError(err?.message || "Villa kom upp");
      } finally {
        setLoading(false);
      }
    };

    if (bookingref) fetchBooking();
  }, [bookingref, setLanguage]);

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  const handleCommentStatusUpdate = (updatedComment) => {
    setComments((prev) =>
      prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
    );
  };

  const handleBookingUpdate = (updatedBooking) => {
    setBooking(updatedBooking);
  };

  const bookingData = useMemo(() => {
    if (!booking) return null;

    if (booking.booking_data) {
      return {
        ...booking.booking_data,
        dateTimeComment:
          booking.booking_data.dateTimeComment ||
          booking.datetime_comment ||
          undefined,
        servicesComment:
          booking.booking_data.servicesComment ||
          booking.services_comment ||
          null,
        foodComment:
          booking.booking_data.foodComment || booking.food_comment || null,
        drinks: {
          ...(booking.booking_data.drinks || {}),
          comment:
            booking.booking_data.drinks?.comment ||
            booking.drinks_comment ||
            null,
        },
        guestCountComment:
          booking.booking_data.guestCountComment ||
          booking.guest_count_comment ||
          null,
        roomSetupComment:
          booking.booking_data.roomSetupComment ||
          booking.room_setup_comment ||
          null,
        techAndMusic:
          booking.booking_data.techAndMusic || booking.tech_and_music || null,
        tableclothData:
          booking.booking_data.tableclothData ||
          booking.tablecloth_data ||
          null,
      };
    }

    return {
      contact: {
        name: booking.contact_name,
        email: booking.contact_email,
        phone: booking.contact_phone,
        company: booking.contact_company,
        kennitala: booking.contact_kennitala,
      },
      eventType: booking.event_type,
      dateTime: {
        preferred: booking.preferred_datetime,
        startTime: booking.start_time,
        endTime: booking.end_time,
      },
      dateTimeComment: booking.datetime_comment,
      needsEarlyAccess: booking.needs_early_access,
      setupTime: booking.setup_time,
      services: booking.services || [],
      servicesComment: booking.services_comment,
      food: booking.food,
      foodDetail: booking.food_details,
      foodComment: booking.food_comment,
      drinks: booking.drinks || {},
      guestCount: booking.guest_count,
      guestCountComment: booking.guest_count_comment,
      roomSetup: booking.room_setup,
      roomSetupComment: booking.room_setup_comment,
      techAndMusic: booking.tech_and_music,
      tableclothData: booking.tablecloth_data,
      notes: booking.notes,
      staffCostAcknowledged: booking.staff_cost_acknowledged,
      noOwnAlcoholConfirmed: booking.no_own_alcohol_confirmed,
    };
  }, [booking]);

  const overview = useMemo(() => {
    if (!booking || !bookingData) return null;

    const date = formatDateIS(booking.preferred_datetime);
    const start = booking.start_time ? formatTime(booking.start_time) : null;
    const end = booking.end_time ? formatTime(booking.end_time) : null;
    const timeRange =
      start && end ? `${start} – ${end}` : start ? start : end ? end : null;

    const guest = bookingData.guestCount
      ? formatGuestCount(bookingData.guestCount)
      : null;

    const eventType = bookingData.eventType || null;

    const confirmations =
      (bookingData.staffCostAcknowledged ? 1 : 0) +
      (bookingData.noOwnAlcoholConfirmed ? 1 : 0);

    return { date, timeRange, guest, eventType, confirmations };
  }, [booking, bookingData]);

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      // TODO: replace with real endpoint
      await new Promise((resolve) => setTimeout(resolve, 900));
      setSubmitSuccess(true);
      setMessage("");
      setTimeout(() => setSubmitSuccess(false), 2800);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // no-op
    }
  };

  // Labels using translations
  const serviceLabels = {
    food: t("food"),
    drinks: t("drinks"),
    eventManager: t("eventManager") || "Event Manager",
    neither: t("neither"),
  };

  const roomSetupLabel = (v) => {
    const map = {
      is: {
        seated: "Borð — allir fá sæti við borð",
        standing: "Standandi — enginn stólar eða borð",
        mixed: "50/50 — bæði standandi og sitjandi",
        lounge: "Lounge — sófar, lágborð og opið dansgólf",
        presentation: "Kynning/Sýning — stólar í átt að sviði",
      },
      en: {
        seated: "Seated — everyone gets a seat at a table",
        standing: "Standing — no chairs or tables",
        mixed: "50/50 — both standing and seated available",
        lounge: "Lounge — sofas, coffee tables and open dance floor",
        presentation: "Presentation/Show — chairs facing the stage",
      },
    };
    return map[language]?.[v] || map.is[v] || v;
  };

  const foodLabel = (food, detail) => {
    const base =
      food === "buffet"
        ? t("buffet")
        : food === "plated"
          ? t("plated")
          : food === "fingerFood"
            ? t("fingerFood")
            : food;

    const detailMap = {
      is: {
        classic: "Classic (13.900 kr)",
        simplified: "Einfaldað (11.900 kr)",
        "3course": "3 rétta (13.900 kr pp)",
        "2course": "2 rétta (10.900 kr pp)",
        half: "Hálfur (3.900 kr)",
        full: "Heill (5.900 kr)",
      },
      en: {
        classic: "Classic (13,900 ISK)",
        simplified: "Simplified (11,900 ISK)",
        "3course": "3 courses (13,900 ISK pp)",
        "2course": "2 courses (10,900 ISK pp)",
        half: "Half (3,900 ISK)",
        full: "Full (5,900 ISK)",
      },
    };

    const details = detailMap[language] || detailMap.is;
    return detail ? `${base} — ${details[detail] || detail}` : base;
  };

  const drinksLabel = (barType) => {
    const map = {
      is: {
        openBar: "Opinn bar",
        prePurchased: "Fyrirframkeypt",
        peoplePayThemselves: "Gestir kaupa sjálfir á barnum",
      },
      en: {
        openBar: "Open bar",
        prePurchased: "Pre-purchased",
        peoplePayThemselves: "People pay themselves at the bar",
      },
    };
    return map[language]?.[barType] || map.is[barType] || barType;
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center px-4 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="w-full max-w-sm">
          <Surface className="p-7">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-[3px] border-[#a77d3b]/20 border-t-[#a77d3b] rounded-full animate-spin" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="w-5 h-5 rounded-full bg-[#a77d3b]/10" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-gray-900 font-light text-base">
                  Hleður bókun…
                </p>
                <p className="text-gray-500 font-light text-sm mt-1">
                  Augnablik — við sækjum upplýsingar
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-2 rounded-full bg-gray-100 animate-pulse"
                  style={{ animationDelay: `${i * 70}ms` }}
                />
              ))}
            </div>
          </Surface>
        </div>
      </div>
    );
  }

  if (error || !booking || !bookingData) {
    return (
      <div className="min-h-screen grid place-items-center px-4 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="w-full max-w-md">
          <Surface className="p-7">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-100 grid place-items-center text-rose-700">
                <ExclamationTriangleIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-light text-gray-900">
                  Bókun fannst ekki
                </h1>
                <p className="text-gray-600 font-light mt-2">
                  {error || "Bókun með þessu númeri fannst ekki."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="/whitelotus"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#a77d3b] text-white font-light text-sm hover:bg-[#a77d3b]/95 transition shadow-sm"
              >
                Til baka
              </a>
            </div>
          </Surface>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageFade}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-[radial-gradient(80%_40%_at_50%_0%,rgba(167,125,59,0.14),transparent_55%),linear-gradient(to_bottom,#f8fafc,white,#f8fafc)] py-6 md:py-12"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Hero / Overview */}
        <motion.div
          custom={0}
          variants={rise}
          initial="initial"
          animate="animate"
        >
          <div className="relative flex flex-col items-center text-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
            {/* Admin Indicator - Centered */}
            {isAdmin && (
              <div className="flex justify-center mb-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#a77d3b]/10 border border-[#a77d3b]/20">
                  <ShieldCheckIcon className="h-4 w-4 text-[#a77d3b]" />
                  <span className="text-xs font-medium text-[#a77d3b] uppercase tracking-wide">
                    Stjórnandi
                  </span>
                </div>
              </div>
            )}

            {/* Login Icon - Top Right */}
            {!isAdmin && !isAuthenticated && (
              <Link
                href={`/auth?callbackUrl=${encodeURIComponent(`/whitelotus/booking/${bookingref}`)}`}
                className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Innskráning"
              >
                <UserIcon className="h-5 w-5" />
              </Link>
            )}

            <div className="min-w-0 w-full px-2">
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-gray-500 font-light">
                White Lotus · Kornhlaðan
              </p>
              <h1 className="text-3xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 tracking-tight mt-1.5 sm:mt-2">
                <span className="block">{t("bookingTitle")}</span>
                <span className="block text-[#a77d3b] text-sm sm:text-base md:text-lg lg:text-xl font-mono mt-1">
                  #{booking.reference_id}
                </span>
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Layout */}
        <div className="max-w-4xl mx-auto">
          {/* Main column */}
          <div className="space-y-6 md:space-y-8">
            {/* Contact */}
            <motion.div
              custom={0.2}
              variants={rise}
              initial="initial"
              animate="animate"
            >
              <Section
                title={t("contactTitle")}
                icon={<EnvelopeIcon className="h-5 w-5" />}
                headerAction={
                  <SectionCommentButton
                    section="contact"
                    bookingRef={bookingref}
                    comments={comments}
                    userEmail={booking?.contact_email}
                    isAdmin={isAdmin}
                    onCommentAdded={handleCommentAdded}
                  />
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InfoRow
                    label={t("fullName")}
                    value={
                      booking.contact_name || bookingData?.contact?.name || "—"
                    }
                    editable={isAdmin}
                    fieldPath="contact_name"
                    isAdmin={isAdmin}
                    onUpdate={handleBookingUpdate}
                    bookingRef={bookingref}
                  />
                  <InfoRow
                    icon={<EnvelopeIcon className="h-5 w-5" />}
                    label={t("email")}
                    value={booking.contact_email || "—"}
                    href={
                      booking.contact_email
                        ? `mailto:${booking.contact_email}`
                        : undefined
                    }
                    editable={isAdmin}
                    fieldPath="contact_email"
                    isAdmin={isAdmin}
                    onUpdate={handleBookingUpdate}
                    bookingRef={bookingref}
                  />
                  <InfoRow
                    icon={<PhoneIcon className="h-5 w-5" />}
                    label={t("phone")}
                    value={booking.contact_phone || "—"}
                    href={
                      booking.contact_phone
                        ? `tel:${booking.contact_phone}`
                        : undefined
                    }
                    editable={isAdmin}
                    fieldPath="contact_phone"
                    isAdmin={isAdmin}
                    onUpdate={handleBookingUpdate}
                    bookingRef={bookingref}
                  />
                  <InfoRow
                    icon={<BuildingOfficeIcon className="h-5 w-5" />}
                    label={t("company")}
                    value={
                      booking.contact_company ||
                      bookingData?.contact?.company ||
                      "—"
                    }
                    editable={isAdmin}
                    fieldPath="contact_company"
                    isAdmin={isAdmin}
                    onUpdate={handleBookingUpdate}
                    bookingRef={bookingref}
                  />
                  <InfoRow
                    icon={<IdentificationIcon className="h-5 w-5" />}
                    label={t("kennitala")}
                    value={
                      booking.contact_kennitala ||
                      bookingData?.contact?.kennitala ||
                      "—"
                    }
                    editable={isAdmin}
                    fieldPath="contact_kennitala"
                    isAdmin={isAdmin}
                    onUpdate={handleBookingUpdate}
                    bookingRef={bookingref}
                    mono
                  />
                </div>

                {/* Comments for this section */}
                <CommentsList
                  comments={comments
                    .filter((c) => c.section === "contact")
                    .sort(
                      (a, b) => new Date(b.created_at) - new Date(a.created_at)
                    )}
                  isAdmin={isAdmin}
                  bookingRef={bookingref}
                  onStatusUpdate={handleCommentStatusUpdate}
                  AdminCommentManager={AdminCommentManager}
                />
              </Section>
            </motion.div>

            {/* Event */}
            <motion.div
              custom={0.3}
              variants={rise}
              initial="initial"
              animate="animate"
            >
              <Section
                title={t("eventInfoTitle")}
                icon={<CalendarIcon className="h-5 w-5" />}
                headerAction={
                  <SectionCommentButton
                    section="event_info"
                    bookingRef={bookingref}
                    comments={comments}
                    userEmail={booking?.contact_email}
                    isAdmin={isAdmin}
                    onCommentAdded={handleCommentAdded}
                  />
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InfoRow
                    label={t("eventType")}
                    value={bookingData.eventType || "—"}
                    editable={isAdmin}
                    fieldPath="event_type"
                    isAdmin={isAdmin}
                    onUpdate={handleBookingUpdate}
                    bookingRef={bookingref}
                  />
                  <InfoRow
                    icon={<CalendarIcon className="h-5 w-5" />}
                    label={t("preferredDate")}
                    value={formatDateIS(booking.preferred_datetime)}
                    rawValue={booking.preferred_datetime}
                    editable={isAdmin}
                    fieldPath="preferred_datetime"
                    isAdmin={isAdmin}
                    onUpdate={handleBookingUpdate}
                    bookingRef={bookingref}
                    inputType="date"
                  />
                  <InfoRow
                    icon={<ClockIcon className="h-5 w-5" />}
                    label={t("startTime")}
                    value={
                      booking.start_time ? formatTime(booking.start_time) : "—"
                    }
                    rawValue={booking.start_time}
                    editable={isAdmin}
                    fieldPath="start_time"
                    isAdmin={isAdmin}
                    onUpdate={handleBookingUpdate}
                    bookingRef={bookingref}
                    inputType="time"
                  />
                  <InfoRow
                    icon={<ClockIcon className="h-5 w-5" />}
                    label={t("endTime")}
                    value={
                      booking.end_time ? formatTime(booking.end_time) : "—"
                    }
                    rawValue={booking.end_time}
                    editable={isAdmin}
                    fieldPath="end_time"
                    isAdmin={isAdmin}
                    onUpdate={handleBookingUpdate}
                    bookingRef={bookingref}
                    inputType="time"
                  />
                  <InfoRow
                    label={t("earlyAccess")}
                    value={
                      bookingData.needsEarlyAccess === true
                        ? t("yes")
                        : bookingData.needsEarlyAccess === false
                          ? t("no")
                          : "—"
                    }
                    rawValue={bookingData.needsEarlyAccess}
                    editable={isAdmin}
                    fieldPath="needs_early_access"
                    isAdmin={isAdmin}
                    onUpdate={handleBookingUpdate}
                    bookingRef={bookingref}
                    inputType="select"
                    options={[
                      { value: "true", label: t("yes") },
                      { value: "false", label: t("no") },
                    ]}
                  />
                  <InfoRow
                    label={t("setupTime")}
                    value={bookingData.setupTime || "—"}
                    editable={isAdmin}
                    fieldPath="setup_time"
                    isAdmin={isAdmin}
                    onUpdate={handleBookingUpdate}
                    bookingRef={bookingref}
                  />
                </div>

                {bookingData.dateTimeComment ? (
                  <>
                    <Divider />
                    <Note>{bookingData.dateTimeComment}</Note>
                  </>
                ) : null}

                {/* Comments for this section */}
                <CommentsList
                  comments={comments
                    .filter((c) => c.section === "event_info")
                    .sort(
                      (a, b) => new Date(b.created_at) - new Date(a.created_at)
                    )}
                  isAdmin={isAdmin}
                  bookingRef={bookingref}
                  onStatusUpdate={handleCommentStatusUpdate}
                  AdminCommentManager={AdminCommentManager}
                />
              </Section>
            </motion.div>

            {/* Guest Count & Services - Side by Side */}
            {(bookingData.guestCount ||
              (Array.isArray(bookingData.services) &&
                bookingData.services.length > 0)) && (
              <motion.div
                custom={0.4}
                variants={rise}
                initial="initial"
                animate="animate"
              >
                <Section
                  title={
                    language === "en"
                      ? t("guestAndServiceInfo") ||
                        "Guest & Service Information"
                      : "Gestir og þjónusta"
                  }
                  icon={<UserGroupIcon className="h-5 w-5" />}
                  headerAction={
                    <SectionCommentButton
                      section="guest_count"
                      bookingRef={bookingref}
                      comments={comments}
                      userEmail={booking?.contact_email}
                      isAdmin={isAdmin}
                      onCommentAdded={handleCommentAdded}
                    />
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {bookingData.guestCount && (
                      <div>
                        <InfoRow
                          icon={<UserGroupIcon className="h-5 w-5" />}
                          label={t("howManyGuests")}
                          value={formatGuestCount(bookingData.guestCount)}
                          editable={isAdmin}
                          fieldPath="guest_count"
                          isAdmin={isAdmin}
                          onUpdate={handleBookingUpdate}
                          bookingRef={bookingref}
                        />
                        {bookingData.guestCountComment ? (
                          <Note>{bookingData.guestCountComment}</Note>
                        ) : null}
                      </div>
                    )}

                    {Array.isArray(bookingData.services) &&
                    bookingData.services.length > 0 ? (
                      <div>
                        <InfoRow
                          label={t("servicesTitle")}
                          value={bookingData.services
                            .map((s) => serviceLabels[s] || s)
                            .join(", ")}
                          editable={false}
                          fieldPath="services"
                          isAdmin={isAdmin}
                          onUpdate={handleBookingUpdate}
                          bookingRef={bookingref}
                        />
                        {bookingData.servicesComment ? (
                          <Note>{bookingData.servicesComment}</Note>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  {/* Comments for this section */}
                  <CommentsList
                    comments={comments
                      .filter(
                        (c) =>
                          c.section === "guest_count" ||
                          c.section === "services"
                      )
                      .sort(
                        (a, b) =>
                          new Date(b.created_at) - new Date(a.created_at)
                      )}
                    isAdmin={isAdmin}
                    bookingRef={bookingref}
                    onStatusUpdate={handleCommentStatusUpdate}
                    AdminCommentManager={AdminCommentManager}
                  />
                </Section>
              </motion.div>
            )}

            {/* Food Section */}
            {bookingData.food && (
              <motion.div
                custom={0.5}
                variants={rise}
                initial="initial"
                animate="animate"
              >
                <Section
                  title={t("foodTitle")}
                  icon={<QueueListIcon className="h-5 w-5" />}
                  headerAction={
                    <SectionCommentButton
                      section="food"
                      bookingRef={bookingref}
                      comments={comments}
                      userEmail={booking?.contact_email}
                      isAdmin={isAdmin}
                      onCommentAdded={handleCommentAdded}
                    />
                  }
                >
                  <InfoRow
                    label={t("foodTitle")}
                    value={foodLabel(bookingData.food, bookingData.foodDetail)}
                    editable={false}
                    fieldPath="food"
                    isAdmin={isAdmin}
                    onUpdate={handleBookingUpdate}
                    bookingRef={bookingref}
                  />
                  {bookingData.foodComment ? (
                    <Note>{bookingData.foodComment}</Note>
                  ) : null}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <EditableField
                        label={t("numberOfCourses")}
                        value={bookingData.foodNumberOfCourses}
                        fieldKey="foodNumberOfCourses"
                        bookingRef={bookingref}
                        isAdmin={isAdmin}
                        onUpdate={handleBookingUpdate}
                        pendingApproval={
                          bookingData.foodNumberOfCourses_pending_approval
                        }
                        approved={bookingData.foodNumberOfCourses_approved}
                      />
                      <EditableField
                        label={t("allergies")}
                        value={bookingData.foodAllergies}
                        fieldKey="foodAllergies"
                        bookingRef={bookingref}
                        isAdmin={isAdmin}
                        onUpdate={handleBookingUpdate}
                        pendingApproval={
                          bookingData.foodAllergies_pending_approval
                        }
                        approved={bookingData.foodAllergies_approved}
                      />
                      <EditableField
                        label={t("menu")}
                        value={bookingData.foodMenu}
                        fieldKey="foodMenu"
                        bookingRef={bookingref}
                        isAdmin={isAdmin}
                        onUpdate={handleBookingUpdate}
                        pendingApproval={bookingData.foodMenu_pending_approval}
                        approved={bookingData.foodMenu_approved}
                      />
                    </div>
                  </div>

                  {/* Comments for this section */}
                  <CommentsList
                    comments={comments
                      .filter((c) => c.section === "food")
                      .sort(
                        (a, b) =>
                          new Date(b.created_at) - new Date(a.created_at)
                      )}
                    isAdmin={isAdmin}
                    bookingRef={bookingref}
                    onStatusUpdate={handleCommentStatusUpdate}
                    AdminCommentManager={AdminCommentManager}
                  />
                </Section>
              </motion.div>
            )}

            {/* Drinks Section */}
            {bookingData.drinks?.barType && (
              <motion.div
                custom={0.6}
                variants={rise}
                initial="initial"
                animate="animate"
              >
                <Section
                  title={t("drinksTitle")}
                  icon={<BeakerIcon className="h-5 w-5" />}
                  headerAction={
                    <SectionCommentButton
                      section="drinks"
                      bookingRef={bookingref}
                      comments={comments}
                      userEmail={booking?.contact_email}
                      isAdmin={isAdmin}
                      onCommentAdded={handleCommentAdded}
                    />
                  }
                >
                  <InfoRow
                    label={t("drinksTitle")}
                    value={drinksLabel(bookingData.drinks.barType)}
                    editable={isAdmin}
                    fieldPath="drinks.barType"
                    isAdmin={isAdmin}
                    onUpdate={handleBookingUpdate}
                    bookingRef={bookingref}
                  />

                  {bookingData.drinks?.preOrder &&
                  Object.keys(bookingData.drinks.preOrder).length > 0 ? (
                    <div className="mt-4 rounded-2xl border border-gray-200/70 bg-gray-50/40 px-4 py-4">
                      <Label>{t("prePurchased")}</Label>
                      <div className="mt-2 space-y-2 text-sm text-gray-800 font-light">
                        {Object.entries(bookingData.drinks.preOrder).map(
                          ([key, quantity]) => {
                            if (!quantity || quantity <= 0) return null;

                            const labels = {
                              is: {
                                beerKeg: "Bjórkútur",
                                whiteWine: "Hvítvín",
                                redWine: "Rauðvín",
                                sparklingWine: "Freyðivín",
                              },
                              en: {
                                beerKeg: "Beer Keg",
                                whiteWine: "White Wine",
                                redWine: "Red Wine",
                                sparklingWine: "Sparkling Wine",
                              },
                            };
                            const langLabels = labels[language] || labels.is;
                            const prices = {
                              beerKeg: 80000,
                              whiteWine: 7900,
                              redWine: 7900,
                              sparklingWine: 7900,
                            };

                            const price = prices[key] ?? 0;
                            const total = price * Number(quantity);
                            const unit = key === "beerKeg" ? "kút" : "flaska";

                            return (
                              <div
                                key={key}
                                className="flex items-start justify-between gap-3"
                              >
                                <span className="text-gray-700">
                                  • {langLabels[key] || key}: {quantity}
                                </span>
                                <span className="text-gray-900">
                                  {moneyIS(price)} kr/{unit} · {moneyIS(total)}{" "}
                                  kr
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  ) : null}

                  {bookingData.drinks?.specialRequests ? (
                    <div className="mt-4">
                      <InfoRow
                        label={t("specialRequests") || "Séróskir"}
                        value={bookingData.drinks.specialRequests}
                        editable={isAdmin}
                        fieldPath="drinks.specialRequests"
                        isAdmin={isAdmin}
                        onUpdate={handleBookingUpdate}
                        bookingRef={bookingref}
                      />
                    </div>
                  ) : null}
                  {bookingData.drinks?.comment ? (
                    <Note>{bookingData.drinks.comment}</Note>
                  ) : null}

                  {/* Comments for this section */}
                  <CommentsList
                    comments={comments
                      .filter((c) => c.section === "drinks")
                      .sort(
                        (a, b) =>
                          new Date(b.created_at) - new Date(a.created_at)
                      )}
                    isAdmin={isAdmin}
                    bookingRef={bookingref}
                    onStatusUpdate={handleCommentStatusUpdate}
                    AdminCommentManager={AdminCommentManager}
                  />
                </Section>
              </motion.div>
            )}

            {/* Room Setup Section */}
            {bookingData.roomSetup && (
              <motion.div
                custom={0.7}
                variants={rise}
                initial="initial"
                animate="animate"
              >
                <Section
                  title={t("roomSetupTitle")}
                  icon={<ClipboardDocumentIcon className="h-5 w-5" />}
                  headerAction={
                    <SectionCommentButton
                      section="room_setup"
                      bookingRef={bookingref}
                      comments={comments}
                      userEmail={booking?.contact_email}
                      isAdmin={isAdmin}
                      onCommentAdded={handleCommentAdded}
                    />
                  }
                >
                  <InfoRow
                    label={t("roomSetupTitle")}
                    value={roomSetupLabel(bookingData.roomSetup)}
                    editable={isAdmin}
                    fieldPath="room_setup"
                    isAdmin={isAdmin}
                    onUpdate={handleBookingUpdate}
                    bookingRef={bookingref}
                  />
                  {bookingData.roomSetupComment ? (
                    <Note>{bookingData.roomSetupComment}</Note>
                  ) : null}

                  {/* Table Settings & Decorations */}
                  {bookingData.tableclothData && (
                    <>
                      <Divider />
                      <div className="rounded-2xl border border-gray-200/70 bg-white/50 px-4 py-4">
                        <div className="mb-3">
                          <Label>{t("tableclothTitle")}</Label>
                        </div>
                        <div className="mt-3 space-y-2 text-sm md:text-[15px] text-gray-900 font-light">
                          {typeof bookingData.tableclothData
                            .wantsToRentTablecloths === "boolean" ? (
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-500">
                                {t("tableclothLabel")}
                              </span>
                              <span>
                                {bookingData.tableclothData
                                  .wantsToRentTablecloths
                                  ? bookingData.tableclothData
                                      .tableclothColor === "white"
                                    ? t("whiteTablecloths")
                                    : bookingData.tableclothData
                                          .tableclothColor === "black"
                                      ? t("blackTablecloths")
                                      : t("rent") ||
                                        (language === "en" ? "Rent" : "Leigja")
                                  : t("notRenting")}
                              </span>
                            </div>
                          ) : null}
                          {typeof bookingData.tableclothData.needsNapkins ===
                          "boolean" ? (
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-500">
                                {t("needsNapkins") || "Servéttur"}
                              </span>
                              <span>
                                {bookingData.tableclothData.needsNapkins
                                  ? t("yes")
                                  : t("no")}
                              </span>
                            </div>
                          ) : null}
                          {typeof bookingData.tableclothData.needsCandles ===
                          "boolean" ? (
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-500">
                                {t("needsCandles") || "Kerti"}
                              </span>
                              <span>
                                {bookingData.tableclothData.needsCandles
                                  ? t("yes")
                                  : t("no")}
                              </span>
                            </div>
                          ) : null}
                        </div>

                        {bookingData.tableclothData.decorationComments ? (
                          <div className="mt-4">
                            <InfoRow
                              label="Athugasemdir"
                              value={
                                bookingData.tableclothData.decorationComments
                              }
                              editable={isAdmin}
                              fieldPath="tableclothData.decorationComments"
                              isAdmin={isAdmin}
                              onUpdate={handleBookingUpdate}
                              bookingRef={bookingref}
                            />
                          </div>
                        ) : null}
                      </div>
                    </>
                  )}

                  {/* Comments for this section */}
                  <CommentsList
                    comments={comments
                      .filter(
                        (c) =>
                          c.section === "room_setup" ||
                          c.section === "tablecloth"
                      )
                      .sort(
                        (a, b) =>
                          new Date(b.created_at) - new Date(a.created_at)
                      )}
                    isAdmin={isAdmin}
                    bookingRef={bookingref}
                    onStatusUpdate={handleCommentStatusUpdate}
                    AdminCommentManager={AdminCommentManager}
                  />
                </Section>
              </motion.div>
            )}

            {/* Tech and Music Section */}
            {bookingData.techAndMusic && (
              <motion.div
                custom={0.8}
                variants={rise}
                initial="initial"
                animate="animate"
              >
                <Section
                  title={t("techTitle")}
                  icon={<SpeakerWaveIcon className="h-5 w-5" />}
                  headerAction={
                    <SectionCommentButton
                      section="tech_and_music"
                      bookingRef={bookingref}
                      comments={comments}
                      userEmail={booking?.contact_email}
                      isAdmin={isAdmin}
                      onCommentAdded={handleCommentAdded}
                    />
                  }
                >
                  <div className="rounded-2xl border border-gray-200/70 bg-gray-50/35 px-4 py-4">
                    <div className="mt-3 space-y-3 text-sm md:text-[15px] text-gray-900 font-light">
                      {bookingData.techAndMusic.djOnSite !== undefined ? (
                        <div className="flex items-center gap-2">
                          {bookingData.techAndMusic.djOnSite === true ? (
                            <CheckIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                          ) : bookingData.techAndMusic.djOnSite === false ? (
                            <XMarkIcon className="h-5 w-5 text-rose-500 flex-shrink-0" />
                          ) : (
                            <QuestionMarkCircleIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          )}
                          <span className="text-gray-500">
                            {t("djOnSiteLabel").replace(":", "")}
                          </span>
                        </div>
                      ) : null}
                      {bookingData.techAndMusic.djOnSite === true &&
                      bookingData.techAndMusic.djBringsOwnController !==
                        undefined &&
                      bookingData.techAndMusic.djBringsOwnController !==
                        null ? (
                        <div className="flex items-center gap-2">
                          {bookingData.techAndMusic.djBringsOwnController ===
                          true ? (
                            <CheckIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                          ) : bookingData.techAndMusic.djBringsOwnController ===
                            false ? (
                            <XMarkIcon className="h-5 w-5 text-rose-500 flex-shrink-0" />
                          ) : (
                            <QuestionMarkCircleIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          )}
                          <span className="text-gray-500">
                            {t("djBringsControllerLabel").replace(":", "")}
                          </span>
                        </div>
                      ) : null}
                      {bookingData.techAndMusic.needsMicrophone !==
                      undefined ? (
                        <div className="flex items-center gap-2">
                          {bookingData.techAndMusic.needsMicrophone === true ? (
                            <CheckIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                          ) : bookingData.techAndMusic.needsMicrophone ===
                            false ? (
                            <XMarkIcon className="h-5 w-5 text-rose-500 flex-shrink-0" />
                          ) : (
                            <QuestionMarkCircleIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          )}
                          <span className="text-gray-500">
                            {t("needsMicrophoneLabel").replace(":", "")}
                          </span>
                        </div>
                      ) : null}
                      {bookingData.techAndMusic.liveBand !== undefined ? (
                        <div className="flex items-center gap-2">
                          {bookingData.techAndMusic.liveBand === true ? (
                            <CheckIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                          ) : bookingData.techAndMusic.liveBand === false ? (
                            <XMarkIcon className="h-5 w-5 text-rose-500 flex-shrink-0" />
                          ) : (
                            <QuestionMarkCircleIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          )}
                          <span className="text-gray-500">
                            {t("liveBandLabel").replace(":", "")}
                          </span>
                        </div>
                      ) : null}
                      {bookingData.techAndMusic.useProjector !== undefined ? (
                        <div className="flex items-center gap-2">
                          {bookingData.techAndMusic.useProjector === true ? (
                            <CheckIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                          ) : bookingData.techAndMusic.useProjector ===
                            false ? (
                            <XMarkIcon className="h-5 w-5 text-rose-500 flex-shrink-0" />
                          ) : (
                            <QuestionMarkCircleIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          )}
                          <span className="text-gray-500">
                            {t("useProjectorLabel").replace(":", "")}
                          </span>
                        </div>
                      ) : null}
                      {bookingData.techAndMusic.useLightsAndDiscoBall !==
                      undefined ? (
                        <div className="flex items-center gap-2">
                          {bookingData.techAndMusic.useLightsAndDiscoBall ===
                          true ? (
                            <CheckIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                          ) : bookingData.techAndMusic.useLightsAndDiscoBall ===
                            false ? (
                            <XMarkIcon className="h-5 w-5 text-rose-500 flex-shrink-0" />
                          ) : (
                            <QuestionMarkCircleIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          )}
                          <span className="text-gray-500">
                            {t("useLightsLabel").replace(":", "")}
                          </span>
                        </div>
                      ) : null}
                      {bookingData.techAndMusic.equipmentBrought ? (
                        <div className="mt-3">
                          <InfoRow
                            label={t("equipmentBroughtLabel")}
                            value={bookingData.techAndMusic.equipmentBrought}
                            editable={isAdmin}
                            fieldPath="techAndMusic.equipmentBrought"
                            isAdmin={isAdmin}
                            onUpdate={handleBookingUpdate}
                            bookingRef={bookingref}
                          />
                        </div>
                      ) : null}
                    </div>

                    {bookingData.techAndMusic.comment ? (
                      <Note>{bookingData.techAndMusic.comment}</Note>
                    ) : null}
                  </div>

                  {/* Comments for this section */}
                  <CommentsList
                    comments={comments
                      .filter((c) => c.section === "tech_and_music")
                      .sort(
                        (a, b) =>
                          new Date(b.created_at) - new Date(a.created_at)
                      )}
                    isAdmin={isAdmin}
                    bookingRef={bookingref}
                    onStatusUpdate={handleCommentStatusUpdate}
                    AdminCommentManager={AdminCommentManager}
                  />
                </Section>
              </motion.div>
            )}

            {/* Notes */}
            {bookingData.notes && (
              <motion.div
                custom={1.0}
                variants={rise}
                initial="initial"
                animate="animate"
              >
                <Section
                  title={t("notes")}
                  icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
                  headerAction={
                    <SectionCommentButton
                      section="notes"
                      bookingRef={bookingref}
                      comments={comments}
                      userEmail={booking?.contact_email}
                      isAdmin={isAdmin}
                      onCommentAdded={handleCommentAdded}
                    />
                  }
                >
                  <InfoRow
                    label={t("notes")}
                    value={bookingData.notes}
                    editable={isAdmin}
                    fieldPath="notes"
                    isAdmin={isAdmin}
                    onUpdate={handleBookingUpdate}
                    bookingRef={bookingref}
                  />

                  {/* Comments for this section */}
                  <CommentsList
                    comments={comments
                      .filter((c) => c.section === "notes")
                      .sort(
                        (a, b) =>
                          new Date(b.created_at) - new Date(a.created_at)
                      )}
                    isAdmin={isAdmin}
                    bookingRef={bookingref}
                    onStatusUpdate={handleCommentStatusUpdate}
                    AdminCommentManager={AdminCommentManager}
                  />
                </Section>
              </motion.div>
            )}

            {/* Message (guest) */}
            {!isAdmin && (
              <motion.div
                custom={1.0}
                variants={rise}
                initial="initial"
                animate="animate"
              >
                <Section
                  title="Senda skilaboð"
                  icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
                >
                  <AnimatePresence>
                    {submitSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
                      >
                        <p className="text-emerald-700 font-light text-sm">
                          Skilaboðin hafa verið send ✨
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleMessageSubmit} className="space-y-4">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ef eitthvað þarf að breyta eða þú hefur spurningar, skrifaðu hér..."
                      rows={4}
                      className="w-full rounded-2xl border border-gray-200/70 bg-white/70 px-4 py-3 text-sm font-light text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/25 focus:border-[#a77d3b]/35 transition resize-none"
                      required
                    />

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 font-light">
                        Við svörum eins fljótt og við getum.
                      </p>
                      <button
                        type="submit"
                        disabled={submitting || !message.trim()}
                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#a77d3b] text-white font-light text-sm hover:bg-[#a77d3b]/95 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                      >
                        {submitting ? "Sendi…" : "Senda skilaboð"}
                      </button>
                    </div>
                  </form>
                </Section>
              </motion.div>
            )}

            {/* Confirmations - Subtle at bottom */}
            {(bookingData.staffCostAcknowledged ||
              bookingData.noOwnAlcoholConfirmed) && (
              <motion.div
                custom={1.1}
                variants={rise}
                initial="initial"
                animate="animate"
              >
                <Section
                  title={t("confirmations") || "Staðfestingar"}
                  icon={<CheckCircleIcon className="h-4 w-4" />}
                  extraSubtle
                >
                  <div className="space-y-2 text-sm text-gray-500 font-light text-center">
                    {bookingData.staffCostAcknowledged ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-gray-400">✓</span>
                        <span>{t("staffCostConfirmed")}</span>
                      </div>
                    ) : null}
                    {bookingData.noOwnAlcoholConfirmed ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-gray-400">✓</span>
                        <span>{t("alcoholRuleConfirmed")}</span>
                      </div>
                    ) : null}
                  </div>
                </Section>
              </motion.div>
            )}
          </div>
        </div>

        {/* Mobile bottom actions */}
        {!isAdmin ? (
          <div className="lg:hidden mt-8">
            <Surface className="p-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(String(booking.reference_id))}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-white/70 hover:bg-white transition text-sm font-light"
                  type="button"
                >
                  <ClipboardDocumentIcon className="h-5 w-5 text-gray-500" />
                  Afrita nr.
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-white/70 hover:bg-white transition text-sm font-light"
                  type="button"
                >
                  <PrinterIcon className="h-5 w-5 text-gray-500" />
                  Prenta
                </button>
              </div>
            </Surface>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
