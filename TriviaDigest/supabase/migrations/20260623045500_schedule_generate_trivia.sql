create extension if not exists pg_cron;
create extension if not exists pg_net;

-- One-time manual step (run once in the SQL editor, do NOT commit the key):
--   select vault.create_secret('<service-role-key>', 'service_role_key');

select cron.schedule(
  'generate-daily-trivia',
  '0 6 * * *',
  $$
  select net.http_post(
    url     := 'https://avowxobephfnjcqkodiy.supabase.co/functions/v1/generate-trivia',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apiKey', (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body    := '{}'::jsonb
  );
  $$
);
