# Spring Bank Website Activity Log

Date: 2026-04-07T22:16:34+01:00
Project: `springbank-website`
Branch: `main`

## Activities Completed

1. Confirmed the project is a Next.js App Router application.
2. Verified CSP is enforced from `middleware.ts`, not `next.config.ts`.
3. Reproduced a local production build and inspected the rendered HTML/CSP headers.
4. Identified custom inline scripts in `public/legacy/index.html` as CSP-sensitive runtime behavior.
5. Removed the homepage inline stats loader script from `public/legacy/index.html`.
6. Removed the homepage inline newsletter form script from `public/legacy/index.html`.
7. Moved both behaviors into the external bundle `public/legacy/main.js`.
8. Rebuilt the project successfully with `npm run build`.
9. Verified local production HTML now relies on `/legacy/main.js` instead of those custom inline homepage scripts.

## Files Changed

- `public/legacy/index.html`
- `public/legacy/main.js`
- `ACTIVITY_LOG_2026-04-07.md`

## Notes

- `google089629b9ab9d4e6a.html` was already present as an untracked file in the repo root.
- Home page custom inline scripts were removed to avoid CSP nonce fragility.
- Next.js internal hydration scripts remain framework-managed.

## Top-Level Project Inventory

- `.env`
- `.env.development.local`
- `.env.example`
- `.env.local`
- `.git`
- `.github`
- `.gitignore`
- `.next`
- `.vercel`
- `404.html`
- `README.md`
- `about.html`
- `api`
- `app`
- `atm-branch.html`
- `auto-fix-next15.sh`
- `business.html`
- `contact.html`
- `demo2.html`
- `deploy.sh`
- `es`
- `google089629b9ab9d4e6a.html`
- `help.html`
- `index.html`
- `lib`
- `main.js`
- `main.min.js`
- `middleware.ts`
- `netlify.toml`
- `next-env.d.ts`
- `next.config.ts`
- `node_modules`
- `npm-audit.json`
- `package-lock.json`
- `package.json`
- `prisma`
- `privacy.html`
- `public`
- `robots.txt`
- `scripts`
- `security.html`
- `signin.css`
- `signin.html`
- `signin.min.css`
- `sitemap.xml`
- `springbank-website@2.0.0`
- `styles.css`
- `styles.min.css`
- `terms.html`
- `trufflehog-results.json`
- `tsconfig.json`
- `types`
- `types.d.ts`
- `vercel.json`
