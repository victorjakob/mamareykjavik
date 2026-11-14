"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Booking a table at Mama, on mama.is.
 *
 * Deliberately three steps, in the order a person actually decides: the day,
 * how many of them, then a time — because the times on offer depend on the
 * first two. Asking for a name before knowing a table exists wastes the
 * guest's typing.
 *
 * Nothing here is linked from the site yet. The Book a table button still goes
 * to Dineout until cut-over.
 */

const COPY = {
  en: {
    title: "Book a table",
    date: "Which day?",
    party: "How many of you?",
    time: "What time?",
    guest: "Who shall we put it under?",
    name: "Name",
    email: "Email",
    phone: "Phone",
    request: "Anything we should know?",
    requestHint: "Allergies, a highchair, a birthday — anything at all.",
    book: "Book the table",
    booking: "Booking…",
    noTimes: "Nothing free that day, sorry. Try another?",
    tooLarge: (n) =>
      `For more than ${n} of you, please ring us on +354 788 0808 — a group that size we like to plan properly.`,
    closed: "We are closed that day.",
    taken: "Someone took that table while you were typing. Please pick another time.",
    failed: "Something went wrong. Please ring us on +354 788 0808.",
    needContact: "An email or a phone number, so we can reach you.",
    done: "You are booked",
    ref: "Your reference",
    doneNote: "We will see you then. If anything changes, ring us on +354 788 0808.",
    people: (n) => (n === 1 ? "1 person" : `${n} people`),
  },
  is: {
    title: "Bóka borð",
    date: "Hvaða dag?",
    party: "Hvað eruð þið mörg?",
    time: "Hvaða tími?",
    guest: "Á hvaða nafn?",
    name: "Nafn",
    email: "Netfang",
    phone: "Sími",
    request: "Er eitthvað sem við ættum að vita?",
    requestHint: "Ofnæmi, barnastóll, afmæli — hvað sem er.",
    book: "Bóka borðið",
    booking: "Bóka…",
    noTimes: "Ekkert laust þann dag. Prófaðu annan dag?",
    tooLarge: (n) =>
      `Fyrir fleiri en ${n} skaltu hringja í +354 788 0808 — svona hóp viljum við skipuleggja vel.`,
    closed: "Við erum lokuð þann dag.",
    taken: "Einhver tók borðið á meðan þú skrifaðir. Veldu annan tíma.",
    failed: "Eitthvað fór úrskeiðis. Hringdu í +354 788 0808.",
    needContact: "Netfang eða símanúmer, svo við náum í þig.",
    done: "Borðið er bókað",
    ref: "Bókunarnúmer",
    doneNote: "Við sjáumst þá. Ef eitthvað breytist, hringdu í +354 788 0808.",
    people: (n) => (n === 1 ? "1 gestur" : `${n} gestir`),
  },
};

const todayIso = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

export default function BookTableForm({ language = "en" }) {
  const t = COPY[language] ?? COPY.en;

  const [date, setDate] = useState(todayIso());
  const [party, setParty] = useState(2);
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState([]);
  const [state, setState] = useState("idle"); // idle | loading | tooLarge | closed
  const [limit, setLimit] = useState(12);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [request, setRequest] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  const load = useCallback(async () => {
    setState("loading");
    setTime("");
    try {
      const res = await fetch(
        `/api/restaurant/availability?date=${date}&party=${party}`
      );
      const data = await res.json();
      if (data.tooLarge) {
        setLimit(data.onlinePartyLimit);
        setState("tooLarge");
        setSlots([]);
        return;
      }
      if (data.closed) {
        setState("closed");
        setSlots([]);
        return;
      }
      setSlots((data.slots ?? []).filter((s) => s.free));
      setState("idle");
    } catch {
      setSlots([]);
      setState("idle");
    }
  }, [date, party]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email && !phone) return setError(t.needContact);
    setSending(true);
    try {
      const res = await fetch("/api/restaurant/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, party, name, email, phone, request, language }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "taken") {
          setError(t.taken);
          load();
        } else if (data.error === "tooLarge") {
          setError(t.tooLarge(data.onlinePartyLimit));
        } else {
          setError(t.failed);
        }
        return;
      }
      setDone(data);
    } catch {
      setError(t.failed);
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="mb-3 text-3xl font-semibold">{t.done}</h1>
        <p className="mb-8 text-lg opacity-80">
          {done.date} · {done.time} · {t.people(done.party)}
        </p>
        <div className="mb-8 inline-block rounded-2xl bg-black/5 px-8 py-5">
          <div className="text-sm uppercase tracking-wide opacity-60">{t.ref}</div>
          <div className="font-mono text-3xl font-semibold">{done.reference}</div>
        </div>
        <p className="opacity-70">{t.doneNote}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-semibold">{t.title}</h1>

      <label className="mb-6 block">
        <span className="mb-2 block font-medium">{t.date}</span>
        <input
          type="date"
          value={date}
          min={todayIso()}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-black/15 px-4 py-3 text-lg"
        />
      </label>

      <div className="mb-6">
        <span className="mb-2 block font-medium">{t.party}</span>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: limit }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
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

      <div className="mb-8">
        <span className="mb-2 block font-medium">{t.time}</span>
        {state === "tooLarge" ? (
          <p className="rounded-xl bg-black/5 p-4">{t.tooLarge(limit)}</p>
        ) : state === "closed" ? (
          <p className="rounded-xl bg-black/5 p-4">{t.closed}</p>
        ) : state === "loading" ? (
          <p className="opacity-60">…</p>
        ) : slots.length === 0 ? (
          <p className="rounded-xl bg-black/5 p-4">{t.noTimes}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((s) => (
              <button
                key={s.time}
                type="button"
                onClick={() => setTime(s.time)}
                className={`min-h-11 rounded-xl px-4 text-lg ${
                  time === s.time ? "bg-primary-green text-white" : "bg-black/5"
                }`}
              >
                {s.time}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Only once there is a table to put them at. */}
      {time && (
        <div className="mb-8 space-y-4">
          <span className="block font-medium">{t.guest}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.name}
            required
            minLength={2}
            className="w-full rounded-xl border border-black/15 px-4 py-3 text-lg"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.email}
            className="w-full rounded-xl border border-black/15 px-4 py-3 text-lg"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.phone}
            className="w-full rounded-xl border border-black/15 px-4 py-3 text-lg"
          />
          <label className="block">
            <span className="mb-1 block text-sm opacity-70">{t.requestHint}</span>
            <textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder={t.request}
              rows={3}
              className="w-full rounded-xl border border-black/15 px-4 py-3 text-lg"
            />
          </label>
        </div>
      )}

      {error && <p className="mb-4 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}

      <button
        type="submit"
        disabled={!time || name.trim().length < 2 || sending}
        className="min-h-12 w-full rounded-xl bg-primary-green px-6 py-4 text-lg text-white disabled:bg-black/10 disabled:text-black/40"
      >
        {sending ? t.booking : t.book}
      </button>
    </form>
  );
}
