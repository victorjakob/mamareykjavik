"use client";

import ContactForm from "@/app/components/ContactForm";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import PageBackground from "@/app/components/ui/PageBackground";
import { CalendarDays, MapPin, MessageCircle, Sparkles } from "lucide-react";

export default function ContactClient() {
  const { language } = useLanguage();

  const translations = {
    en: {
      eyebrow: "Contact",
      title: "We’d love to hear from you.",
      intro:
        "Questions, table plans, private events, catering, collaborations, or a little note from your day. Use the form below and the right person will get back to you.",
      bookTable: "Book a table",
      hostEvent: "Host an event",
      formTitle: "Send a message",
      formIntro: "Use the form for general questions. For bookings, the buttons above are usually fastest.",
      restaurant: "Mama Reykjavík",
      restaurantDetail: "Restaurant, menu, table bookings & catering",
      venue: "White Lotus",
      venueDetail: "Venue hire, events & private gatherings",
      location: "Bankastræti 2 · 101 Reykjavík",
      open: "Open daily · 11:30 – 21:00",
    },
    is: {
      eyebrow: "Hafa samband",
      title: "Við viljum heyra frá þér.",
      intro:
        "Spurningar, borðapantanir, einkaviðburðir, veitingar, samstarf eða lítil kveðja. Notaðu formið hér fyrir neðan og rétt manneskja svarar þér.",
      bookTable: "Bóka borð",
      hostEvent: "Halda viðburð",
      formTitle: "Senda skilaboð",
      formIntro: "Notaðu formið fyrir almennar spurningar. Fyrir bókanir eru hnapparnir hér að ofan oft fljótlegastir.",
      restaurant: "Mama Reykjavík",
      restaurantDetail: "Veitingastaður, matseðill, borðapantanir og veitingar",
      venue: "White Lotus",
      venueDetail: "Salaleiga, viðburðir og einkasamkomur",
      location: "Bankastræti 2 · 101 Reykjavík",
      open: "Opið daglega · 11:30 – 21:00",
    },
  };

  const t = translations[language];

  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-24" data-navbar-theme="dark">
      <PageBackground />
      <div className="absolute inset-x-0 top-0 h-[560px] bg-[#110f0d]" aria-hidden />

      <section className="relative z-10 mx-auto max-w-6xl px-5">
        <div className="grid items-end gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 flex items-center gap-3 lg:pl-28 xl:pl-36">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#ff914d]/60" />
              <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">
                {t.eyebrow}
              </span>
            </div>
            <h1
              className="font-cormorant italic font-light leading-[0.95] text-[#f0ebe3]"
              style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)" }}
            >
              {t.title}
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-[#b8aca0] sm:text-lg">
              {t.intro}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://www.dineout.is/mamareykjavik?isolation=true"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff914d] px-7 py-3.5 text-sm font-semibold text-[#1a1410] transition-all duration-200 hover:scale-[1.03] hover:bg-[#ff914d]/90"
              >
                <CalendarDays className="h-4 w-4" />
                {t.bookTable}
              </a>
              <Link
                href="/whitelotus/rent"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-7 py-3.5 text-sm font-semibold text-[#f0ebe3] transition-all duration-200 hover:bg-white/[0.14]"
              >
                <Sparkles className="h-4 w-4" />
                {t.hostEvent}
              </Link>
            </div>
          </div>

          <div
            className="rounded-[2rem] p-6 sm:p-7"
            style={{
              background: "#110f0d",
              border: "1px solid rgba(255,145,77,0.22)",
              boxShadow: "0 24px 70px rgba(60,30,10,0.16)",
            }}
          >
            <div className="space-y-5">
              {[
                {
                  title: t.restaurant,
                  detail: t.restaurantDetail,
                  contact: "+354 766 6262 · team@mama.is",
                },
                {
                  title: t.venue,
                  detail: t.venueDetail,
                  contact: "+354 770 5111 · team@whitelotus.is",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl bg-white/[0.06] p-5">
                  <p className="font-cormorant text-2xl italic text-[#f0ebe3]">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#b8aca0]">{item.detail}</p>
                  <p className="mt-3 text-xs text-[#ff914d]">{item.contact}</p>
                </div>
              ))}
              <div className="flex items-start gap-3 rounded-2xl bg-[#ff914d]/10 p-5 text-sm text-[#d8cfc6]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#ff914d]" />
                <div>
                  <p>{t.location}</p>
                  <p className="mt-1 text-[#a09488]">{t.open}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 grid gap-8 lg:mt-28 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <div className="mb-4 flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-[#ff914d]" />
              <span className="text-xs uppercase tracking-[0.32em] text-[#ff914d]">
                {t.formTitle}
              </span>
            </div>
            <h2
              className="font-cormorant text-4xl italic leading-tight text-[#2c1810] sm:text-5xl"
            >
              {t.formTitle}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#7a6858]">
              {t.formIntro}
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}

