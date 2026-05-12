// Markdown renderer for the /private-session feature. Works in both server
// and client trees (react-markdown has no node-only deps), so the picker can
// preview formatted bios without splitting into two components.
//
// Styling stays inline (no @tailwindcss/typography needed): we hand-style the
// children with the same palette as the rest of the feature. This intentionally
// matches the warm dark theme; do NOT add prose- classes here unless the rest
// of the site adopts them too.

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components = {
  p: ({ children }) => (
    <p className="text-[#d8cfc1] text-base md:text-lg leading-relaxed">{children}</p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-[#ff914d] underline decoration-[#ff914d]/40 underline-offset-2 hover:decoration-[#ff914d]/80 transition"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="text-[#f0ebe3] font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="space-y-2 text-[#d8cfc1] text-base md:text-lg leading-relaxed list-disc list-outside pl-5 marker:text-[#ff914d]/60">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="space-y-2 text-[#d8cfc1] text-base md:text-lg leading-relaxed list-decimal list-outside pl-5 marker:text-[#ff914d]/60">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => (
    <h2 className="font-cormorant text-3xl md:text-4xl italic text-[#f0ebe3] mt-2 mb-3">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h3 className="font-cormorant text-2xl md:text-3xl italic text-[#f0ebe3] mt-2 mb-3">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="font-cormorant text-xl md:text-2xl italic text-[#ff914d] mt-2 mb-2">
      {children}
    </h4>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[#ff914d]/40 pl-4 italic text-[#a09488]">
      {children}
    </blockquote>
  ),
  code: ({ children, inline }) =>
    inline ? (
      <code className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[#f0ebe3] text-sm font-mono">
        {children}
      </code>
    ) : (
      <pre className="overflow-x-auto rounded-lg bg-white/[0.04] border border-white/[0.06] p-4 text-sm text-[#d8cfc1] font-mono">
        <code>{children}</code>
      </pre>
    ),
  hr: () => <hr className="border-white/[0.06]" />,
};

export default function Markdown({ children, className = "" }) {
  if (!children) return null;
  return (
    <div className={`space-y-5 ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
