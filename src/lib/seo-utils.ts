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

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength).trimEnd();
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

