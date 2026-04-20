// Dedicated kiosk layout for the Gatekeeper tool. No profile hero, no
// navbar, no footer — just a full-bleed neutral stage so the kiosk
// feels like its own app when mounted on a tablet at the door.
//
// The actual hiding of navbar/footer is handled in DarkNavbar.jsx /
// Footer.js by path matching. This layout replaces the EventManagerShell
// (which would otherwise inject the ProfileHero + PageBackground).

import "./gatekeeper.css";

export const metadata = {
  title: "Gatekeeper · Mama Reykjavik",
  robots: { index: false, follow: false },
};

// Opt the route out of the /events/manager shell chrome.
export default function GatekeeperLayout({ children }) {
  return (
    <div className="gatekeeper-root" data-navbar-theme="light">
      {children}
    </div>
  );
}
