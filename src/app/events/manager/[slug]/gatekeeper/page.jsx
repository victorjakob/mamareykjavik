// Server shell — just mounts the client-side orchestrator. All interactive
// state lives in GatekeeperApp. Access control for the kiosk is enforced
// on every API call server-side; the client also short-circuits if the
// session isn't a manager. Treat the server here as a wrapper.

import GatekeeperApp from "./components/GatekeeperApp";

export default async function GatekeeperPage({ params }) {
  const { slug } = await params;
  return <GatekeeperApp slug={slug} />;
}
