# CleanBooks Dashboards + Admin Portal

The authenticated part of the CleanBooks website: the Dashboards subpage clients use, and
the Admin Portal CleanBooks staff use to onboard clients and govern dashboard access.
Talks to [cleanbooks-api](https://github.com/ManjuKB182/cleanbooks-api). The rest of the
site (marketing pages) is unchanged, in the repo root.

See the approved design doc for the full architecture and rollout plan.

## Local setup

Requires [cleanbooks-api](https://github.com/ManjuKB182/cleanbooks-api) running locally
on port 8000 first (`uvicorn app.main:app --reload`) — Vite proxies `/api` and `/health`
to it in dev (see `vite.config.ts`).

```bash
npm install
npm run dev       # http://localhost:5173
```

`npm run build` type-checks and produces `dist/`. `npm run lint` runs oxlint.

## Routes

- `/login` — email/password, JWT stored in localStorage
- `/dashboards` — the 5-dashboard catalog, filtered to what's enabled for the signed-in
  client. Staff admin accounts land here too but are pointed to Admin instead (dashboards
  belong to a client, not to staff).
- `/dashboards/pod` — the only dashboard wired to real data so far
- `/dashboards/{reconciliation,invoices,returns,cash-flow}` — placeholders; enabled once
  their backend parser exists (see cleanbooks-api's `ingestion/transform/`)
- `/admin` — client list (staff admin only)
- `/admin/clients/new` — onboarding step 1: create the client record
- `/admin/clients/:id` — Gmail connection status/"Connect Gmail", and the dashboard access
  matrix

## What's real vs. stubbed right now

- **Working end-to-end** (verified against a live local backend): login, the dashboard
  access model, client onboarding, access toggling, and the Gmail OAuth "Connect" button
  (correctly redirects to Google — fails there only because no
  `GOOGLE_OAUTH_CLIENT_ID` is configured yet).
- **Not built**: a staff-admin view of a client's own dashboards (e.g. for support/QA)
  — right now only the client themselves can view their dashboards. Revisit once there's
  a real need.
- **Hosting**: not yet chosen. `dist/` needs to be served with SPA fallback (any path
  under `/dashboards` or `/admin` that isn't a static file should serve `index.html`) —
  see `app-ci.yml`, which currently only builds/lints and does not deploy.
