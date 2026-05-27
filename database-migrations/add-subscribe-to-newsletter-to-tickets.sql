-- Add subscribe_to_newsletter to tickets so the soft opt-in checkbox at
-- checkout can travel with the ticket through the SaltPay redirect and be
-- read by the success-server callback.
--
-- Defaults to false so historical rows behave as if the box were unticked.

alter table public.tickets
  add column if not exists subscribe_to_newsletter boolean not null default false;

comment on column public.tickets.subscribe_to_newsletter is
  'Captured at checkout: did the buyer keep the "weekly Mama letter" box ticked? If true and the payment succeeds, enrolAndWelcome runs in the success route.';
