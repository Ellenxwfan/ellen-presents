# Ellen Presents

Marketing site for Ellen Presents — boutique corporate events in the San
Francisco Bay Area, for venture capital and private equity firms, family
offices, and professional services companies.

A single static page. No build step, no dependencies, no framework — open
`index.html` in a browser and it runs.

## Structure

```
index.html            English site
zh/index.html         Chinese site
assets/css/site.css   Palette, type, layout, responsive rules
assets/js/site.js     Mobile nav, scroll-spy, footer year, form handling
CNAME                 Custom domain for GitHub Pages
.nojekyll             Stops Pages running the files through Jekyll
```

The page runs in one scroll, with each section carrying the id its nav link
points at:

```
#top          Hero
#services     What We Do — four service cards
#why          Why Us — background, then four rows
#experience   Selected Experience — four programs
#about        About — pull quote and a closing line
#request      Enquiry form
```

Sections set `scroll-margin-top` so a nav jump clears the sticky header; if
the header's height changes, that value in `site.css` has to change with it.
An `IntersectionObserver` in `site.js` marks the nav link for whichever
section is in view.

## Cache busting

Both pages load the stylesheet and script with a `?v=` query string. GitHub
Pages serves assets with a cache lifetime, so a visitor who has been to the
site before keeps the old CSS on an ordinary refresh and sees stale styling
while the HTML is current. **Bump the number in both `index.html` and
`zh/index.html` whenever `site.css` or `site.js` changes**, and the browser
fetches the new file instead of reusing the cached one.

## Local preview

Opening the file directly works. To serve over HTTP instead:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying

Plain static files, so any static host works. For GitHub Pages: repository
**Settings → Pages → Build and deployment**, source **Deploy from a branch**,
`main` with folder `/ (root)`. `CNAME` points the site at ellenpresents.com,
which also needs the four GitHub Pages A records on the apex domain at the
registrar.

## Wiring up the enquiry form

`assets/js/site.js` has one constant that decides where an enquiry goes:

```js
var ENQUIRY_ENDPOINT = '';
```

**Empty** (the current state): a valid submission composes a `mailto:` to
`hello@ellenpresents.com` with every field filled in, and the on-page status
repeats the address so nothing is lost when the visitor has no mail client
configured.

**Set to a URL**: the same submission is POSTed there as JSON instead —
`{name, company, email, eventType, location, date, guests, scope, message,
locale}`, where `locale` is `en` or `zh`. The button disables while it is in
flight, the form clears on success, and a failure falls back to telling the
visitor to email directly. Anything that accepts a JSON POST works:
Formspree, Basin, a Cloudflare Worker fronting Airtable or a CRM.

Nothing else needs to change. Both language versions share this file, and the
status messages follow `<html lang>`.

### Google Sheets via Apps Script

`backend/google-apps-script.gs` is a ready endpoint: it appends each
submission to a sheet and emails a notification. To use it —

1. Create a Google Sheet and name the first tab `Enquiries`.
2. **Extensions -> Apps Script**, replace the stub with that file, and set
   `NOTIFY_TO` to the address that should hear about enquiries.
3. **Deploy -> New deployment -> Web app**, with *Execute as: Me* and
   *Who has access: **Anyone***. The site posts anonymously, so anything
   narrower rejects every enquiry.
4. Paste the `/exec` URL into `ENQUIRY_ENDPOINT` and bump `?v=` on both pages.

Re-deploy as a **new version** after editing the script; an existing
deployment keeps serving the old code, which makes edits look as though they
did nothing.

Apps Script cannot answer a CORS preflight, and an `application/json` body
triggers one. `site.js` therefore sends the same JSON as `text/plain` when
the endpoint is on `script.google.com`, which skips the preflight; the script
parses the raw body either way. Nothing needs configuring for this.

### Spam

Each form carries a hidden `website` field, positioned off-screen rather than
`display:none`, which some bots check for. A real visitor never sees it and
cannot tab into it. If it comes back filled the submission is dropped
silently — the page still says thank you, so the bot has nothing to learn —
and the field is never included in what is posted.

## Content and brand notes

- **Palette** is drawn from the logo: a cream field as the ground, navy as
  ink, a lighter navy as the interactive accent, and aged brass reserved for
  small uppercase labels. The site is deliberately light-only, and colors are
  painted explicitly so the page does not borrow a viewer's dark theme.
- **Type** is EB Garamond for display and Libre Franklin for text, from
  Google Fonts, with local serif/sans fallbacks.
- **The wordmark** in the header is set in type rather than artwork. To use
  the monogram, replace the two `<span>`s inside `.brand` with an `<img>` or
  inline `<svg>`; the surrounding CSS already reserves the space.
- **No personal name and no employer** appears in the copy, by choice. The
  background paragraph under Why Us describes the experience without naming
  anyone, and avoids calling the business a firm, since it is one person.
- **Client names are withheld** throughout. Selected Experience describes
  programs by type, location, and scope only.
