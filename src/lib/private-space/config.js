// Launch/discovery controls for The Private Space.
//
// Keep direct URLs usable for internal testing before launch, but suppress
// public discovery surfaces (homepage cards, SEO indexing, product schema)
// until the space is ready.

export const PRIVATE_SPACE_IS_LIVE = false;

export const PRIVATE_SPACE_DISCOVERY = {
  showOnHomepage: PRIVATE_SPACE_IS_LIVE,
  allowIndexing: PRIVATE_SPACE_IS_LIVE,
  enableStructuredData: PRIVATE_SPACE_IS_LIVE,
};

export function getPrivateSpaceRobots() {
  if (PRIVATE_SPACE_DISCOVERY.allowIndexing) {
    return { index: true, follow: true };
  }

  return {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  };
}
