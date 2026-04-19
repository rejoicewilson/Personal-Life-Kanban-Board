Backend reminder setup

1. Generate VAPID keys once:
   npx web-push generate-vapid-keys

2. Add the public key to the frontend .env:
   VITE_VAPID_PUBLIC_KEY=<your public key>

3. Set these Supabase function secrets:
   SUPABASE_URL=<your Supabase URL>
   SUPABASE_SERVICE_ROLE_KEY=<service role key>
   VAPID_SUBJECT=mailto:you@example.com
   VAPID_PUBLIC_KEY=<your public key>
   VAPID_PRIVATE_KEY=<your private key>

4. Deploy the function:
   supabase functions deploy send-reminders

5. Schedule it to run every minute:
   supabase functions schedule create send-reminders-job --cron "* * * * *" --function send-reminders

6. Re-run supabase/schema.sql so the push_subscriptions table exists.

The reminder flow is:
- user enables reminder on a task
- browser creates a push subscription
- subscription is stored in public.push_subscriptions
- the scheduled edge function finds due tasks
- the function sends web push notifications
- the task gets reminder_sent_at updated
