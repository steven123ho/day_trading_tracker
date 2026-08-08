-- Run this in the Supabase SQL Editor to migrate anonymous/placeholder data to a real account.
-- This runs as the postgres service role, so it bypasses RLS policies.

-- 1. First, find the old placeholder user_id that was used for your existing data.
--    Run this query, note the user_id value that has your trades.
--    (If you see multiple user_ids, you may already have real accounts, and you only want the placeholder one.)
select user_id, count(*) from trades group by user_id;

-- 2. Sign up for a new account in the app, then find your new user_id in the Supabase dashboard.
--    Go to Authentication → Users, click the user, and copy the UUID.

-- 3. Replace the two UUIDs below with the old placeholder id and your new user id.
DO $$
DECLARE
  old_user_id uuid := '00000000-0000-0000-0000-000000000000';
  new_user_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  UPDATE accounts SET user_id = new_user_id WHERE user_id = old_user_id;
  UPDATE strategies SET user_id = new_user_id WHERE user_id = old_user_id;
  UPDATE trades SET user_id = new_user_id WHERE user_id = old_user_id;
  UPDATE trade_images SET user_id = new_user_id WHERE user_id = old_user_id;
  UPDATE sticky_notes SET user_id = new_user_id WHERE user_id = old_user_id;

  -- Move rules and any saved theme from the old anonymous profile to the new one.
  -- This will fail if the new account already has a profiles row, so only run it when the new row is empty.
  UPDATE profiles SET id = new_user_id WHERE id = old_user_id;
END $$;



-- Your existing data is still in the Supabase tables — it was probably saved under a placeholder user_id from the old flow. Since the new per-user setup requires a real auth.users id, you need to reassign those rows to your new account.

-- I created migrate_anon_to_user.sql for this. Steps:

-- Run the discovery query at the top to find the placeholder user_id that owns your existing data.
-- Sign up in the app to create a real account, then grab that new user_id from Supabase Authentication → Users.
-- Replace the two placeholder UUIDs in the file with your old and new IDs.
-- Run the whole file in the Supabase SQL Editor.
-- It updates accounts, strategies, trades, trade_images, sticky_notes, and profiles so the records belong to your new user. The SQL editor runs as postgres, so it bypasses RLS while you do the migration.