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

The form validates in the browser, but a static site has no server to post
to. Until a backend is connected, a valid submission opens the visitor's mail
client with every field composed into a message to `hello@ellenpresents.com`,
and the on-page status repeats that address so an enquiry is never silently
lost when no mail client is configured.

To connect a form service (Formspree, Getform, Basin, or similar):

1. Add the endpoint as the form's `action` in `index.html` and set
   `method="post"`.
2. In `assets/js/site.js`, replace `window.location.href = compose();` at the
   end of the submit handler with a `fetch()` POST to that endpoint, and show
   the success or failure message in `#formStatus`.

Keep the validation block above it — it populates the inline field errors and
the `aria-invalid` states.

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
