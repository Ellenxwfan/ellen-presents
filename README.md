# Ellen Presents

Marketing site for Ellen Presents — a boutique corporate events firm in the
San Francisco Bay Area, working with venture capital and private equity firms,
family offices, and professional services companies.

A static, five-page site. No build step, no dependencies, no framework — open
`index.html` in a browser and it runs.

## Structure

```
index.html          Home
services.html       Services
experience.html     Selected Experience
about.html          About
request.html        Enquiry form
assets/css/site.css Shared stylesheet (palette, type, layout, responsive rules)
assets/js/site.js   Shared behaviour (mobile nav, footer year, form validation)
```

Every page carries the same header and footer markup inline. There is no
templating layer, so a change to the nav or footer needs to be made in all
five files.

## Local preview

Opening the files directly works. To serve them over HTTP instead:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying

The site is plain static files, so any static host works — GitHub Pages,
Netlify, Cloudflare Pages, S3 + CloudFront.

For GitHub Pages: repository **Settings → Pages → Build and deployment**,
source **Deploy from a branch**, and pick this branch with folder `/ (root)`.
The `.nojekyll` file stops Pages from running the files through Jekyll.

## Wiring up the enquiry form

The form on `request.html` validates in the browser, but a static site has no
server to post to. Until a backend is connected, a valid submission opens the
visitor's mail client with every field already composed into a message to
`hello@ellenpresents.com`, and the on-page status repeats that address so an
enquiry is never silently lost when no mail client is configured.

To connect a real form service (Formspree, Getform, Basin, or similar):

1. Add the endpoint as the form's `action` in `request.html` and set
   `method="post"`.
2. In `assets/js/site.js`, replace the `window.location.href = compose();`
   line at the end of the submit handler with a `fetch()` POST to that
   endpoint, and show the success or failure message in `#formStatus`.

Keep the validation block above it — it is what populates the inline field
errors and the `aria-invalid` states.

## Content and brand notes

- **Palette** is drawn from the logo: a cream field as the ground, navy as
  ink, a lighter navy as the interactive accent, and aged brass reserved for
  small uppercase labels. The site is deliberately light-only — it is a brand
  surface, and the brand is light. Colors are painted explicitly so the page
  does not borrow a viewer's dark theme.
- **Type** is EB Garamond for display and Libre Franklin for text, loaded from
  Google Fonts with local serif/sans fallbacks.
- **The wordmark** in the header is set in type rather than as artwork. To use
  the full monogram, replace the two `<span>`s inside `.brand` with an `<img>`
  or inline `<svg>`; the surrounding CSS already reserves the right space.
- **Client names are withheld** throughout, by design. `experience.html`
  describes programs by type, location, and scope only.
