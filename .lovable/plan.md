# Clone the database into Lovable's built-in database

## Key point
Nothing is deleted from your current Supabase database (gcos-v3). This project and your live Netlify site keep using it, exactly as they do today. The copy goes into a **new copy of this Lovable project** that runs on Lovable's built-in database. This project can't switch over itself, because it is tied to your own Supabase account.

## What you do first (about 2 minutes)
1. Open the project name (top left) -> Settings -> **Remix this project**.
2. In the new copy, ask me to "turn on the built-in database and run the clone plan". I can read this project's files from there.

## What I do in the new copy
1. **Turn on the built-in database** there.
2. **Recreate the structure:** all 23 tables, the security rules, the admin, staff and Owner checks, the security page functions and the VIP and balance logic.
3. **Copy the data:** every row from all tables, in the right order so links between orders, resellers and shops stay intact. I'll check the row counts against the original, for example 1,153 products, 755 orders and 307 resellers.
4. **Copy the files:** product photos, logos, banners and payment screenshots move from the "uploads" storage into the new storage, and their links are updated.
5. **Copy the accounts:** every person keeps their account, profile, role, balances and history.
6. **Point the copy's app at the new database.** Netlify isn't touched.
7. **Test** in a browser: shop, reseller sign-in, admin and Owner sign-in, and one deposit and order flow.

## Passwords
Old passwords can't be copied into the built-in database. The first time someone signs in to the copy, they confirm their email and choose a new password, and then they see all their old data. Once Google sign-in is added there, a user with the same Gmail address can just tap "Continue with Google" instead.

## After that
- **Google sign-in** (the plan you already approved) is built and tested in the copy, safely away from the live site.
- **Going live later:** when you're happy, I copy over the latest live data once more, then you point Netlify at the copy. Until then, the two databases don't stay in sync.

## Technical details
- Export uses the service role key of gcos-v3 (already stored), read-only, writing CSVs to /tmp, with credential fields filtered out.
- Schema from supabase/migrations plus the current table list; grants and RLS added per table.
- Original user IDs are kept through an ID mapping table, so the reseller, shop and order links still work.
- Admin audit logs (100k rows) are copied last and can be skipped if you want.
