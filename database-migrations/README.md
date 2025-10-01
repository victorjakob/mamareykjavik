# Auto-Credit Subscriptions Setup

## Database Setup ✅ COMPLETED

The `auto_credit_subscriptions` table has been successfully created in your Supabase database with the following structure:

- `id` (UUID, primary key)
- `email` (text, unique)
- `monthly_amount` (integer)
- `description` (text, optional)
- `is_active` (boolean, default true)
- `next_payment_date` (timestamptz)
- `last_payment_date` (timestamptz, optional)
- `created_at` and `updated_at` timestamps

## Environment Variables

Add this environment variable to your `.env.local` file:

```bash
CRON_SECRET=your-secret-key-here
```

This secret is used to secure the cron endpoint. Make sure to use a strong, random string.

## Vercel Deployment

The `vercel.json` file has been created with the cron job configuration:

- **Schedule**: Runs on the 1st of every month at midnight UTC (`0 0 1 * *`)
- **Endpoint**: `/api/cron/process-monthly-credits`

## How It Works

1. **Admin creates subscription**: Go to `/admin/work-credit` and use the "Auto-Credit Subscriptions" section
2. **Monthly processing**: The cron job runs automatically on the 1st of each month
3. **Credit addition**: Credits are automatically added to user accounts
4. **History tracking**: All auto-credits are logged in the work_credit_history table

## Testing

In development, you can test the cron endpoint by making a GET request to:

```
GET /api/cron/process-monthly-credits
```

**Note**: This only works in development mode for security reasons.

## Features

- ✅ Create monthly auto-credit subscriptions
- ✅ Edit subscription amounts and descriptions
- ✅ Activate/deactivate subscriptions
- ✅ Delete subscriptions
- ✅ Automatic monthly processing
- ✅ Complete audit trail
- ✅ Admin-only access control
