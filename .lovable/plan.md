# Google and Apple sign-in (plan only)

## Goal
Let shoppers and resellers sign up and sign in with Google or Apple, alongside the current email and password option. The admin portal keeps email and password only, so the Owner 2-device limit and admin security stay as they are.

## What users will see
- "Continue with Google" and "Continue with Apple" buttons on the shop sign-in and sign-up pages, and on the reseller sign-in and registration pages.
- First-time Google or Apple users get an account created for them automatically. A new reseller then sees a short "Complete your shop" step (shop name, phone, referral or admin code) before reaching the dashboard.
- If someone already has an email account with the same address, they are linked to it, not given a second account.

## Setup you will need to do (outside the app)
1. **Google**: in Google Cloud Console, create an OAuth client (Web). Add the Supabase callback address `https://hreotqowulxpchyxjlai.supabase.co/auth/v1/callback`. Paste the Client ID and secret into Supabase Dashboard -> Authentication -> Providers -> Google.
2. **Apple**: needs a paid Apple Developer account. Create a Services ID, a Sign in with Apple key and your domain verification. Paste them into Supabase -> Providers -> Apple.
3. In Supabase -> Authentication -> URL configuration, add these allowed return addresses: globalcart-onlineshop.com, reseller.globalcart-onlineshop.com, the preview address and the Netlify address.

## Build steps (once approved)
1. Add a shared "social sign-in buttons" piece using the brand styling.
2. Wire the buttons to Supabase's Google and Apple sign-in, returning to a new `/auth/callback` page.
3. The callback page finishes sign-in and checks the account type:
   - Shop customer: create a customer profile if missing, then go to the shop.
   - Reseller: if no reseller profile exists yet, show "Complete your shop", then create the reseller profile and retail shop the same way email registration does today.
4. Block Google and Apple accounts from the admin portal, with a clear message.
5. Make sure subdomain sign-ins (reseller.) return to the right portal.
6. Test in a browser: new Google user, returning user, existing email user, and admin block.

## Technical details
- Uses `supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })` with the current host's origin, so it works for each subdomain.
- New route `src/routes/auth.callback.tsx`; the reseller setup reuses the current registration service logic.
- An intended portal ("shop" or "reseller") is passed in the return address so the callback knows which profile to create.
- No database structure changes expected; existing `users`, `reseller_profiles` and `retail_shops` tables are reused.
- Supabase links accounts with the same verified email automatically.

## Open questions
- Should Apple be included now (it needs the paid developer account), or start with Google only?
- Should resellers who sign up with Google still need an admin or referral code?
