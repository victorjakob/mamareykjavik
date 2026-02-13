"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY_PREFIX = "wl-admin-booking-draft:";

function toDateInputValue(iso) {
  if (!iso) return "";
  const s = String(iso).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function buildPreferredLiteral(date, startTime) {
  if (!date || !startTime) return null;
  const time = startTime.length === 5 ? `${startTime}:00` : startTime;
  return `${date}T${time}`;
}

function normalizePhone(v) {
  return (v || "").trim();
}

export default function useAdminBookingForm(initialBooking, mode, bookingRef, onSaved) {
  const router = useRouter();
  const storageKey = useMemo(() => {
    if (mode === "edit" && bookingRef) return `${STORAGE_KEY_PREFIX}${bookingRef}`;
    return `${STORAGE_KEY_PREFIX}new`;
  }, [mode, bookingRef]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedRef, setSavedRef] = useState(mode === "edit" ? bookingRef : "");

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventNameOrCompany, setEventNameOrCompany] = useState("");
  const [eventType, setEventType] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactComment, setContactComment] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [staffNeeded, setStaffNeeded] = useState("");
  const [guestStaffComment, setGuestStaffComment] = useState("");
  const [endTimePolicy, setEndTimePolicy] = useState("unsure");
  const [latestExitTime, setLatestExitTime] = useState("");
  const [extraContacts, setExtraContacts] = useState([]);
  const [hasDrinks, setHasDrinks] = useState(false);
  const [drinksPrepaid, setDrinksPrepaid] = useState("");
  const [drinksAvailable, setDrinksAvailable] = useState("");
  const [preDrinksPlan, setPreDrinksPlan] = useState("");
  const [bringingOwnItems, setBringingOwnItems] = useState("");
  const [hasFood, setHasFood] = useState(false);
  const [foodSelection, setFoodSelection] = useState("");
  const [foodMenu, setFoodMenu] = useState("");
  const [peopleCount, setPeopleCount] = useState("");
  const [allergiesSummary, setAllergiesSummary] = useState("");
  const [foodOther, setFoodOther] = useState("");
  const [chefName, setChefName] = useState("");
  const [chefPhone, setChefPhone] = useState("");
  const [spaceSetup, setSpaceSetup] = useState("mixed");
  const [tableStyleNotes, setTableStyleNotes] = useState("");
  const [musicianOrDJ, setMusicianOrDJ] = useState("");
  const [techNotes, setTechNotes] = useState("");
  const [soundsystemCheck, setSoundsystemCheck] = useState(false);
  const [lightsDiscoCheck, setLightsDiscoCheck] = useState(false);
  const [projectorCheck, setProjectorCheck] = useState(false);

  useEffect(() => {
    if (!initialBooking) return;
    const bd = initialBooking.booking_data || {};
    const preferred = initialBooking.preferred_datetime || bd?.dateTime?.preferred;
    setDate(toDateInputValue(preferred));
    setStartTime(initialBooking.start_time || bd?.dateTime?.startTime || "");
    setEndTime(initialBooking.end_time || bd?.dateTime?.endTime || "");
    setContactName(initialBooking.contact_name || bd?.contact?.name || "");
    setContactPhone(initialBooking.contact_phone || bd?.contact?.phone || "");
    setContactComment(bd?.adminOps?.contactComment || "");
    setGuestCount(bd?.guestCount || initialBooking.guest_count || "");
    const ops = bd.adminOps || {};
    setEventNameOrCompany(ops.eventNameOrCompany || "");
    setEventType(ops.eventType || "");
    setEndTimePolicy(
      ops.endTimePolicy ||
        (ops.endTimeIsHardCutoff === true ? "hardCutoff" : ops.canStayLate === true ? "canStayLate" : "unsure")
    );
    setLatestExitTime(ops.lateExitLatestTime || "");
    setStaffNeeded(ops.staffNeeded || "");
    setGuestStaffComment(ops.guestStaffComment || "");
    setExtraContacts(Array.isArray(ops.extraContacts) ? ops.extraContacts : []);
    const anyDrinks =
      ops.drinksPrepaidSummary ||
      ops.drinksToHaveAvailable ||
      ops.preDrinksPlan ||
      ops.bringingOwnItems;
    setHasDrinks(!!anyDrinks);
    setDrinksPrepaid(ops.drinksPrepaidSummary || "");
    setDrinksAvailable(ops.drinksToHaveAvailable || "");
    setPreDrinksPlan(ops.preDrinksPlan || "");
    setBringingOwnItems(ops.bringingOwnItems || "");
    const anyFood =
      ops.foodSelection ||
      ops.foodMenu ||
      ops.numberOfPeople ||
      ops.allergiesSummary ||
      ops.foodOther ||
      ops.chefName ||
      ops.chefPhone;
    setHasFood(!!anyFood);
    setFoodSelection(ops.foodSelection || "");
    setFoodMenu(ops.foodMenu || "");
    setPeopleCount(ops.numberOfPeople || "");
    setAllergiesSummary(ops.allergiesSummary || "");
    setFoodOther(ops.foodOther || "");
    setChefName(ops.chefName || "");
    setChefPhone(ops.chefPhone || "");
    setSpaceSetup(ops.setupStyle || "mixed");
    setTableStyleNotes(ops.tableStyleNotes || "");
    setMusicianOrDJ(ops.musicianOrDJ || "");
    setTechNotes(ops.techNotes || "");
    setSoundsystemCheck(!!ops.soundsystemCheck);
    setLightsDiscoCheck(!!ops.lightsDiscoCheck);
    setProjectorCheck(!!ops.projectorCheck);
  }, [initialBooking]);

  useEffect(() => {
    if (mode !== "edit" || !bookingRef) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const draft = JSON.parse(raw);
      setDate(draft.date || "");
      setStartTime(draft.startTime || "");
      setEndTime(draft.endTime || "");
      setEventNameOrCompany(draft.eventNameOrCompany || "");
      setEventType(draft.eventType || "");
      setContactName(draft.contactName || "");
      setContactPhone(draft.contactPhone || "");
      setContactComment(draft.contactComment || "");
      setGuestCount(draft.guestCount || "");
      setStaffNeeded(draft.staffNeeded || "");
      setGuestStaffComment(draft.guestStaffComment || "");
      setEndTimePolicy(draft.endTimePolicy || "unsure");
      setLatestExitTime(draft.latestExitTime || "");
      setExtraContacts(Array.isArray(draft.extraContacts) ? draft.extraContacts : []);
      setHasDrinks(!!draft.hasDrinks);
      setDrinksPrepaid(draft.drinksPrepaid || "");
      setDrinksAvailable(draft.drinksAvailable || "");
      setPreDrinksPlan(draft.preDrinksPlan || "");
      setBringingOwnItems(draft.bringingOwnItems || "");
      setHasFood(!!draft.hasFood);
      setFoodSelection(draft.foodSelection || "");
      setFoodMenu(draft.foodMenu || "");
      setPeopleCount(draft.peopleCount || "");
      setAllergiesSummary(draft.allergiesSummary || "");
      setFoodOther(draft.foodOther || "");
      setChefName(draft.chefName || "");
      setChefPhone(draft.chefPhone || "");
      setSpaceSetup(draft.spaceSetup || "mixed");
      setTableStyleNotes(draft.tableStyleNotes || "");
      setMusicianOrDJ(draft.musicianOrDJ || "");
      setTechNotes(draft.techNotes || "");
      setSoundsystemCheck(!!draft.soundsystemCheck);
      setLightsDiscoCheck(!!draft.lightsDiscoCheck);
      setProjectorCheck(!!draft.projectorCheck);
    } catch {
      // ignore
    }
  }, [storageKey, mode, bookingRef]);

  useEffect(() => {
    const draft = {
      date,
      startTime,
      endTime,
      eventNameOrCompany,
      eventType,
      contactName,
      contactPhone,
      contactComment,
      guestCount,
      staffNeeded,
      guestStaffComment,
      endTimePolicy,
      latestExitTime,
      extraContacts,
      hasDrinks,
      drinksPrepaid,
      drinksAvailable,
      preDrinksPlan,
      bringingOwnItems,
      hasFood,
      foodSelection,
      foodMenu,
      peopleCount,
      allergiesSummary,
      foodOther,
      chefName,
      chefPhone,
      spaceSetup,
      tableStyleNotes,
      musicianOrDJ,
      techNotes,
      soundsystemCheck,
      lightsDiscoCheck,
      projectorCheck,
    };
    const id = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(draft));
      } catch {
        // ignore
      }
    }, 250);
    return () => clearTimeout(id);
  }, [
    storageKey,
    date,
    startTime,
    endTime,
    eventNameOrCompany,
    eventType,
    contactName,
    contactPhone,
    contactComment,
    guestCount,
    staffNeeded,
    guestStaffComment,
    endTimePolicy,
    latestExitTime,
    extraContacts,
    drinksPrepaid,
    drinksAvailable,
    preDrinksPlan,
    bringingOwnItems,
    hasFood,
    foodSelection,
    foodMenu,
    peopleCount,
    allergiesSummary,
    foodOther,
    chefName,
    chefPhone,
    spaceSetup,
    tableStyleNotes,
    musicianOrDJ,
    techNotes,
  ]);

  const buildPayload = useCallback(() => {
    const preferred = buildPreferredLiteral(date, startTime);
    const derivedHardCutoff = endTimePolicy === "hardCutoff";
    const derivedCanStayLate = endTimePolicy === "canStayLate";
    return {
      contact: {
        name: contactName.trim(),
        phone: normalizePhone(contactPhone),
        email: "",
      },
      dateTime: {
        preferred,
        startTime,
        endTime,
      },
      guestCount: guestCount.trim(),
      roomSetup: spaceSetup,
      booking_data_admin_only: false,
      adminOps: {
        endTimePolicy,
        endTimeIsHardCutoff: endTimePolicy === "unsure" ? null : derivedHardCutoff,
        canStayLate: endTimePolicy === "unsure" ? null : derivedCanStayLate,
        lateExitLatestTime: latestExitTime || "",
        staffNeeded: staffNeeded.trim(),
        guestStaffComment: guestStaffComment || "",
        contactComment: contactComment || "",
        eventNameOrCompany: eventNameOrCompany || "",
        eventType: eventType || "",
        extraContacts,
        hasDrinks,
        drinksPrepaidSummary: drinksPrepaid || "",
        drinksToHaveAvailable: drinksAvailable || "",
        preDrinksPlan: preDrinksPlan || "",
        bringingOwnItems: bringingOwnItems || "",
        foodSelection: foodSelection || "",
        foodMenu: foodMenu || "",
        chefName: chefName || "",
        chefPhone: chefPhone || "",
        allergiesSummary: allergiesSummary || "",
        numberOfPeople: peopleCount || "",
        foodOther: foodOther || "",
        setupStyle: spaceSetup || "mixed",
        tableStyleNotes: tableStyleNotes || "",
        musicianOrDJ: musicianOrDJ || "",
        techNotes: techNotes || "",
        soundsystemCheck,
        lightsDiscoCheck,
        projectorCheck,
      },
    };
  }, [
    date,
    startTime,
    endTime,
    eventNameOrCompany,
    eventType,
    contactName,
    contactPhone,
    contactComment,
    guestCount,
    staffNeeded,
    guestStaffComment,
    endTimePolicy,
    latestExitTime,
    extraContacts,
    hasDrinks,
    drinksPrepaid,
    drinksAvailable,
    preDrinksPlan,
    bringingOwnItems,
    foodSelection,
    foodMenu,
    chefName,
    chefPhone,
    allergiesSummary,
    peopleCount,
    foodOther,
    spaceSetup,
    tableStyleNotes,
    musicianOrDJ,
    techNotes,
    soundsystemCheck,
    lightsDiscoCheck,
    projectorCheck,
  ]);

  const handleSave = useCallback(async () => {
    setSaveError("");
    setSaving(true);
    try {
      const payload = buildPayload();
      if (mode === "create") {
        const res = await fetch("/api/admin/wl-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to create booking");
        const ref = data?.reference_id;
        setSavedRef(ref);
        try {
          localStorage.removeItem(storageKey);
        } catch {}
        router.push(`/whitelotus/booking/admin/${ref}`);
        return;
      }
      const res = await fetch(`/api/admin/wl-booking/${bookingRef}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update booking");
      setSavedRef(bookingRef);
      onSaved?.();
    } catch (e) {
      setSaveError(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [mode, bookingRef, buildPayload, storageKey, router, onSaved]);

  const handoverCompleteness = useMemo(() => {
    const recommended = [
      { key: "date", ok: !!date },
      { key: "startTime", ok: !!startTime },
      { key: "endTime", ok: !!endTime },
      { key: "contactName", ok: !!contactName.trim() },
      { key: "contactPhone", ok: !!normalizePhone(contactPhone) },
      { key: "guestCount", ok: !!guestCount.trim() },
      { key: "staffNeeded", ok: !!staffNeeded.trim() },
    ];
    const done = recommended.filter((r) => r.ok).length;
    return { done, total: recommended.length };
  }, [date, startTime, endTime, contactName, contactPhone, guestCount, staffNeeded]);

  return {
    // state
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    eventNameOrCompany,
    setEventNameOrCompany,
    eventType,
    setEventType,
    contactName,
    setContactName,
    contactPhone,
    setContactPhone,
    contactComment,
    setContactComment,
    guestCount,
    setGuestCount,
    staffNeeded,
    setStaffNeeded,
    guestStaffComment,
    setGuestStaffComment,
    endTimePolicy,
    setEndTimePolicy,
    latestExitTime,
    setLatestExitTime,
    extraContacts,
    setExtraContacts,
    hasDrinks,
    setHasDrinks,
    drinksPrepaid,
    setDrinksPrepaid,
    drinksAvailable,
    setDrinksAvailable,
    preDrinksPlan,
    setPreDrinksPlan,
    bringingOwnItems,
    setBringingOwnItems,
    hasFood,
    setHasFood,
    foodSelection,
    setFoodSelection,
    foodMenu,
    setFoodMenu,
    peopleCount,
    setPeopleCount,
    allergiesSummary,
    setAllergiesSummary,
    foodOther,
    setFoodOther,
    chefName,
    setChefName,
    chefPhone,
    setChefPhone,
    spaceSetup,
    setSpaceSetup,
    tableStyleNotes,
    setTableStyleNotes,
    musicianOrDJ,
    setMusicianOrDJ,
    techNotes,
    setTechNotes,
    soundsystemCheck,
    setSoundsystemCheck,
    lightsDiscoCheck,
    setLightsDiscoCheck,
    projectorCheck,
    setProjectorCheck,
    // actions & status
    buildPayload,
    handleSave,
    saving,
    saveError,
    setSaveError,
    savedRef,
    handoverCompleteness,
    storageKey,
  };
}
