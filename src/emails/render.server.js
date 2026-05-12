// Server-only helper for rendering email templates to HTML/text strings
// that can be passed straight to Resend.
//
// Usage from any route handler / lib sender:
//
//   import { renderEmail } from "@/emails/render.server";
//
//   const { html, text, subject } = await renderEmail(
//     "password-reset-request",
//     { resetLink, expiresInHours: 24 },
//   );
//   await resend.emails.send({ from, to, subject, html, text });
//
// The id matches the manifest entry (and TEMPLATE_LOADERS key). The template's
// own `.subject` static is returned as a default — callers may override.
//
// Why a helper:
//   1. Centralises the React + render() boilerplate so every route looks the same.
//   2. One place to swap `pretty: false` / plainText settings if we ever want to.
//   3. Keeps "server-only" sentinel attached so this can never reach the client.

import "server-only";
import React from "react";
import { render } from "@react-email/render";
import { TEMPLATE_LOADERS } from "./templates.server";

/**
 * Render a templated email by manifest id.
 *
 * @param {string} id     - The manifest id (e.g. "welcome-tribe").
 * @param {object} props  - Props passed to the template component.
 * @returns {Promise<{ html: string, text: string, subject: string|undefined }>}
 */
export async function renderEmail(id, props = {}) {
  const loader = TEMPLATE_LOADERS[id];
  if (!loader) {
    throw new Error(
      `[renderEmail] Unknown template id: "${id}". ` +
        `Add it to TEMPLATE_LOADERS in src/emails/templates.server.js.`,
    );
  }
  const mod = await loader();
  const Component = mod.default;
  const element = React.createElement(Component, props);

  // Render HTML and plain-text in parallel — both are cheap.
  const [html, text] = await Promise.all([
    render(element, { pretty: false }),
    render(element, { plainText: true }),
  ]);

  return {
    html,
    text,
    subject: typeof Component.subject === "string" ? Component.subject : undefined,
  };
}
