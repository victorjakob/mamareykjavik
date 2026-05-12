// ErrorNotification — sent to ERROR_NOTIFICATION_EMAIL when an unhandled
// production error is reported. Replaces inline HTML in
// src/app/api/errors/report/route.js
//
// Voice: technical, terse, urgent. Brand chrome but clearly an alert.
// Stack traces displayed in monospace blocks. Rate-limit warning if applicable.

import { Section } from "@react-email/components";
import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandDataRow from "../_components/BrandDataRow";
import BrandCallout from "../_components/BrandCallout";

function CodeBlock({ children }) {
  return (
    <Section
      style={{
        margin: "14px 0",
        padding: "14px 16px",
        background: "#1f1410",
        borderRadius: "10px",
        border: "1px solid #2c1810",
        overflow: "auto",
        textAlign: "left",
      }}
    >
      <pre
        style={{
          margin: 0,
          color: "#f0ebe3",
          fontSize: "12px",
          lineHeight: 1.5,
          fontFamily: '"SF Mono", Menlo, Consolas, monospace',
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          textAlign: "left",
        }}
      >
        {children}
      </pre>
    </Section>
  );
}

export default function ErrorNotification({
  message = "Unknown error",
  stack = null,
  componentStack = null,
  url = "—",
  userAgent = "—",
  occurrenceCount = 1,
  timestamp = null,
} = {}) {
  const ts = timestamp || new Date().toISOString();

  return (
    <BrandLayout
      preview={`Application error: ${message.slice(0, 60)}`}
      eyebrow="Mama · Error Monitor"
    >
      <BrandHeading size="lg">🚨 Application error.</BrandHeading>

      {occurrenceCount > 1 ? (
        <BrandCallout label="Recurring" tone="warm">
          This error has occurred{" "}
          <strong style={{ color: BRAND.TEXT_DARK }}>{occurrenceCount}×</strong>{" "}
          in the last hour.
        </BrandCallout>
      ) : null}

      <BrandText
        tone="muted"
        align="center"
        style={{
          margin: "0 0 6px",
          fontSize: "10px",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: "#9a1f1f",
        }}
      >
        Error message
      </BrandText>
      <Section
        style={{
          background: "#fdecec",
          border: "1px solid rgba(154,31,31,0.2)",
          borderRadius: "10px",
          padding: "14px 18px",
          margin: "0 0 20px",
          textAlign: "left",
        }}
      >
        <code
          style={{
            color: "#7c1d1d",
            fontFamily: '"SF Mono", Menlo, Consolas, monospace',
            fontSize: "13px",
            wordBreak: "break-word",
          }}
        >
          {message}
        </code>
      </Section>

      {stack ? (
        <>
          <BrandText
            tone="muted"
            align="center"
            style={{
              margin: "0 0 4px",
              fontSize: "10px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Stack trace
          </BrandText>
          <CodeBlock>{stack}</CodeBlock>
        </>
      ) : null}

      {componentStack ? (
        <>
          <BrandText
            tone="muted"
            align="center"
            style={{
              margin: "12px 0 4px",
              fontSize: "10px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Component stack
          </BrandText>
          <CodeBlock>{componentStack}</CodeBlock>
        </>
      ) : null}

      <BrandDataRow label="URL" value={url} mono />
      <BrandDataRow label="Time" value={ts} mono />
      <BrandDataRow label="User agent" value={userAgent} mono />

      <BrandText
        tone="muted"
        align="center"
        style={{ marginTop: "22px", fontSize: "12px" }}
      >
        Check application logs and investigate.
      </BrandText>
    </BrandLayout>
  );
}

ErrorNotification.previewProps = {
  message: "Cannot read properties of undefined (reading 'map')",
  stack: `TypeError: Cannot read properties of undefined (reading 'map')
    at EventList (/app/components/EventList.jsx:42:18)
    at renderWithHooks (/node_modules/react-dom/cjs/react-dom.development.js:14985:18)
    at mountIndeterminateComponent (/node_modules/react-dom/cjs/react-dom.development.js:17811:13)
    at beginWork (/node_modules/react-dom/cjs/react-dom.development.js:19049:16)
    at performUnitOfWork (/node_modules/react-dom/cjs/react-dom.development.js:23906:12)`,
  componentStack: `    at EventList
    at div
    at EventsPage
    at PageWrapper`,
  url: "https://mama.is/events",
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
  occurrenceCount: 2,
  timestamp: "2026-05-09T14:32:18.421Z",
};

ErrorNotification.subject = "🚨 Error: Cannot read properties of undefined (reading 'map')";
