// Bilingual copy for /private-session.
// Single source. Component picks one based on locale.
// Icelandic translations are placeholders for the /is/ build (later PR).

export const COPY = {
  en: {
    locale: "en",
    htmlLang: "en",

    // Index page
    indexEyebrow: "Private sessions",
    indexTitle: "Visiting healers,\nheld at Mama.",
    indexIntro:
      "Mama holds the container. Visiting practitioners bring the offering. A quiet stretch of time, in a small room, paid in cash on the day.",
    indexNoPractitioners:
      "There is no one in residence right now. Quiet weeks happen — check back, or write to us if you would like to be told when the next teacher arrives.",
    indexCardResidency: "In residence",
    indexCardView: "View",
    indexCardOfferings: "Offerings",

    // Practitioner page — hero
    practitionerEyebrow: "Offering",
    practitionerAbout: "About",
    practitionerHideAbout: "Hide",

    // Booking flow — step labels
    step1Label: "1. Choose a session",
    step2Label: "2. Pick a date and time",
    step3Label: "3. Your details",
    step2Locked: "Choose a session above to see available times.",
    step3Locked: "Pick a time above to continue.",

    // Step 2 details
    pickDate: "Pick a date",
    pickTime: "Pick a time",
    noSlotsForOffering:
      "No open times for this session in the calendar. Join the waitlist and we will write when something opens.",

    // Step 3
    formName: "Your name",
    formEmail: "Email",
    formPhone: "Phone (optional)",
    formNote: "A note for the practitioner (optional)",
    formSubmit: "Confirm booking — cash on the day",
    formSubmitting: "Booking…",
    formCashNote:
      "Payment is in cash on the day. The exact address is sent the day before by email.",
    // Success states — note: we intentionally don't show the booking
    // reference id in the UI. The customer email carries it for audit
    // purposes; making it the centerpiece of the success card feels
    // bureaucratic for a healing-session booking.
    bookingSuccessTitle: "Booking confirmed.",
    bookingSuccessBody:
      "Check your inbox — we've sent a confirmation with all the details. The exact address will be emailed the day before.",
    bookingSuccessBookAnother: "Book another",
    bookingSuccessBackHome: "Back to home",

    waitlistSuccessTitle: "On the waitlist.",
    waitlistSuccessBody:
      "If a slot opens up we'll email you a six-hour window to claim it. If you don't claim in time, the next person on the list is offered the slot.",
    waitlistSuccessPosition: "You are #",

    // Booking conflict
    errorSlotTaken:
      "That time was just taken. Please pick another — the calendar is up to date.",

    // Offering card chips
    offeringDuration: "min",
    offeringPrice: "ISK",
    offeringSelected: "Selected",
    waitlistCta: "Join waitlist",

    // Selection summary card (shown once a session is picked)
    summaryEyebrow: "Your session",
    summaryWith: "with",
    summaryTotal: "Total",

    // Errors
    errorRequiredName: "Please add your name.",
    errorRequiredEmail: "Please add your email.",
    errorRequiredOffering: "Please choose a session.",
    errorRequiredSlot: "Please pick a time.",
  },
  is: {
    locale: "is",
    htmlLang: "is",
    indexEyebrow: "Einkatímar",
    indexTitle: "Gestakennarar,\nhaldnir af Mama.",
    indexIntro:
      "Mama heldur rýmið. Gestakennarar koma með sjálft tilboðið. Rólegur tími, lítið rými, greitt í reiðufé á staðnum.",
    indexNoPractitioners:
      "Það er enginn í dvöl hjá okkur núna. Skoðaðu aftur seinna eða hafðu samband ef þú vilt fá tilkynningu þegar næsti kennari kemur.",
    indexCardResidency: "Í dvöl",
    indexCardView: "Skoða",
    indexCardOfferings: "Það sem í boði er",

    practitionerEyebrow: "Tegund",
    practitionerAbout: "Um",
    practitionerHideAbout: "Fela",

    step1Label: "1. Veldu tegund",
    step2Label: "2. Veldu dag og tíma",
    step3Label: "3. Þínar upplýsingar",
    step2Locked: "Veldu tegund að ofan til að sjá lausa tíma.",
    step3Locked: "Veldu tíma að ofan til að halda áfram.",

    pickDate: "Veldu dag",
    pickTime: "Veldu tíma",
    noSlotsForOffering:
      "Engir lausir tímar fyrir þetta tilboð í dagatalinu. Skráðu þig á biðlista.",

    formName: "Nafn",
    formEmail: "Netfang",
    formPhone: "Sími (valfrjálst)",
    formNote: "Skilaboð til kennara (valfrjálst)",
    formSubmit: "Staðfesta bókun — greitt á staðnum",
    formSubmitting: "Bóka…",
    formCashNote:
      "Greitt í reiðufé á staðnum. Staðsetning er send daginn fyrir með tölvupósti.",
    bookingSuccessTitle: "Bókun staðfest.",
    bookingSuccessBody:
      "Skoðaðu pósthólfið — við sendum staðfestingu með öllum upplýsingum. Staðsetning er send daginn fyrir.",
    bookingSuccessBookAnother: "Bóka annan tíma",
    bookingSuccessBackHome: "Til baka",

    waitlistSuccessTitle: "Á biðlistanum.",
    waitlistSuccessBody:
      "Ef tími losnar færðu tölvupóst með sex klukkustunda glugga til að taka hann. Ef enginn tekur tímann innan þess tíma fer hann til næsta manns.",
    waitlistSuccessPosition: "Þú ert #",

    errorSlotTaken:
      "Þessi tími var nýtekinn. Vinsamlegast veldu annan — dagatalið er nú uppfært.",

    offeringDuration: "mín",
    offeringPrice: "ISK",
    offeringSelected: "Valið",
    waitlistCta: "Á biðlistann",

    summaryEyebrow: "Tíminn þinn",
    summaryWith: "með",
    summaryTotal: "Samtals",

    errorRequiredName: "Vinsamlegast fylltu inn nafn.",
    errorRequiredEmail: "Vinsamlegast fylltu inn netfang.",
    errorRequiredOffering: "Vinsamlegast veldu tegund.",
    errorRequiredSlot: "Vinsamlegast veldu tíma.",
  },
};
