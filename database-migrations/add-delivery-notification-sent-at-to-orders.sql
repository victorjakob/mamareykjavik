ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_notification_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.delivery_notification_sent_at IS 'Timestamp when the delivery confirmation email was sent to the buyer.';


