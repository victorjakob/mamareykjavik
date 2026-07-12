export const META_TITLE_MAX = 60;
export const META_DESCRIPTION_MAX = 155;
export const BRAND_SUFFIX = " | Mama Reykjavik";

type FormatMetadataInput = {
  title?: string;
  description?: string;
  isTicketPage?: boolean;
};

type FormatMetadataResult = {
  title?: string;
  description?: string;
};

const emojiRegex = /\p{Extended_Pictographic}/gu;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripEmojis(value: string) {
  return value.replace(emojiRegex, "");
}

const ELLIPSIS = "…";

/**
 * Truncate at a word boundary, appending an ellipsis.
 * Never cuts mid-word (avoids SERP snippets like "…and community e"
 * or titles like "w/caca | Mama Reykjavik").
 */
function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;

  const sliced = value.slice(0, maxLength - ELLIPSIS.length);
  const lastSpace = sliced.lastIndexOf(" ");
  // Only back up to the word boundary if it doesn't destroy most of the text.
  const base =
    lastSpace > maxLength * 0.5 ? sliced.slice(0, lastSpace) : sliced;

  // Strip trailing punctuation/separators left dangling before the ellipsis.
  return base.replace(/[\s,;:\-–—·|/]+$/g, "") + ELLIPSIS;
}

function formatTitle(rawTitle: string, isTicketPage: boolean) {
  let title = normalizeWhitespace(stripEmojis(rawTitle));

  if (isTicketPage) {
    title = title.replace(/^Tickets for\s+/i, "Tickets: ");
  }

  const hasSuffix = title.endsWith(BRAND_SUFFIX);
  if (!hasSuffix) {
    return truncate(title, META_TITLE_MAX);
  }

  const base = title.slice(0, -BRAND_SUFFIX.length).trim();
  const maxBaseLength = META_TITLE_MAX - BRAND_SUFFIX.length;

  if (maxBaseLength <= 0) {
    return truncate(title, META_TITLE_MAX);
  }

  const truncatedBase = truncate(base, maxBaseLength);
  return `${truncatedBase}${BRAND_SUFFIX}`;
}

function formatDescription(rawDescription: string) {
  const cleaned = normalizeWhitespace(stripEmojis(rawDescription));
  return truncate(cleaned, META_DESCRIPTION_MAX);
}

export function formatMetadata({
  title,
  description,
  isTicketPage = false,
}: FormatMetadataInput): FormatMetadataResult {
  return {
    title: title ? formatTitle(title, isTicketPage) : undefined,
    description: description ? formatDescription(description) : undefined,
  };
}

