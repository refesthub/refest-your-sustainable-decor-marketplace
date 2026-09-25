# ReFest v1 — styled to match the logo

## Look and feel (taken from the logo)
- Background: warm cream #FBF6E9, cards a lighter cream #FFFCF3
- Primary: deep olive green #3E5A2A (buttons, headings, links)
- Accent: marigold #F2B632 (tags, badges, bullet dots, highlights)
- Soft earth tones for borders and muted text (#E6DCC4, #6B6F5A)
- Headings in Baloo 2 (rounded, friendly, like the "ReFest" lettering); body text in Quicksand (like the tagline)
- Rounded corners, thin olive outline circles, and marigold dot separators ("Reuse • Rent • Resell")
- The uploaded logo is used in the header, on the sign-in page, and as the browser tab icon

## Launch features (in priority order)
1. Sign in (email + Google)
2. Post a listing: title, photos, category, type (Sell / Rent / Exchange / Donate), price, city (Pune / Mumbai), area, condition, WhatsApp/Telegram contact
3. Browse listings: home page grid with type tabs
4. Search and filters: keyword, type, city, category, price range
5. Listing detail with "Chat on WhatsApp" / "Message on Telegram" buttons
6. Admin approval: new listings stay hidden until an admin approves them; admin page to approve or reject
7. "My listings" page showing each listing's status

## Pages
Home (hero + filters + grid), Listing detail, Post listing, My listings, Sign in, Admin review.

## Technical details
- Color tokens in oklch in src/styles.css; fonts loaded via link tags in __root
- Logo stored as a CDN asset; favicon made from a square crop in public/
- Database: profiles, listings (status pending/approved/rejected), listing photos in a storage bucket, user_roles + has_role for admin; public can read only approved listings
