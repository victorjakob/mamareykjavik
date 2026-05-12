"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const checklistItems = [
  "Floors swept",
  "Bar wiped",
  "Dishes on trays / dishwasher handled",
  "Items returned",
  "Toilets checked (quick tidy)",
  "Candles off, windows closed, doors locked",
  "If you're last one out, send manager a message so we can turn on the alarm!",
];

// ── Reusable building blocks ─────────────────────────────────────────────────

function StepBadge({ n }) {
  return (
    <span
      className="flex h-9 w-9 items-center justify-center rounded-full font-cormorant italic text-base font-medium"
      style={{
        background: "#c9986a",
        color: "#2a1e15",
      }}
      aria-hidden
    >
      {n}
    </span>
  );
}

function StepHeading({ children }) {
  return (
    <h2
      className="font-cormorant italic font-light text-[#f0ebe3]"
      style={{ fontSize: "clamp(1.4rem, 2.6vw, 1.8rem)", lineHeight: 1.15 }}
    >
      {children}
    </h2>
  );
}

// Editorial bullet — bronze em-dash, soft-cream label, on a subtle warm row.
function Bullet({ children }) {
  return (
    <li className="flex items-baseline gap-3">
      <span
        aria-hidden
        className="shrink-0 font-cormorant"
        style={{
          color: "rgba(201,152,106,0.8)",
          fontSize: "1rem",
          lineHeight: 1,
        }}
      >
        —
      </span>
      <span className="text-[#c8bdb0] text-[15px] leading-relaxed">
        {children}
      </span>
    </li>
  );
}

function BulletList({ children, className = "" }) {
  return <ul className={`space-y-2 ${className}`}>{children}</ul>;
}

// Section card — the warm dark "tile" used everywhere on the site.
function Card({ children, className = "" }) {
  return (
    <section
      className={`mx-auto w-full max-w-[440px] rounded-3xl border p-6 shadow-[0_2px_24px_-12px_rgba(0,0,0,0.5)] lg:mb-6 lg:inline-block lg:break-inside-avoid ${className}`}
      style={{
        background: "rgba(240,235,227,0.03)",
        borderColor: "rgba(240,235,227,0.08)",
      }}
    >
      {children}
    </section>
  );
}

// Inset "callout" box — slightly warmer fill, used for tips and notes.
function Note({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-4 ${className}`}
      style={{
        background: "rgba(201,152,106,0.06)",
        border: "1px solid rgba(201,152,106,0.18)",
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function CleaningListPage() {
  const [checkedItems, setCheckedItems] = useState(() =>
    checklistItems.map(() => false),
  );
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isCommentFormOpen, setIsCommentFormOpen] = useState(false);
  const [commentForm, setCommentForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [commentStatus, setCommentStatus] = useState({
    type: "",
    message: "",
  });
  const [isSendingComment, setIsSendingComment] = useState(false);

  const toggleChecked = (index) => {
    setCheckedItems((prev) =>
      prev.map((value, currentIndex) =>
        currentIndex === index ? !value : value,
      ),
    );
  };

  const openLightbox = (src, alt) => {
    setLightboxImage({ src, alt });
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const handleCommentChange = (event) => {
    const { name, value } = event.target;
    setCommentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    setIsSendingComment(true);
    setCommentStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/sendgrid/contact-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...commentForm,
          source: "Cleaning List",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send comment");
      }

      setCommentStatus({
        type: "success",
        message: "Thank you. Your comment has been sent to the team.",
      });
      setCommentForm({ name: "", email: "", message: "" });
      setIsCommentFormOpen(false);
    } catch (error) {
      console.error("Error sending cleaning list comment:", error);
      setCommentStatus({
        type: "error",
        message: "Something went wrong. Please try again in a moment.",
      });
    } finally {
      setIsSendingComment(false);
    }
  };

  // Shared image-button — used by every photo on the page.
  const PhotoButton = ({ src, alt, caption, heightClass = "h-40" }) => (
    <figure>
      <button
        type="button"
        onClick={() => openLightbox(src, alt)}
        className="block w-full overflow-hidden rounded-2xl border transition hover:opacity-95"
        style={{
          background: "#fff",
          borderColor: "rgba(240,235,227,0.1)",
        }}
        aria-label={`Open ${alt} photo`}
      >
        <Image
          src={src}
          alt={alt}
          width={400}
          height={300}
          className={`${heightClass} w-full object-contain`}
        />
      </button>
      {caption ? (
        <figcaption className="mt-2 text-center text-xs text-[#a09488]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );

  const darkInputClass =
    "w-full rounded-2xl px-4 py-3 text-sm text-[#f0ebe3] placeholder-[#6a5e52] outline-none transition focus:border-[#ff914d]/50";
  const darkInputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
  };

  return (
    <main
      className="min-h-screen bg-[#1a1208]"
      data-navbar-theme="dark"
    >
      <div className="mx-auto w-full max-w-6xl px-6 pt-24 pb-16 sm:pt-28">
        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div
              className="h-px"
              style={{
                width: 40,
                background:
                  "linear-gradient(to right, transparent, rgba(201,152,106,0.45))",
              }}
            />
            <span
              className="text-[10px] uppercase"
              style={{ letterSpacing: "0.48em", color: "#c9986a" }}
            >
              Closing checklist
            </span>
            <div
              className="h-px"
              style={{
                width: 40,
                background:
                  "linear-gradient(to left, transparent, rgba(201,152,106,0.45))",
              }}
            />
          </div>

          <h1
            className="font-cormorant font-light italic text-[#f0ebe3]"
            style={{
              fontSize: "clamp(2.2rem, 4.4vw, 3.4rem)",
              lineHeight: 1.15,
            }}
          >
            Cleaning &amp; Closing
          </h1>

          <p className="mt-5 text-[#c8bdb0] text-base leading-relaxed sm:text-lg">
            Thank you for helping us close the space with care. This venue holds
            many gatherings — please leave it as you would wish to find it:
            clean, calm, and ready.
          </p>
          <p className="mt-3 text-sm text-[#a09488] leading-relaxed sm:text-base">
            Read through the guide once to understand the flow, then use the
            checklist to complete the reset step by step before leaving.
          </p>
        </motion.header>

        {/* ── Layout: sidebar (Quick Check) + masonry cards ── */}
        <div className="mt-12 grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          {/* Sidebar ─ Quick check */}
          <aside
            className="order-first rounded-2xl border p-5 xl:order-last xl:sticky xl:top-28 xl:self-start"
            style={{
              background: "rgba(240,235,227,0.03)",
              borderColor: "rgba(240,235,227,0.08)",
            }}
          >
            <h2
              className="text-[10px] uppercase font-medium"
              style={{ letterSpacing: "0.35em", color: "#c9986a" }}
            >
              Quick Check
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {checklistItems.map((item, index) => {
                const checked = checkedItems[index];
                return (
                  <li key={item} className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleChecked(index)}
                      aria-pressed={checked}
                      aria-label={`Mark ${item}`}
                      className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded text-[10px] font-semibold transition"
                      style={{
                        background: checked ? "#c9986a" : "transparent",
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: checked
                          ? "#c9986a"
                          : "rgba(240,235,227,0.18)",
                        color: checked ? "#2a1e15" : "transparent",
                      }}
                    >
                      ✓
                    </button>
                    <span
                      className={`leading-snug ${
                        checked
                          ? "text-[#7a6a5a] line-through"
                          : "text-[#c8bdb0]"
                      }`}
                    >
                      {item}
                    </span>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="grid gap-6 lg:block lg:columns-2 lg:[column-gap:1.5rem]">
            {/* Step 1 — Floors */}
            <Card>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3">
                    <StepBadge n={1} />
                    <StepHeading>Floors</StepHeading>
                  </div>
                  <BulletList className="mt-4">
                    <Bullet>Sweep the floor in the venue space.</Bullet>
                    <Bullet>Return the broom to its place.</Bullet>
                  </BulletList>
                </div>

                <div className="space-y-4">
                  <Note>
                    <div className="grid grid-cols-2 items-center gap-3">
                      <p className="text-sm leading-snug text-[#d4c9bc]">
                        Broom is usually behind the entrance door of Mama side
                        (See picture)
                      </p>
                      <PhotoButton
                        src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770779479/broom_behind_dooor_nkd3mm.jpg"
                        alt="Broom behind the entrance door"
                        heightClass="h-36"
                      />
                    </div>
                  </Note>

                  <Note>
                    <p className="text-sm leading-snug text-[#d4c9bc]">
                      If it&apos;s not there, check in the White Lotus
                      bathrooms, the &quot;Ræstikompa&quot; door.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <PhotoButton
                        src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770779549/bathroom_upstairs_door_tj2c4m.jpg"
                        alt="Bathroom upstairs door"
                        caption="WL Bathroom area"
                        heightClass="h-28"
                      />
                      <PhotoButton
                        src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770779551/bathroom_upstairs_ejc0yz.jpg"
                        alt="Bathroom upstairs"
                        caption="First door on the right"
                        heightClass="h-28"
                      />
                    </div>
                  </Note>
                </div>
              </div>
            </Card>

            {/* Step 2 — Bar + Surfaces */}
            <Card>
              <div className="grid gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <StepBadge n={2} />
                    <StepHeading>Bar &amp; Surfaces</StepHeading>
                  </div>
                  <BulletList className="mt-4">
                    <Bullet>
                      Wipe the bar and any surfaces you used (countertops,
                      tables, etc.).
                    </Bullet>
                    <Bullet>Leave the bar clean and neat.</Bullet>
                  </BulletList>
                </div>
                <div className="grid gap-3">
                  <p className="text-center text-xs text-[#a09488]">
                    Click an image to see it better.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <PhotoButton
                      src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770780406/bar_table_tjsh01.jpg"
                      alt="Bar table"
                      caption="Bar table"
                      heightClass="h-36 sm:h-40"
                    />
                    <PhotoButton
                      src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770780407/bar_table2_gsmhm5.jpg"
                      alt="Bar table (angle 2)"
                      caption="Bar table (angle 2)"
                      heightClass="h-36 sm:h-40"
                    />
                    <PhotoButton
                      src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770780407/bar_sink_xobcoi.jpg"
                      alt="Bar sink"
                      caption="Bar sink"
                      heightClass="h-36 sm:h-40"
                    />
                    <PhotoButton
                      src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770780408/bar_clean_tlv05o.jpg"
                      alt="Clean bar example"
                      caption="Clean bar example"
                      heightClass="h-36 sm:h-40"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 3 — Dishes & Cups */}
            <Card>
              <div className="grid gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <StepBadge n={3} />
                    <StepHeading>Dishes &amp; Cups</StepHeading>
                  </div>
                  <BulletList className="mt-4">
                    <Bullet>
                      Collect all plates, glasses, and cups and place them on
                      the dishwashing trays.
                    </Bullet>
                    <Bullet>
                      Important (cacao cups): empty cacao leftovers out of the
                      cups before placing them on trays.
                    </Bullet>
                    <Bullet>
                      Check for marks/residue inside cups and rinse/clean if
                      needed. The things used should be ready to be put in the
                      dishwasher (rinsed and ready).
                    </Bullet>
                  </BulletList>

                  <Note className="mt-5">
                    <h3
                      className="text-[10px] uppercase mb-2"
                      style={{ letterSpacing: "0.3em", color: "#c9986a" }}
                    >
                      Dishwasher
                    </h3>
                    <BulletList>
                      <Bullet>
                        If the dishwasher is ON: put trays through the machine.
                      </Bullet>
                      <Bullet>
                        If the dishwasher is OFF: leave trays next to the
                        dishwasher (do not start the machine).
                      </Bullet>
                    </BulletList>
                  </Note>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <PhotoButton
                    src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770781018/washy3_ecqevy.jpg"
                    alt="Dirty trays placement (left side of sink)"
                    caption="The dirty trays should go on the left side of the sink."
                  />
                  <PhotoButton
                    src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770781023/washy2_lawl7l.jpg"
                    alt="Dish trays location (under this table)"
                    caption="The trays can be found under this table."
                  />
                </div>
              </div>
            </Card>

            {/* Step 4 — Return Items */}
            <Card>
              <div className="grid gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <StepBadge n={4} />
                    <StepHeading>Return Items to Their Place</StepHeading>
                  </div>
                  <BulletList className="mt-4">
                    <Bullet>
                      Put everything back where you found it (decor, props,
                      tools, moved furniture, etc.).
                    </Bullet>
                    <Bullet>Reset the space for the next group.</Bullet>
                  </BulletList>
                </div>
                <PhotoButton
                  src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770781737/lotus2_lap1aw.jpg"
                  alt="Return items to their place reference"
                />
              </div>
            </Card>

            {/* Step 5 — Toilets */}
            <Card>
              <div className="grid gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <StepBadge n={5} />
                    <StepHeading>Toilets (Quick Courtesy Check)</StepHeading>
                  </div>
                  <p className="mt-4 text-[15px] text-[#c8bdb0] leading-relaxed">
                    Please leave the toilets in a decent, guest-ready state.
                  </p>
                  <BulletList className="mt-4">
                    <Bullet>
                      Quick wipe of the sink/counter if there are water spots or
                      visible marks.
                    </Bullet>
                    <Bullet>
                      Make sure the toilet bowl/seat is clean and presentable.
                    </Bullet>
                    <Bullet>Flush and check everything looks ok.</Bullet>
                    <Bullet>Wipe up any spills (soap/water).</Bullet>
                  </BulletList>
                </div>
              </div>
            </Card>

            {/* Step 6 — Candles, Windows & Doors */}
            <Card>
              <div className="grid gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <StepBadge n={6} />
                    <StepHeading>
                      Candles, Windows &amp; Doors (Close Down)
                    </StepHeading>
                  </div>
                  <BulletList className="mt-4">
                    <Bullet>Turn off all candles.</Bullet>
                    <Bullet>
                      Close all windows. (Make sure to check also in bathrooms.)
                    </Bullet>
                    <Bullet>
                      Lock the downstairs door and pull the handle to confirm it
                      doesn&apos;t open. (Only if Mama is closed.)
                    </Bullet>
                    <Bullet>Ensure the storage door is properly closed.</Bullet>
                  </BulletList>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <PhotoButton
                    src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770782012/downstairs_ua9qyz.jpg"
                    alt="The door downstairs"
                    caption="The door downstairs"
                  />
                  <PhotoButton
                    src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770874597/lock_vwbcvu.jpg"
                    alt="The lock on the door downstairs"
                    caption={
                      <>
                        <span className="block">
                          The lock on the door downstairs
                        </span>
                        <span className="mt-1 block">
                          Press the little button down so all the locks go out.
                        </span>
                      </>
                    }
                  />
                </div>
              </div>
            </Card>

            {/* Step 7 — Final Look */}
            <Card>
              <div className="grid gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <StepBadge n={7} />
                    <StepHeading>Final Look</StepHeading>
                  </div>
                  <BulletList className="mt-4">
                    <Bullet>
                      The venue should look clean, tidy, and organized.
                    </Bullet>
                    <Bullet>
                      Floors swept, bar wiped, dishes handled, items returned.
                    </Bullet>
                  </BulletList>
                </div>
                <Note>
                  <p className="text-sm leading-relaxed text-[#d4c9bc]">
                    If you are the last one out, make sure all the lights and
                    windows are closed. (White Lotus side.)
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#d4c9bc]">
                    Take care of yourself and be happy.
                  </p>
                </Note>
              </div>
            </Card>
          </div>
        </div>

        {/* ── Footer — thanks + comment form ── */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <p
            className="font-cormorant italic text-[#f0ebe3]"
            style={{ fontSize: "clamp(1.4rem, 2.6vw, 1.8rem)" }}
          >
            Thank you — you&apos;re all set.
          </p>

          <div className="mt-5">
            <button
              type="button"
              onClick={() => {
                setCommentStatus({ type: "", message: "" });
                setIsCommentFormOpen((prev) => !prev);
              }}
              aria-expanded={isCommentFormOpen}
              className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-xs font-medium uppercase transition"
              style={{
                letterSpacing: "0.2em",
                color: "#c9986a",
                background: "transparent",
                border: "1px solid rgba(201,152,106,0.45)",
              }}
            >
              Any comments? Send us a message
            </button>
          </div>

          {commentStatus.message ? (
            <div
              className="mt-5 rounded-2xl px-4 py-3 text-sm text-left"
              style={
                commentStatus.type === "success"
                  ? {
                      background: "rgba(52,211,153,0.08)",
                      border: "1px solid rgba(52,211,153,0.25)",
                      color: "#a7f3d0",
                    }
                  : {
                      background: "rgba(220,38,38,0.1)",
                      border: "1px solid rgba(220,38,38,0.25)",
                      color: "#fecaca",
                    }
              }
            >
              {commentStatus.message}
            </div>
          ) : null}

          <AnimatePresence initial={false}>
            {isCommentFormOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="mt-6 rounded-3xl p-5 sm:p-6 text-left"
                style={{
                  background: "rgba(240,235,227,0.03)",
                  border: "1px solid rgba(240,235,227,0.08)",
                }}
              >
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="cleaning-comment-name"
                        className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#8a7e72]"
                      >
                        Name
                      </label>
                      <input
                        id="cleaning-comment-name"
                        name="name"
                        type="text"
                        value={commentForm.name}
                        onChange={handleCommentChange}
                        required
                        minLength={2}
                        autoComplete="name"
                        placeholder="Your name"
                        className={darkInputClass}
                        style={darkInputStyle}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="cleaning-comment-email"
                        className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#8a7e72]"
                      >
                        Email
                      </label>
                      <input
                        id="cleaning-comment-email"
                        name="email"
                        type="email"
                        value={commentForm.email}
                        onChange={handleCommentChange}
                        required
                        autoComplete="email"
                        inputMode="email"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                        placeholder="your@email.com"
                        className={darkInputClass}
                        style={darkInputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="cleaning-comment-message"
                      className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#8a7e72]"
                    >
                      Message
                    </label>
                    <textarea
                      id="cleaning-comment-message"
                      name="message"
                      value={commentForm.message}
                      onChange={handleCommentChange}
                      required
                      minLength={10}
                      rows={5}
                      placeholder="Share any note, issue, or suggestion..."
                      className={darkInputClass}
                      style={darkInputStyle}
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-[#8a7e72]">
                      Your message will be sent to team@mama.is.
                    </p>
                    <button
                      type="submit"
                      disabled={isSendingComment}
                      className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-xs font-medium uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-60"
                      style={{
                        background: "#ff914d",
                        color: "#1a1208",
                      }}
                    >
                      {isSendingComment ? "Sending…" : "Send message"}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightboxImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded image"
          onClick={closeLightbox}
          style={{ background: "rgba(10,7,4,0.92)" }}
        >
          <button
            type="button"
            aria-label="Close image"
            className="absolute right-4 top-4 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] transition"
            style={{
              background: "rgba(240,235,227,0.06)",
              border: "1px solid rgba(240,235,227,0.18)",
              color: "#f0ebe3",
            }}
            onClick={(event) => {
              event.stopPropagation();
              closeLightbox();
            }}
          >
            Close
          </button>
          <div
            className="max-h-[90vh] max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              width={1400}
              height={1000}
              className="max-h-[90vh] w-auto rounded-3xl object-contain bg-white"
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
