// Weekly letter — default copy. THE one place these strings live.
// ─────────────────────────────────────────────────────────────────
// Every default word in the Monday letter is defined here and nowhere else:
// the subject, the two masthead lines, the preheader, and the two intro
// notes. Change a string here and it changes everywhere — the cron that
// creates the draft, the editor's placeholders, the admin dashboard, the
// broadcast sender, the /admin/email preview.
//
// This file is deliberately plain JavaScript with NO imports and NO
// "server-only" sentinel, so client components (the draft editor,
// /admin/subscribers) can import it just as freely as server routes. That's
// the whole point: the renderer (newsletter-template.js) is server-only, so
// anything defined in there is invisible to the browser and tempts people
// into re-typing the string. Nothing that the UI might need to display
// belongs in the renderer — put it here.
//
// These are DEFAULTS, not the final copy: every one of them is editable per
// draft at /newsletters/[draftId] and stored on the newsletter_drafts row.

/** Email subject. The letter is sent on Monday but covers the whole coming
 *  week, so it's "this week", not "this Monday". */
export const DEFAULT_SUBJECT = "This week at Mama";

/** Inbox preview text, shown next to the subject in most mail clients. */
export const DEFAULT_PREHEADER =
  "A small letter from our table at Bankastræti 2.";

/** Small orange all-caps line under the Mama · REYKJAVÍK masthead. */
export const DEFAULT_HEADER_KICKER = "THIS WEEK";

/** Large serif italic line under the kicker. Names the room the events are
 *  held in — the brand is already printed directly above it. */
export const DEFAULT_HEADER_TITLE = "@White Lotus";

/** Intro paragraph when the week has events. \n renders as a line break. */
export const DEFAULT_INTRO =
  "Music, cacao, workshops. Here is what is coming up\nat Bankastræti 2 this week.";

/** Intro paragraph when there are no events in the window. */
export const QUIET_INTRO =
  "Quiet week ahead. The kitchen is warm and the door is open. Come for what calls you.";
