# Verification

Verified on 2026-11-11. The default interface and all 24 media descriptions are English.

## Browser checks

`npm test`: **16 passed**, using Playwright 1.65.0 and Chromium 158.0.8127.18.

- Browse 12 movies, 8 TV shows, 4 documentaries and 20 4K titles.
- Search by title, genre and quality; sort real local results; render search strings as text.
- Open details directly, refresh, and use browser back/forward navigation.
- Submit sign-in by mouse and Enter; immediately show the invitation notice without network activity or credential validation.
- Clear passwords on submission and all input on close; retain no cookies or web storage.
- Keep keyboard focus inside the dialog, including Tab and Shift+Tab; restore focus on Escape.
- Load only same-origin static GET requests, with no API, XHR, fetch, WebSocket or media requests and no console errors.
- Keep 360px, 768px and 1440px layouts free of page overflow; load poster artwork as rows enter view.
- Provide a safe disabled-JavaScript state and usable recovery from unknown routes.

`npm run screenshots`: desktop and mobile screenshots saved under `docs/screenshots/`; inspected visually after the English update.

At 1440 × 1080, a fresh local preview transferred 1,125,797 bytes of subresources, plus the main HTML document: roughly 1.1 MB in total. The three shared WebP assets total 1,067,182 bytes. Measurements are for this bundled catalog, not a promise about later replacement assets.

## Nginx checks

```sh
python3 scripts/check-nginx.py --image nginx:1.27-alpine
```

Both unmodified example templates passed `nginx -t` and live connection checks in disposable containers:

- TLS 1.3 with a trusted temporary test certificate and the configured SNI.
- HTTP/2 ALPN negotiation, including the REALITY template's actual loopback listener.
- Static document root, GET and HEAD responses, CSP and security headers.
- 404 responses for unknown API paths and files outside `site/`.
- 405 responses for POST requests.

No host port was published. Temporary containers and test certificates were removed. These checks verify the supplied Nginx website templates; they do not validate a user's domain certificate, DNS, existing Xray configuration or live deployment.
