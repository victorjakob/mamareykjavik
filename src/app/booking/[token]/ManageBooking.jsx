"use client";

import { useEffect, useState } from "react";

/**
 * A guest's own booking, opened from the link in their email.
 *
 * No account and no sign-in: the token in the URL is the whole key. So the
 * page shows one booking, offers the two things a guest actually wants — move
 * it, or call it off — and nothing else.
 */

const COPY = {
  en: {
    loading: "Finding your booking…",
    notFound: "We could not find that booking. The link may have expired, or been used to cancel already.",
    title: "Your table at Mama",
    ref: "Reference",
    when: "When",
    people: "People",
    people_n: (n) => (n === 1 ? "1 person" : `${n} people`),
    change: "Change this booking",
    cancelled: "This booking is cancelled.",
    seated: "You have already dined with us — thank you.",
    saveBtn: "Save the change",
    saving: "Saving…",
    cancelBtn: "Cancel the booking",
    cancelAsk: "Cancel this booking? We cannot undo it from here.",
    date: "Day",
    time: "Time",
    party: "How many",
    taken: "Nothing free then, sorry. Try another time.",
    tooLarge: (n) => `For more than ${n}, please ring us on +354 788 0808.`,
    closed: "We are not open then.",
    failed: "Something went wrong. Please ring us on +354 788 0808.",
    saved: "Changed. We have your table.",
    goneBye: "Cancelled. We hope to see you another time.",
    note: "Anything else, ring us on +354 788 0808.",
  },
  is: {
    loading: "Sæki bókunina þína…",
    notFound: "Við fundum ekki þessa bókun. Hlekkurinn gæti verið útrunninn, eða þegar notaður til að afbóka.",
    title: "Borðið þitt á Mama",
    ref: "Bókunarnúmer",
    when: "Hvenær",
    people: "Fjöldi",
    people_n: (n) => (n === 1 ? "1 gestur" : `${n} gestir`),
    change: "Breyta bókuninni",
    cancelled: "Þessi bókun hefur verið afbókuð.",
    seated: "Þú hefur þegar borðað hjá okkur — takk fyrir.",
    saveBtn: "Vista breytinguna",
    saving: "Vista…",
    cancelBtn: "Afbóka",
    cancelAsk: "Afbóka þessa bókun? Við getum ekki afturkallað það héðan.",
    date: "Dagur",
    time: "Tími",
    party: "Hversu mörg",
    taken: "Ekkert laust þá. Prófaðu annan tíma.",
    tooLarge: (n) => `Fyrir fleiri en ${n} skaltu hringja í +354 788 0808.`,
    closed: "Við erum ekki opin þá.",
    failed: "Eitthvað fór úrskeiðis. Hringdu í +354 788 0808.",
    saved: "Breytt. Borðið er þitt.",
    goneBye: "Afbókað. Vonum að sjást síðar.",
    note: "Annað? Hringdu í +354 788 0808.",
  },
};

const todayIso = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

export default function ManageBooking({ token }) {
  const [booking, setBooking] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | notFound | cancelled
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [party, setParty] = useState(2);
  const [slots, setSlots] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const lang = booking?.language === "is" ? "is" : "en";
  const t = COPY[lang];

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/restaurant/manage?token=${token}`);
        if (!res.ok) return setState("notFound");
        const { booking: b } = await res.json();
        setBooking(b);
        setDate(b.booking_date);
        setTime(String(b.booking_time).slice(0, 5));
        setParty(b.party);
        setState("ready");
      } catch {
        setState("notFound");
      }
    })();
  }, [token]);

  // The times on offer depend on the day and the number, so they follow both.
  useEffect(() => {
    if (!editing || !date) return;
    (async () => {
      try {
        const res = await fetch(`/api/restaurant/availability?date=${date}&party=${party}`);
        const data = await res.json();
        setSlots((data.slots ?? []).filter((s) => s.free));
      } catch {
        setSlots([]);
      }
    })();
  }, [editing, date, party]);

  const save = async () => {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/restaurant/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, date, time, party }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(
          data.error === "taken" ? t.taken
            : data.error === "tooLarge" ? t.tooLarge(data.onlinePartyLimit)
            : data.error === "closed" ? t.closed
            : t.failed
        );
        return;
      }
      setBooking(data.booking);
      setEditing(false);
      setMessage(t.saved);
    } catch {
      setMessage(t.failed);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!window.confirm(t.cancelAsk)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/restaurant/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, cancel: true }),
      });
      if (res.ok) setState("cancelled");
      else setMessage(t.failed);
    } catch {
      setMessage(t.failed);
    } finally {
      setBusy(false);
    }
  };

  if (state === "loading") {
    return <p className="mx-auto max-w-xl px-4 py-24 text-center opacity-60">{COPY.en.loading}</p>;
  }
  if (state === "notFound") {
    return <p className="mx-auto max-w-xl px-4 py-24 text-center">{COPY.en.notFound}</p>;
  }
  if (state === "cancelled") {
    return <p className="mx-auto max-w-xl px-4 py-24 text-center text-xl">{t.goneBye}</p>;
  }

  const pretty = new Date(`${booking.booking_date}T12:00:00`).toLocaleDateString(
    lang === "is" ? "is-IS" : "en-GB",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );
  const done = ["cancelled", "seated", "no_show"].includes(booking.status);

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-semibold">{t.title}</h1>

      <div className="mb-6 rounded-2xl bg-black/5 p-6">
        <div className="mb-4">
          <div className="text-sm uppercase tracking-wide opacity-60">{t.ref}</div>
          <div className="font-mono text-2xl font-semibold">{booking.reference_id}</div>
        </div>
        <div className="mb-2">
          <div className="text-sm uppercase tracking-wide opacity-60">{t.when}</div>
          <div className="text-lg">
            {pretty} · {String(booking.booking_time).slice(0, 5)}
          </div>
        </div>
        <div>
          <div className="text-sm uppercase tracking-wide opacity-60">{t.people}</div>
          <div className="text-lg">{t.people_n(booking.party)}</div>
        </div>
      </div>

      {message && <p className="mb-6 rounded-xl bg-black/5 p-4">{message}</p>}

      {booking.status === "cancelled" ? (
        <p className="opacity-70">{t.cancelled}</p>
      ) : booking.status === "seated" ? (
        <p className="opacity-70">{t.seated}</p>
      ) : done ? null : !editing ? (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setEditing(true)}
            className="min-h-12 rounded-xl bg-primary-green px-6 py-3 text-lg text-white"
          >
            {t.change}
          </button>
          <button
            onClick={cancel}
            disabled={busy}
            className="min-h-12 rounded-xl bg-black/5 px-6 py-3 text-lg"
          >
            {t.cancelBtn}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block font-medium">{t.date}</span>
            <input
              type="date"
              value={date}
              min={todayIso()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-black/15 px-4 py-3 text-lg"
            />
          </label>

          <div>
            <span className="mb-2 block font-medium">{t.party}</span>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setParty(n)}
                  className={`min-h-11 min-w-11 rounded-xl px-4 text-lg ${
                    party === n ? "bg-primary-green text-white" : "bg-black/5"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block font-medium">{t.time}</span>
            <div className="flex flex-wrap gap-2">
              {slots.length === 0 ? (
                <p className="rounded-xl bg-black/5 p-4">{t.taken}</p>
              ) : (
                slots.map((s) => (
                  <button
                    key={s.time}
                    onClick={() => setTime(s.time)}
                    className={`min-h-11 rounded-xl px-4 text-lg ${
                      time === s.time ? "bg-primary-green text-white" : "bg-black/5"
                    }`}
                  >
                    {s.time}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={save}
              disabled={busy || !time}
              className="min-h-12 flex-1 rounded-xl bg-primary-green px-6 py-3 text-lg text-white disabled:bg-black/10 disabled:text-black/40"
            >
              {busy ? t.saving : t.saveBtn}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="min-h-12 rounded-xl bg-black/5 px-6 py-3 text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <p className="mt-10 text-sm opacity-60">{t.note}</p>
    </div>
  );
}
