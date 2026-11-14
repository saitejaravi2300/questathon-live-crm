# Questathon Live CRM

An evidence-led Next.js CRM for the two Questathon accounts. The browser never receives the Questathon bearer token.

## Requirements
- Node.js 20+
- A rotated Questathon API token
- A host with a persistent writable disk (for example, Railway with a mounted volume)

## Run locally
```bash
npm install
cp .env.example .env.local
# Edit .env.local and set AQ_TOKEN to your rotated token
npm run dev
```
Open http://localhost:3000.

## Data collection
Open **Evidence** and fetch one resource at a time. The app enforces a 60-second guard between upstream calls:
1. `me`
2. `export`
3. `schema`
4. `accountA`
5. `accountB`
6. `signals`
7. `notes`

Snapshots are stored in `DATA_DIR/crm-store.json`. Keep `DATA_DIR` on a persistent disk in production. The initial implementation deliberately does not invent values or infer missing source identifiers.

## Deploy
Deploy as a Node.js service (not static export). Set:
- `AQ_TOKEN` (server secret)
- `QUESTATHON_API=https://questathon.aihackerscollective.com/api/public/v1`
- `DATA_DIR=/data` (mount a persistent volume at `/data`)

Build command: `npm install && npm run build`  
Start command: `npm start`

After deployment, verify the public URL in a private/incognito window. Never commit `.env.local`, `data/crm-store.json`, or any token.

## Notes
- Live signals are polled automatically once per minute while the dashboard is open, subject to the shared one-call-per-minute token limit.
- Writing a note is a POST to `/notes` and is also subject to the one-call-per-minute limit.
- The dashboard includes a provisional account analysis based on the morning summary: deal stages, values, named stakeholders, deal blockers, risk flags, and a ranked next-action plan. It deliberately labels morning-only values as pending source-ID verification because the pasted morning view did not include underlying IDs. Fetch `/export` and both account packs before final hand-in; use the raw evidence inspector to confirm the API response structure and verify every displayed value against its record ID.

The morning action plan uses the exact evidence item names and recipients specified by the game feedback. Dates are explicitly marked unknown where the snapshot does not provide a deadline. Do not replace those labels with guessed dates.


## Live updates and write-back

When the dashboard is open, it checks the local stored state periodically and polls `/signals` in the background at a one-minute cadence. The server-side shared cooldown applies to all upstream calls, including export/pack fetches, signal polling and note writes. If the token cooldown is active, a signal poll is skipped and retried on the next interval. Notes are sent to the Questathon `/notes` endpoint and saved in the local store after a successful response.

Use a persistent disk for `DATA_DIR` in production. A filesystem-backed store is suitable for a single-instance deployment; for multiple replicas, replace it with a shared database and atomic rate-limit lock before scaling out.
