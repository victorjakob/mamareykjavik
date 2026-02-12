"use client";

import { useState } from "react";
import Image from "next/image";

const checklistItems = [
  "Floors swept",
  "Bar wiped",
  "Dishes on trays / dishwasher handled",
  "Items returned",
  "Candles off, windows closed, doors locked",
  "If you're last one out, send manager a message so we can turn on the alarm!",
];

export default function CleaningListPage() {
  const [checkedItems, setCheckedItems] = useState(() =>
    checklistItems.map(() => false),
  );
  const [lightboxImage, setLightboxImage] = useState(null);

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

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Cleaning &amp; Closing
          </h1>
          <p className="mt-4 text-base font-medium leading-relaxed text-slate-800 sm:text-lg">
            Thank you for helping us close the space with care. This venue holds
            many gatherings — please leave it as you would wish to find it:
            clean, calm, and ready.
          </p>
          <p className="mt-3 text-sm font-normal leading-relaxed text-slate-600 sm:text-base">
            Read through the guide once to understand the flow, then use the
            checklist to complete the reset step by step before leaving.
          </p>
        </header>

        <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          <aside className="order-first rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:order-last xl:sticky xl:top-24 xl:self-start">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
              Quick Check
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {checklistItems.map((item, index) => (
                <li key={item} className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleChecked(index)}
                    aria-pressed={checkedItems[index]}
                    aria-label={`Mark ${item}`}
                    className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded border text-[10px] font-semibold transition ${
                      checkedItems[index]
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-transparent"
                    }`}
                  >
                    ✓
                  </button>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:justify-items-center">
            <section className="w-full max-w-[420px] justify-self-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      1
                    </span>
                    <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                      Floors
                    </h2>
                  </div>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-slate-700">
                    <li>Sweep the floor in the venue space.</li>
                    <li>Return the broom to its place.</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-medium leading-snug text-slate-800">
                      Broom is usually behind the entrance door of Mama side
                      (See picture)
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        openLightbox(
                          "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770779479/broom_behind_dooor_nkd3mm.jpg",
                          "Broom behind the entrance door",
                        )
                      }
                      className="block w-full"
                      aria-label="Open broom location picture"
                    >
                      <Image
                        src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770779479/broom_behind_dooor_nkd3mm.jpg"
                        alt="Broom behind the entrance door"
                        width={240}
                        height={180}
                        className="h-36 w-full rounded-xl object-contain"
                      />
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-medium leading-snug text-slate-800">
                      If it&apos;s not there, check in the White Lotus
                      bathrooms, the &quot;Ræstikompa&quot; door.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <figure>
                        <button
                          type="button"
                          onClick={() =>
                            openLightbox(
                              "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770779549/bathroom_upstairs_door_tj2c4m.jpg",
                              "Bathroom upstairs door",
                            )
                          }
                          className="block w-full text-left"
                        >
                          <Image
                            src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770779549/bathroom_upstairs_door_tj2c4m.jpg"
                            alt="Bathroom upstairs door"
                            width={400}
                            height={300}
                            className="h-28 w-full rounded-xl object-contain"
                          />
                        </button>
                        <figcaption className="mt-2 text-center text-xs text-slate-500">
                          WL Bathroom area
                        </figcaption>
                      </figure>
                      <figure>
                        <button
                          type="button"
                          onClick={() =>
                            openLightbox(
                              "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770779551/bathroom_upstairs_ejc0yz.jpg",
                              "Bathroom upstairs",
                            )
                          }
                          className="block w-full text-left"
                        >
                          <Image
                            src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770779551/bathroom_upstairs_ejc0yz.jpg"
                            alt="Bathroom upstairs"
                            width={400}
                            height={300}
                            className="h-28 w-full rounded-xl object-contain"
                          />
                        </button>
                        <figcaption className="mt-2 text-center text-xs text-slate-500">
                          First door on the right
                        </figcaption>
                      </figure>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="w-full max-w-[420px] justify-self-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      2
                    </span>
                    <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                      Bar + Surfaces
                    </h2>
                  </div>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-slate-700">
                    <li>
                      Wipe the bar and any surfaces you used (countertops,
                      tables, etc.).
                    </li>
                    <li>Leave the bar clean and neat.</li>
                  </ul>
                </div>
                <div className="grid gap-3">
                  <p className="text-center text-xs font-medium text-slate-600">
                    Click an image to see it better.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <figure>
                      <button
                        type="button"
                        onClick={() =>
                          openLightbox(
                            "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770780406/bar_table_tjsh01.jpg",
                            "Bar table",
                          )
                        }
                        className="block w-full"
                        aria-label="Open bar table photo"
                      >
                        <Image
                          src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770780406/bar_table_tjsh01.jpg"
                          alt="Bar table"
                          width={240}
                          height={180}
                          className="h-36 w-full rounded-xl bg-white object-contain sm:h-40"
                        />
                      </button>
                      <figcaption className="mt-2 text-center text-xs text-slate-500">
                        Bar table
                      </figcaption>
                    </figure>

                    <figure>
                      <button
                        type="button"
                        onClick={() =>
                          openLightbox(
                            "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770780407/bar_table2_gsmhm5.jpg",
                            "Bar table (angle 2)",
                          )
                        }
                        className="block w-full"
                        aria-label="Open second bar table photo"
                      >
                        <Image
                          src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770780407/bar_table2_gsmhm5.jpg"
                          alt="Bar table (angle 2)"
                          width={240}
                          height={180}
                          className="h-36 w-full rounded-xl bg-white object-contain sm:h-40"
                        />
                      </button>
                      <figcaption className="mt-2 text-center text-xs text-slate-500">
                        Bar table (angle 2)
                      </figcaption>
                    </figure>

                    <figure>
                      <button
                        type="button"
                        onClick={() =>
                          openLightbox(
                            "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770780407/bar_sink_xobcoi.jpg",
                            "Bar sink",
                          )
                        }
                        className="block w-full"
                        aria-label="Open bar sink photo"
                      >
                        <Image
                          src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770780407/bar_sink_xobcoi.jpg"
                          alt="Bar sink"
                          width={240}
                          height={180}
                          className="h-36 w-full rounded-xl bg-white object-contain sm:h-40"
                        />
                      </button>
                      <figcaption className="mt-2 text-center text-xs text-slate-500">
                        Bar sink
                      </figcaption>
                    </figure>

                    <figure>
                      <button
                        type="button"
                        onClick={() =>
                          openLightbox(
                            "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770780408/bar_clean_tlv05o.jpg",
                            "Clean bar example",
                          )
                        }
                        className="block w-full"
                        aria-label="Open clean bar example photo"
                      >
                        <Image
                          src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770780408/bar_clean_tlv05o.jpg"
                          alt="Clean bar example"
                          width={240}
                          height={180}
                          className="h-36 w-full rounded-xl bg-white object-contain sm:h-40"
                        />
                      </button>
                      <figcaption className="mt-2 text-center text-xs text-slate-500">
                        Clean bar example
                      </figcaption>
                    </figure>
                  </div>
                </div>
              </div>
            </section>

            <section className="w-full max-w-[420px] justify-self-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      3
                    </span>
                    <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                      Dishes &amp; Cups
                    </h2>
                  </div>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-slate-700">
                    <li>
                      Collect all plates, glasses, and cups and place them on
                      the dishwashing trays.
                    </li>
                    <li>
                      Important (cacao cups): empty cacao leftovers out of the
                      cups before placing them on trays.
                    </li>
                    <li>
                      Check for marks/residue inside cups and rinse/clean if
                      needed. the things used should be ready to be put in the
                      dishwasher. (rinsed and ready)
                    </li>
                  </ul>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Dishwasher
                    </h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                      <li>
                        If the dishwasher is ON: put trays through the machine.
                      </li>
                      <li>
                        If the dishwasher is OFF: leave trays next to the
                        dishwasher (do not start the machine).
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <figure>
                    <button
                      type="button"
                      onClick={() =>
                        openLightbox(
                          "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770781018/washy3_ecqevy.jpg",
                          "Dirty trays placement (left side of sink)",
                        )
                      }
                      className="block w-full"
                      aria-label="Open dirty trays placement photo"
                    >
                      <Image
                        src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770781018/washy3_ecqevy.jpg"
                        alt="Dirty trays placement (left side of sink)"
                        width={320}
                        height={220}
                        className="h-40 w-full rounded-2xl bg-white object-contain"
                      />
                    </button>
                    <figcaption className="mt-2 text-xs text-slate-500">
                      The dirty trays should go on the left side of the sink.
                    </figcaption>
                  </figure>
                  <figure>
                    <button
                      type="button"
                      onClick={() =>
                        openLightbox(
                          "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770781023/washy2_lawl7l.jpg",
                          "Dish trays location (under this table)",
                        )
                      }
                      className="block w-full"
                      aria-label="Open trays under table photo"
                    >
                      <Image
                        src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770781023/washy2_lawl7l.jpg"
                        alt="Dish trays location (under this table)"
                        width={320}
                        height={220}
                        className="h-40 w-full rounded-2xl bg-white object-contain"
                      />
                    </button>
                    <figcaption className="mt-2 text-xs text-slate-500">
                      The trays can be found under this table.
                    </figcaption>
                  </figure>
                </div>
              </div>
            </section>

            <section className="w-full max-w-[420px] justify-self-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      4
                    </span>
                    <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                      Return Items to Their Place
                    </h2>
                  </div>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-slate-700">
                    <li>
                      Put everything back where you found it (decor, props,
                      tools, moved furniture, etc.).
                    </li>
                    <li>Reset the space for the next group.</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    openLightbox(
                      "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770781737/lotus2_lap1aw.jpg",
                      "Return items to their place reference",
                    )
                  }
                  className="block w-full"
                  aria-label="Open return items reference photo"
                >
                  <Image
                    src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770781737/lotus2_lap1aw.jpg"
                    alt="Return items to their place reference"
                    width={400}
                    height={300}
                    className="h-40 w-full rounded-2xl bg-white object-contain"
                  />
                </button>
              </div>
            </section>

            <section className="w-full max-w-[420px] justify-self-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      5
                    </span>
                    <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                      Candles, Windows &amp; Doors (Close Down)
                    </h2>
                  </div>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-slate-700">
                    <li>Turn off all candles.</li>
                    <li>
                      Close all windows.(Make sure to check also in bathrooms)
                    </li>
                    <li>
                      Lock the downstairs door and pull the handle to confirm it
                      doesn't open. (only if mama is closed)
                    </li>
                    <li>Ensure the storage door is properly closed.</li>
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <figure>
                    <button
                      type="button"
                      onClick={() =>
                        openLightbox(
                          "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770782012/downstairs_ua9qyz.jpg",
                          "The door downstairs",
                        )
                      }
                      className="block w-full"
                      aria-label="Open door downstairs reference image"
                    >
                      <Image
                        src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770782012/downstairs_ua9qyz.jpg"
                        alt="The door downstairs"
                        width={400}
                        height={300}
                        className="h-40 w-full rounded-2xl bg-white object-contain"
                      />
                    </button>
                    <figcaption className="mt-2 text-center text-xs text-slate-500">
                      the door downstairs
                    </figcaption>
                  </figure>
                  <figure>
                    <button
                      type="button"
                      onClick={() =>
                        openLightbox(
                          "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770874597/lock_vwbcvu.jpg",
                          "The lock on the door downstairs",
                        )
                      }
                      className="block w-full"
                      aria-label="Open lock on the door downstairs reference image"
                    >
                      <Image
                        src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1770874597/lock_vwbcvu.jpg"
                        alt="The lock on the door downstairs"
                        width={400}
                        height={300}
                        className="h-40 w-full rounded-2xl bg-white object-contain"
                      />
                    </button>
                    <figcaption className="mt-2 text-center text-xs text-slate-500">
                      <span className="block">The lock on the door downstairs</span>
                      <span className="mt-1 block">
                        press the little button down so all the locks go out
                      </span>
                    </figcaption>
                  </figure>
                </div>
              </div>
            </section>

            <section className="w-full max-w-[420px] justify-self-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      6
                    </span>
                    <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                      Final Look
                    </h2>
                  </div>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-slate-700">
                    <li>The venue should look clean, tidy, and organized.</li>
                    <li>
                      Floors swept, bar wiped, dishes handled, items returned.
                    </li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  <p>
                    If you are the last one out, make sure all the lights and
                    windows are closed. (White Lotus side)
                  </p>
                  <p className="mt-2">Take care of your self and be happy.</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <p className="mt-12 text-center text-base font-semibold text-slate-800">
          Thank you - you're all set.
        </p>
      </div>
      {lightboxImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded image"
          onClick={closeLightbox}
        >
          <button
            type="button"
            aria-label="Close image"
            className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-900 shadow"
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
              className="max-h-[90vh] w-auto rounded-3xl object-contain"
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
