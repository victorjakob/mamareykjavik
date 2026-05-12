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

    // Practitioner page
    practitionerEyebrow: "In residence at Mama",
    practitionerOfferingsHeading: "What is offered",
    practitionerAvailabilityHeading: "Availability",
    practitionerAvailabilitySub:
      "Next two weeks. Click a time to book. Payment is cash on the day; the exact address is sent the day before.",
    practitionerAvailabilityEmpty:
      "No open times in the next two weeks. Join the waitlist on any of the offerings above and we will write when something opens.",
    practitionerWaitlistCta: "Join waitlist",
    practitionerOfferingDuration: "minutes",
    practitionerOfferingPrice: "ISK",
    practitionerOfferingCash: "Paid in cash on the day",

    // Slot picker / form
    slotPickerHeading: "Book this slot",
    slotPickerChooseOffering: "Choose an offering",
    slotPickerName: "Your name",
    slotPickerEmail: "Email",
    slotPickerPhone: "Phone (optional)",
    slotPickerNote: "A note for the practitioner (optional)",
    slotPickerCancel: "Cancel",
    slotPickerSubmit: "Book — cash on the day",
    slotPickerSubmitting: "Sending…",
    slotPickerNotImplemented:
      "Booking submission is not wired up yet — this is stage 2. The form is here so we can review the layout. Stage 3 connects it.",

    // Errors
    errorRequiredName: "Please add your name.",
    errorRequiredEmail: "Please add your email.",
    errorRequiredOffering: "Please choose an offering.",
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

    practitionerEyebrow: "Í dvöl hjá Mama",
    practitionerOfferingsHeading: "Það sem í boði er",
    practitionerAvailabilityHeading: "Lausir tímar",
    practitionerAvailabilitySub:
      "Næstu tvær vikur. Smelltu á tíma til að bóka. Greitt í reiðufé á staðnum; staðsetningin er send daginn fyrir.",
    practitionerAvailabilityEmpty:
      "Engir lausir tímar næstu tvær vikur. Skráðu þig á biðlista hjá þeim tilboðum sem hér eru að ofan.",
    practitionerWaitlistCta: "Á biðlistann",
    practitionerOfferingDuration: "mínútur",
    practitionerOfferingPrice: "ISK",
    practitionerOfferingCash: "Greitt í reiðufé á staðnum",

    slotPickerHeading: "Bóka þennan tíma",
    slotPickerChooseOffering: "Veldu tilboð",
    slotPickerName: "Nafnið þitt",
    slotPickerEmail: "Netfang",
    slotPickerPhone: "Sími (valfrjálst)",
    slotPickerNote: "Skilaboð til kennara (valfrjálst)",
    slotPickerCancel: "Hætta við",
    slotPickerSubmit: "Bóka — greitt á staðnum",
    slotPickerSubmitting: "Sendi…",
    slotPickerNotImplemented:
      "Bókunin er ekki tengd ennþá — þetta er hluti 2. Eyðublaðið er hér svo við getum yfirfarið útlitið.",

    errorRequiredName: "Vinsamlegast fylltu inn nafnið þitt.",
    errorRequiredEmail: "Vinsamlegast fylltu inn netfang.",
    errorRequiredOffering: "Vinsamlegast veldu eitt tilboð.",
  },
};
