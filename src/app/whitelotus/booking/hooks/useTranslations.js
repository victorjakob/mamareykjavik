"use client";

import { useLanguage } from "@/hooks/useLanguage";

const translations = {
  is: {
    // Welcome Screen
    welcomeTitle: "Velkomin í White Lotus",
    welcomeSubtitle: "Láttu okkur hjálpa þér að skipuleggja fullkominn viðburð",
    startBooking: "Byrja bókun",
    selectLanguage: "Veldu tungumál",

    // Navigation
    back: "Til baka",
    continue: "Áfram",
    submitting: "Senda...",
    confirm: "Staðfesta",

    // Contact
    contactTitle: "Tengiliður",
    fullName: "Fullt nafn",
    email: "Netfang",
    phone: "Símanúmer",
    company: "Fyrirtæki / stofnun (valfrjálst)",
    kennitala: "Kennitala (valfrjálst)",
    required: "*",

    // DateTime
    dateTimeTitle: "Dagsetning og tími",
    eventInfoTitle: "Upplýsingar um viðburð",
    preferredDate: "Æskileg dagsetning",
    preferredTime: "Æskilegur tími",
    alternativeDate: "Aðrar dagsetningar sem passa",
    alternativeTime: "Aðrir tímar sem passa",
    eventType: "Tegund viðburðar",
    eventTypePlaceholder: "T.d. Afmæli, Vinnustofa, Hátíð, Kynning, o.s.frv.",
    birthday: "Afmæli",
    workshop: "Vinnustofa",
    celebration: "Hátíð",
    presentation: "Kynning",
    other: "Annað",
    startTime: "Byrjunartími",
    startTimeQuestion: "Hvenær byrjar viðburðurinn?",
    endTime: "Endatími",
    endTimeQuestion: "Hvenær endar viðburðurinn?",
    selectEndTime: "Veldu endatíma",
    selectStartTime: "Veldu byrjunartíma",
    setupTimeQuestion: "Klukkan hvað viltu mæta í uppsetningu?",
    earlyAccess: "Þarftu aðgang fyrr fyrir uppsetningu?",
    setupTime: "Uppsetningartími",
    setupTimePlaceholder: "T.d. 14:00",
    selectDate: "Veldu dagsetningu",
    selectTime: "Veldu tíma",
    today: "Í dag",
    tomorrow: "Á morgun",
    thisWeekend: "Þetta helgar",
    nextWeek: "Næsta vika",
    monthNames: [
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
    ],
    dayNames: [
      "Sunnudagur",
      "Mánudagur",
      "Þriðjudagur",
      "Miðvikudagur",
      "Fimmtudagur",
      "Föstudagur",
      "Laugardagur",
    ],
    dayNamesShort: ["Sun", "Mán", "Þri", "Mið", "Fim", "Fös", "Lau"],

    // Services
    servicesTitle: "Valin þjónusta",
    food: "Matur",
    drinks: "Drykkir",
    neither: "Hvorugt — einungis salinn",
    staffCostAcknowledged:
      "Ég skil að starfsfólk kostar 5.000 kr. á klukkustund",
    noOwnAlcoholConfirmed:
      "Ég skil að ekki er heimilt að koma með eigin drykki",

    // Food
    foodTitle: "Matur",
    whatKindOfFood: "Hvers konar mat viltu?",
    numberOfCourses: "Fjöldi rétta?",
    allergies: "Ofnæmi?",
    menu: "Matseðill?",
    buffet: "Hlaðborð",
    plated: "Borðhald",
    fingerFood: "Pinnamatur",
    classic: "Classic",
    simplified: "Einfaldað",
    perPerson: "pp",
    threeCourse: "3 rétta",
    twoCourse: "2 rétta",
    half: "Hálfur",
    full: "Heill",
    halfDescription: "5-6 stk á mann",
    fullDescription: "10-12 stk á mann",

    // Drinks
    drinksTitle: "Drykkir",
    drinkPreferences: "Drykkjaval",
    availableAtBar: "Fáanlegt hjá okkur á barnum",
    openBar: "Opinn Bar",
    openBarDescription:
      "Við skráum allt sem selst og þú færð rkn eftir veisluna",
    prePurchased: "Fyrirframkeypt",
    prePurchasedDescription:
      "Veldu hvað þú villt bjóða upp á og þegar það er búið er fólk frjálst að kaupa sér meir á barnum",
    peoplePayThemselves: "Fólk kaupir sér sjálft drykki á barnum",
    preOrderDrinks: "Forpantaðu drykki",
    beerKeg: "Bjórkútur",
    beerKegDescription: "Um 75 Bjórar",
    beer: "Bjór",
    cocktails: "Kokteill á kút",
    cocktailsDescription: "Um 100 glös",
    whiteWine: "Hvítvín",
    whiteWineDescription: "Flaska af hvítvíni",
    redWine: "Rauðvín",
    redWineDescription: "Flaska af rauðvíni",
    sparklingWine: "Freyðivín",
    sparklingWineDescription: "Flaska af freyðivíni",
    perUnit: "per",
    specialRequests: "Einhverjar séróskir?",

    // Guest Count
    guestCountTitle: "Fjöldi gesta",
    howManyGuests: "Hversu margir gestir?",
    guests: "gestir",
    under10: "Undir 10",
    under10En: "Under 10",
    tenToFifty: "10-50 gestir",
    fiftyToHundred: "50-100 gestir",
    overHundred: "100+ gestir",
    staffCostInfo: "Starfsmannakostnaður:",
    staffCostDetails:
      "Við krefjumst almennt 1 starfsmanns fyrir hverja 25 gesti. Þetta getur breyst eftir tegund viðburðar.",
    staffCostPrice: "Verð:",
    staffCostPerHour: "8.000 kr á klukkustund á starfsmann.",

    // Common
    yes: "Já",
    no: "Nei",
    notSelected: "Ekki valið",

    // Tech and Music
    techTitle: "Tækni og tónlist",
    techNeeds: "Tæknibúnaður",
    musicNeeds: "Tónlist",

    // Room Setup
    roomSetupTitle: "Uppsetning",
    setupType: "Hvers konar uppsetning?",
    seated: "Borðseta",
    seatedDescription: "allir fá sæti við borð",
    seatedMaxSeats: "Hámark 80 sæti",
    standing: "Standandi",
    standingDescription: "enginn stólar eða borð",
    standingNote:
      "*Það verða samt lítil borð við hliðarnar fyrir bolla eða disk ef við á",
    mixed: "50/50",
    mixedDescription: "Bæði standandi og sitjandi í boði",
    lounge: "Lounge",
    loungeDescription:
      "2 sófar og lágborð, nokkrir stólar og síðan opið dansgólf",
    presentation: "Kynning/Sýning",
    presentationDescription: "stólar í átt að sviði",

    // Tablecloth
    tableclothTitle: "Borðbúnaður & skreytingar",
    tableclothColor: "Litur á borðdúk?",
    decorations: "Skreytingar?",
    rentTablecloths: "Viltu leigja dúka frá okkur?",
    selectTableclothColor: "Veldu lit á dúkum",
    whiteTablecloths: "Hvítir dúkar",
    blackTablecloths: "Svartir dúkar",
    bringOwnTablecloths:
      "Borðin eru kringlótt 125 cm, mikilvægt að koma með ykkar eigin dúka fyrir borðin",
    needsNapkins: "Þarftu servéttur frá okkur?",
    needsCandles: "Þarftu kerti frá okkur?",
    decorationComments: "Athugasemdir um borðskreytingar",
    tableclothRentalTooltip: "Leiga á dúkum bætist við heildarverð.",
    napkinsTooltip: "Við bjóðum upp á servéttur gegn auka-gjaldi. Hægt að koma með eigin án kostnaðar.",
    candlesTooltip: "Við eigum kerti til staðar gegn auka-gjaldi. Þú getur einnig komið með eigin kerti án kostnaðar.",

    // Notes
    notesTitle: "Athugasemdir og spurningar",
    notesSubtitle:
      "Er eitthvað sérstakt sem við ættum að vita um viðburðinn þinn?",
    notesPlaceholder:
      "Skrifaðu hér allar athugasemdir, sérstakar óskir, spurningar eða annað sem við ættum að vita...",
    characters: "stafir",
    optional: "valfrjálst",

    // Review
    reviewTitle: "Yfirlit bókunar",
    reviewSubtitle:
      "Vinsamlegast farðu yfir upplýsingarnar áður en þú staðfestir",
    reviewReadyTitle: "Tilbúið að staðfesta?",
    reviewReadyMessage:
      "Við munum hafa samband innan skamms til að ganga frá síðustu smáatriðum.",
    contactInfo: "Tengiliðaupplýsingar",
    name: "Nafn:",
    phoneLabel: "Sími:",
    companyLabel: "Fyrirtæki / stofnun:",
    kennitalaLabel: "Kennitala:",
    services: "Þjónusta",
    selectedServices: "Valin þjónusta:",
    noServicesSelected: "Engin þjónusta valin",
    foodLabel: "Matur:",
    drinksLabel: "Drykkir:",
    preOrder: "Forpöntun:",
    specialRequestsLabel: "Séróskir:",
    eventManager: "Veislustjóri:",
    confirmations: "Staðfestingar:",
    staffCostConfirmed: "Starfsmannakostnaðarskilningur staðfestur",
    alcoholRuleConfirmed: "Áfengisregla staðfest",

    // Booking detail page
    bookingTitle: "Bókun",
    sendComment: "Senda Athugasemd",
    addComment: "Bæta við athugasemd",
    editComment: "Breyta athugasemd",
    commentLabel: "Athugasemd",
    commentPlaceholder: "Skrifaðu athugasemd hér...",
    internalNote: "Innri athugasemd (aðeins sýnileg stjórnendum)",
    cancel: "Hætta við",
    send: "Senda",
    sending: "Sendi...",
    register: "Skrá",
    tableclothLabel: "Dúkar",
    whiteTablecloths: "Hvítir dúkar",
    blackTablecloths: "Svartir dúkar",
    rent: "Leigja",
    notRenting: "Ekki leigja",
    napkins: "Servéttur",
    candles: "Kerti",
    notifyCustomerChange: "Tilkynna viðskiptavini um breytingu?",
    eventDetails: "Upplýsingar",
    guests: "Gestir:",
    dateTime: "Dagsetning og tími:",
    eventType: "Tegund viðburðar:",
    roomSetup: "Uppsetning:",
    tablecloth: "Borðbúnaður:",
    notSelected: "Ekki valið",
    notRentingTablecloths: "Ekki leigja dúka",
    techAndMusic: "Tækni og tónlist",
    djOnSiteLabel: "DJ á staðnum:",
    djBringsControllerLabel: "DJ með eigin controller:",
    needsMicrophoneLabel: "Míkrófón:",
    liveBandLabel: "Live hljómsveit:",
    useProjectorLabel: "Skjávarpi:",
    useLightsLabel: "Ljós og diskókúla:",
    equipmentBroughtLabel: "Búnaður sem verður með:",
    notes: "Athugasemdir",
    notesLabel: "Athugasemdir:",

    // Error handling
    submitError: "Villa kom upp við að staðfesta bókun. Reyndu aftur.",
    errorTitle: "Villa kom upp",
    retry: "Reyna aftur",
    orContactDirectly: "Eða hafðu samband beint:",

    // Success screen
    successTitle: "Bókun send!",
    successMessage: "Við munum hafa samband innan 48 klukkustunda.",
    referenceId: "Bókunarnúmer:",
    backToHome: "Til baka á forsíðu",
    nextSteps: "Næstu skref:",
    receivedInfo: "Við höfum móttekið upplýsingarnar þínar",
    willContact: "Hafa samband innan skamms",
    finalizeDetails: "Ganga frá síðustu smáatriðum",
    viewBooking: "Skoða Bókun",
    questionsContact: "Spurningar? Hafðu samband á",

    // Progress
    progressLabel: "Bókun ferli: skref",
    of: "af",
  },
  en: {
    // Welcome Screen
    welcomeTitle: "Welcome to White Lotus",
    welcomeSubtitle: "Let us help you plan the perfect event",
    startBooking: "Start booking",
    selectLanguage: "Select language",

    // Navigation
    back: "Back",
    continue: "Continue",
    submitting: "Submitting...",
    confirm: "Confirm",

    // Contact
    contactTitle: "Contact Information",
    fullName: "Full name",
    email: "Email",
    phone: "Phone number",
    company: "Company / organization (optional)",
    kennitala: "Kennitala (optional)",
    required: "*",

    // DateTime
    dateTimeTitle: "Date and Time",
    eventInfoTitle: "Event Information",
    preferredDate: "Preferred date",
    preferredTime: "Preferred time",
    alternativeDate: "Alternative dates that work",
    alternativeTime: "Alternative times that work",
    eventType: "Event type",
    eventTypePlaceholder:
      "E.g. Birthday, Workshop, Celebration, Presentation, etc.",
    birthday: "Birthday",
    workshop: "Workshop",
    celebration: "Celebration",
    presentation: "Presentation",
    other: "Other",
    startTime: "Start time",
    startTimeQuestion: "When does the event start?",
    endTime: "End time",
    endTimeQuestion: "When does the event end?",
    selectEndTime: "Select end time",
    selectStartTime: "Select start time",
    setupTimeQuestion: "What time do you want to arrive for setup?",
    earlyAccess: "Do you need early access for setup?",
    setupTime: "Setup time",
    setupTimePlaceholder: "E.g. 14:00",
    selectDate: "Select date",
    selectTime: "Select time",
    today: "Today",
    tomorrow: "Tomorrow",
    thisWeekend: "This weekend",
    nextWeek: "Next week",
    monthNames: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    dayNames: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

    // Services
    servicesTitle: "Selected Services",
    food: "Food",
    foodDescription: "Catering and food preparation",
    drinks: "Drinks",
    drinksDescription: "Beverage and bar service",
    neither: "Neither — venue only",
    neitherDescription: "I only need the space",
    staffCostAcknowledged: "I understand that staff costs 5,000 ISK per hour",
    staffCostNotIncluded:
      "I understand that staff costs are not included in venue rental unless specified in the package",
    noOwnAlcoholConfirmed:
      "I understand that bringing your own alcohol is not permitted",
    addComment: "Add comment",
    comment: "Comment",
    commentPlaceholder: "Write here if you want to add a comment...",

    // Food
    foodTitle: "Food",
    whatKindOfFood: "What kind of food would you like?",
    numberOfCourses: "Number of courses?",
    allergies: "Allergies?",
    menu: "Menu?",
    buffet: "Buffet",
    plated: "Plated",
    fingerFood: "Finger food",
    classic: "Classic",
    simplified: "Simplified",
    perPerson: "pp",
    threeCourse: "3 courses",
    twoCourse: "2 courses",
    half: "Half",
    full: "Full",
    halfDescription: "5-6 pieces per person",
    fullDescription: "10-12 pieces per person",

    // Drinks
    drinksTitle: "Drinks",
    drinkPreferences: "Drink preferences",
    availableAtBar: "Available at our bar",
    openBar: "Open Bar",
    openBarDescription:
      "We record everything ordered and you get an invoice after the event",
    prePurchased: "Pre-purchased",
    prePurchasedDescription:
      "Choose what you want to offer and when that's finished, people are free to buy more at the bar",
    peoplePayThemselves: "People buy their own drinks at the bar",
    preOrderDrinks: "Pre-order drinks",
    beerKeg: "Beer keg",
    beerKegDescription: "About 75 beers",
    beer: "Beer",
    cocktails: "Cocktail in a keg",
    cocktailsDescription: "About 100 glasses",
    whiteWine: "White wine",
    whiteWineDescription: "Bottle of white wine",
    redWine: "Red wine",
    redWineDescription: "Bottle of red wine",
    sparklingWine: "Sparkling wine",
    sparklingWineDescription: "Bottle of sparkling wine",
    perUnit: "per",
    specialRequests: "Any special requests?",

    // Guest Count
    guestCountTitle: "Number of Guests",
    howManyGuests: "How many guests?",
    guests: "guests",
    under10: "Under 10",
    tenToFifty: "10-50 guests",
    fiftyToHundred: "50-100 guests",
    overHundred: "100+ guests",
    staffCostInfo: "Staff cost:",
    staffCostDetails:
      "We generally require 1 staff member for every 25 guests. This may vary depending on the type of event.",
    staffCostPrice: "Price:",
    staffCostPerHour: "8,000 ISK per hour per staff member.",

    // Tech and Music
    techTitle: "Technology and Music",
    techNeeds: "Technical equipment",
    musicNeeds: "Music",
    weOffer: "We offer:",
    techOffer1:
      "Powerful sound system, 4 tops and 2 subs (Bluetooth or connection to mixer)",
    techOffer2:
      "Projector and HDMI cable (you bring laptop or adapter if needed)",
    techOffer3: "Lights and disco ball",
    additionalOptions: "Additional options:",
    techOption1: "Can rent DJ controller from us (Pioneer - XDJ-RX3)",
    techOption2:
      "We have 1 microphone – you bring additional mics if you need more",
    techTooltip1: "Can rent DJ controller from us (Pioneer - XDJ-RX3)",
    techTooltip2: "We have 1 microphone",
    techTooltip3:
      "We have a 6-channel mixer on site. Good to book a sound check for bands if a lot of equipment is used",
    techTooltip4: "HDMI cable on site, you bring a laptop",
    djOnSite: "Will there be a DJ on site?",
    djBringsController: "Will DJ bring their own player/controller?",
    needsMicrophone: "Do you need a microphone?",
    liveBand: "Will there be a live band?",
    useProjector: "Do you want to use the projector?",
    useLights: "Do you want to use lights and disco ball?",
    equipmentBrought: "Equipment that will be brought to the event",
    equipmentPlaceholder: "E.g. instruments, amplifiers, cables, etc.",
    yes: "Yes",
    no: "No",
    unknown: "Don't know yet",

    // Room Setup
    roomSetupTitle: "Room Setup",
    setupType: "What type of setup?",
    seated: "Seated",
    seatedDescription: "everyone gets a seat at a table",
    seatedMaxSeats: "Max 80 seats",
    standing: "Standing",
    standingDescription: "no chairs or tables",
    standingNote:
      "*There will still be small tables at the sides for cups or plates if relevant",
    mixed: "50/50",
    mixedDescription: "Both standing and seated available",
    lounge: "Lounge",
    loungeDescription:
      "2 sofas and coffee table, some chairs and then open dance floor",
    presentation: "Presentation/Show",
    presentationDescription: "chairs facing the stage",

    // Tablecloth
    tableclothTitle: "Table Settings & Decorations",
    tableclothColor: "Tablecloth color?",
    decorations: "Decorations?",
    rentTablecloths: "Do you want to rent tablecloths from us?",
    selectTableclothColor: "Select tablecloth color",
    whiteTablecloths: "White tablecloths",
    blackTablecloths: "Black tablecloths",
    bringOwnTablecloths:
      "Tables are round 125 cm, important to bring your own tablecloths for the tables",
    needsNapkins: "Do you need napkins from us?",
    needsCandles: "Do you need candles from us?",
    decorationComments: "Comments about table decorations",
    tableclothRentalTooltip: "Tablecloth rental is added to the total price.",
    napkinsTooltip: "We offer napkins for an additional fee. You can also bring your own at no cost.",
    candlesTooltip: "We have candles available on-site for an additional fee. You can also bring your own candles at no cost.",

    // Notes
    notesTitle: "Notes and questions",
    notesSubtitle: "Is there anything special we should know about your event?",
    notesPlaceholder:
      "Write here all comments, special requests, questions or anything else we should know...",
    characters: "characters",
    optional: "optional",

    // Review
    reviewTitle: "Booking Review",
    reviewSubtitle: "Please review the information before confirming",
    reviewReadyTitle: "Ready to confirm?",
    reviewReadyMessage: "We will contact you shortly to finalize the details.",
    contactInfo: "Contact Information",
    name: "Name:",
    phoneLabel: "Phone:",
    companyLabel: "Company / organization:",
    kennitalaLabel: "National ID:",
    services: "Services",
    selectedServices: "Selected services:",
    noServicesSelected: "No services selected",
    foodLabel: "Food:",
    drinksLabel: "Drinks:",
    preOrder: "Pre-order:",
    specialRequestsLabel: "Special requests:",
    eventManager: "Event manager:",
    confirmations: "Confirmations:",
    staffCostConfirmed: "Staff cost acknowledgment confirmed",
    alcoholRuleConfirmed: "Alcohol policy confirmed",

    // Booking detail page
    bookingTitle: "Booking",
    sendComment: "Send Comment",
    addComment: "Add comment",
    editComment: "Edit comment",
    commentLabel: "Comment",
    commentPlaceholder: "Write your comment here...",
    internalNote: "Internal note (only visible to admins)",
    cancel: "Cancel",
    send: "Send",
    sending: "Sending...",
    register: "Register",
    tableclothLabel: "Tablecloths",
    whiteTablecloths: "White tablecloths",
    blackTablecloths: "Black tablecloths",
    rent: "Rent",
    notRenting: "Not renting",
    napkins: "Napkins",
    candles: "Candles",
    notifyCustomerChange: "Notify customer of change?",

    eventDetails: "Event Details",
    guests: "Guests:",
    dateTime: "Date and time:",
    eventType: "Event type:",
    roomSetup: "Room setup:",
    tablecloth: "Table settings:",
    notSelected: "Not selected",
    notRentingTablecloths: "Not renting tablecloths",
    techAndMusic: "Technology and Music",
    djOnSiteLabel: "DJ on site:",
    djBringsControllerLabel: "DJ with own controller:",
    needsMicrophoneLabel: "Microphone:",
    liveBandLabel: "Live band:",
    useProjectorLabel: "Projector:",
    useLightsLabel: "Lights and disco ball:",
    equipmentBroughtLabel: "Equipment to be brought:",
    notes: "Notes",
    notesLabel: "Notes:",
    tablecloths: "Tablecloths:",
    napkins: "Napkins:",
    candles: "Candles:",
    date: "Date:",
    startTime: "Start time:",
    endTime: "End time:",
    earlyAccess: "Early access for setup:",
    setupTime: "Setup time:",

    // Error handling
    submitError:
      "An error occurred while submitting the booking. Please try again.",
    errorTitle: "An error occurred",
    retry: "Try again",

    // Success screen
    successTitle: "Booking submitted!",
    successMessage: "We will contact you within 48 hours.",
    referenceId: "Booking reference:",
    backToHome: "Back to home",
    nextSteps: "Next steps:",
    receivedInfo: "We have received your information",
    willContact: "Contact you shortly",
    finalizeDetails: "Finalize the last details",
    viewBooking: "View Booking",
    questionsContact: "Questions? Contact us at",

    // Progress
    progressLabel: "Booking process: step",
    of: "of",
  },
};

export function useTranslations() {
  const { language } = useLanguage();

  const t = (key, params = {}) => {
    const lang = language || "is";
    let translation = translations[lang]?.[key] || key;

    // Simple parameter replacement
    Object.keys(params).forEach((param) => {
      translation = translation.replace(`{{${param}}}`, params[param]);
    });

    return translation;
  };

  return { t, language };
}
