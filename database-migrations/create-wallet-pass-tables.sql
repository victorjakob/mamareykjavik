-- Apple Wallet Pass auto-update support
-- ──────────────────────────────────────
-- Two tables that let our server keep iPhone Wallet passes in sync with
-- the live tribe_cards data:
--
--   1. wallet_pass_devices — every iPhone (or Apple Watch) that has
--      added one of our passes. Identified by the deviceLibraryIdentifier
--      that Apple's iOS sends us, plus the APNs push_token we use to
--      ping it.
--
--   2. wallet_pass_registrations — the (device, pass serial) pairs.
--      One row per "this device is watching this pass." When a tribe
--      card updates server-side, we look up every registration for that
--      serial number, get each device's push token, and POST to Apple's
--      APNs server. iOS then wakes up and re-pulls the latest pass JSON
--      from /api/wallet/v1/passes/{passType}/{serial}.
--
-- We also need an `authentication_token` per tribe_card so that Apple
-- can prove a device is allowed to watch it. The token is generated at
-- card-issue time, embedded in the signed pass.json, and then echoed
-- back by the device in every subsequent web-service request.
--
-- Spec reference:
--   https://developer.apple.com/documentation/walletpasses/adding_a_web_service_to_update_passes
--
-- Idempotent — safe to re-run. Reuses the existing
-- update_tribe_updated_at() trigger function from the tribe-cards
-- migration so no duplicate function definitions.

-- ─── 1. tribe_cards.authentication_token ─────────────────────────────────────
-- Per-card secret. Apple sends it in the Authorization header on every
-- web-service request — we verify it before returning data. Generated
-- at card-issue time using gen_random_uuid().
ALTER TABLE tribe_cards
  ADD COLUMN IF NOT EXISTS authentication_token UUID
    NOT NULL DEFAULT gen_random_uuid();

-- ─── 2. wallet_pass_devices ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallet_pass_devices (
  -- Apple's deviceLibraryIdentifier — opaque, device-private, distinct
  -- per app (Wallet) per device. Primary key.
  device_library_identifier TEXT PRIMARY KEY,

  -- APNs push token for this device. Used in
  -- POST https://api.push.apple.com/3/device/{push_token}
  -- Apple may rotate this on us — overwrite when re-registered.
  push_token TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS wallet_pass_devices_updated_at ON wallet_pass_devices;
CREATE TRIGGER wallet_pass_devices_updated_at
  BEFORE UPDATE ON wallet_pass_devices
  FOR EACH ROW EXECUTE FUNCTION update_tribe_updated_at();

-- ─── 3. wallet_pass_registrations ────────────────────────────────────────────
-- (device, serial) pairs. One device can hold many passes; one pass can
-- be on many devices.
CREATE TABLE IF NOT EXISTS wallet_pass_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  device_library_identifier TEXT NOT NULL
    REFERENCES wallet_pass_devices(device_library_identifier)
    ON DELETE CASCADE,

  -- We only issue one pass type today (pass.is.mama.tribe). Storing it
  -- explicitly future-proofs the schema for if we add eventTicket /
  -- coupon types later.
  pass_type_identifier TEXT NOT NULL,

  -- The pass's serial number = "tribe-{tribe_cards.id}". We look up the
  -- card via this when rendering the latest pass.json on demand.
  serial_number TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_wallet_registration
  ON wallet_pass_registrations(device_library_identifier, pass_type_identifier, serial_number);

CREATE INDEX IF NOT EXISTS idx_wallet_reg_serial
  ON wallet_pass_registrations(pass_type_identifier, serial_number);

CREATE INDEX IF NOT EXISTS idx_wallet_reg_device
  ON wallet_pass_registrations(device_library_identifier);

-- ─── Documentation ───────────────────────────────────────────────────────────
COMMENT ON TABLE  wallet_pass_devices       IS 'iPhone/Apple-Watch devices that have added a Mama wallet pass. Push token used for APNs ping.';
COMMENT ON TABLE  wallet_pass_registrations IS '(device, pass serial) pairs — which devices are watching which passes for updates.';
COMMENT ON COLUMN tribe_cards.authentication_token IS 'Per-card secret embedded in pass.json. Apple sends it back via Authorization header on web-service requests.';
