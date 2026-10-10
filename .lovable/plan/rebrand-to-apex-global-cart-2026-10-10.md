# Rebrand to Apex Global Cart

## What changes
1. **Logo**
   - Cut the uploaded logo out of its dark rounded tile so it sits on a transparent background. The mountain, the globe, the cart, the name and the "Commerce at its peak" tagline all stay.
   - Make two versions: the full logo (picture plus name) and the picture alone for small spots.
   - Use them in the shop's header and footer, the reseller and admin sign-in pages, and the sidebars.
   - Make a new browser tab icon and phone app icons from the picture alone.

2. **Brand name**
   - Replace "Global Cart" with "Apex Global Cart" wherever people see it:
     - Page titles and link previews
     - Header, footer and sign-in screens
     - Policy, About, FAQ and Contact pages
     - English wording, emails shown on screen, and the app-install name
   - The website address, globalcart-onlineshop.com, stays the same.
   - Saved data, such as admin IDs, also stays the same.

3. **Site colors, taken from the logo**
   - Main color (buttons, links): logo blue
   - Second color (highlights, VIP and badges): logo gold
   - Accents: logo orange for sale and deals tags, and logo green for success and cart
   - Dark areas (dark mode, sidebars, footer): the logo's deep navy
   - Light mode keeps a clean white background with navy text.
   - The seasonal campaign themes keep working on top of the new colors.

## Technical details
- Remove the background with the image editor, set to a transparent PNG, from user-uploads://IMG_20261010_072643_878.jpg.
- Save the logo files in `src/assets/brand/`. Make the favicon and PWA icons by resizing into `public/` and `public/brand/`.
- Update `LogoFull`, `LogoIcon` and `LogoWordmark` to show the new images, leaving every place that uses them unchanged.
- Update `src/lib/brand-metadata.ts`, the route `head()` titles, `SEO.tsx`, `en.json`, and `manifest*.json` (name and theme_color).
- Rewrite the color variables in `src/styles.css`, light and dark: `--primary` blue, `--secondary` gold, plus new `--brand-orange` and `--brand-green` tokens, navy `--sidebar` and dark `--background`. Map each one through `@theme inline`.
- Search for hardcoded green or gold classes left over from the old palette and switch them to the new tokens.
- Save the brand colors and name to project memory.
- Check the shop, reseller and admin pages in a test browser in both light and dark mode.
