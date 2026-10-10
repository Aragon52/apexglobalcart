# Google sign-in for all portals (plan only)

## Goal

Everyone can register or sign in with "Continue with Google" or with email and password, on the shop, the reseller portal and the admin portal. There is no Apple sign-in.

## What users will see

- A "Continue with Google" button above the email form on every sign-in and sign-up page: the shop, the reseller portal and the admin portal.
- **Shop customers:** a first-time Google user gets a customer account straight away.
- **Resellers:** a first-time Google user sees a short "Complete your shop" step (shop name, phone, admin or referral code) before reaching the dashboard.
- If possible I would like to hide the referral code box and make sure it's prefilled with the respective admin's referral code. If there is someone who come without a referral link, show unknown errors and can't register at this moment 
- **Admin portal:** Google only works for people who are already admins or staff. Nobody can become an admin by signing in with Google. The Owner 2-device limit still applies to Google sign-ins.
- **Existing users:** anyone who already has an email account can use Google with the same address. They reach the same account, not a second one.

## Setup you will need to do (outside the app)

1. In Google Cloud Console, create an OAuth client of type Web application. Add `https://hreotqowulxpchyxjlai.supabase.co/auth/v1/callback` as the redirect address.
2. In the Supabase Dashboard, go to Authentication -> Providers -> Google. Turn it on and paste the Client ID and secret.
3. In Supabase, go to Authentication -> URL configuration. Allow these return addresses: globalcart-onlineshop.com, reseller.globalcart-onlineshop.com, admin.globalcart-onlineshop.com, your Netlify address and the preview address.

-  I would like to proceed the implementation only when database is separated from current supabase project because if I change the set up in current database, it will goes wrong in current live site on Netlify 

## Build steps (once approved)

1. Add a shared "Continue with Google" button in the brand style.
2. Put the button on the shop, reseller and admin sign-in and sign-up pages.
3. Add a public `/auth/callback` page that finishes sign-in and sends each person on by portal:
  - Shop: create a customer record if missing, then go to the shop.
  - Reseller: if no reseller profile exists, show "Complete your shop", then create the profile and shop using the same logic as email registration.
  - Admin: allow only accounts already listed as admin, staff or Owner, and run the 2-device check. Everyone else is signed out with a clear message.
4. Make sure each subdomain returns to its own portal after Google sign-in.
5. Test in a browser: a new Google user, an existing email user, a Google admin, and a blocked non-admin.

## Technical details

- `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: origin + "/auth/callback?portal=shop|reseller|admin" } })`. This project uses its own Supabase, so it doesn't go through the Lovable broker.
- The callback page validates `portal` against a fixed list and only follows same-origin paths.
- The admin check reuses the existing sla_admins/users lookup and `count_other_active_sessions` in admin-auth-context.
- Supabase links Google to an existing account automatically when the email address is verified.
- No database changes are expected.