# GitHub-only warning collection

No separate server or hosting account is required. GitHub Actions collects
warnings; GitHub Pages serves the website and `public-data/warnings.json`.
Browsers never call the weather provider.

## Enable

1. Add repository Actions secret `WEATHERCN_API_KEY` in GitHub Settings → Secrets
   and variables → Actions. Enter its value there, never into source files.
2. Merge these changes into `main`. In Settings → Pages, select GitHub Actions.
3. Enable Actions and manually run **Deploy to GitHub Pages** once.
4. Permit the workflow token to write the `ndw-data` branch. If branch rules
   prevent this, the workflow fails before making provider calls.

The first eligible run reserves and checks all remaining map cities (at most
77 requests), paced at least 300ms apart. This one-time warm-up uses the same
450-call cap and persisted quota ledger; interrupted reservations still count.
Subsequent runs are scheduled at minutes 7, 22, 37 and 52 each hour (UTC),
with four cities per elapsed 15-minute slot. If GitHub delays a run, the next
eligible run catches up missed slots, up to one 77-city rotation and the remaining
rolling quota. Catch-up can spend more requests in one run, but never raises the
450-attempt daily limit. A manual rerun within 15 minutes reserves no requests.
That is approximately 384 calls/day and about five hours for all 77 supported
map cities with regular scheduling. GitHub scheduling and deployment delays can extend this period.
Initial coverage normally fills in the first collection run; missing cities appear unknown.
Manual runs cannot bypass the 15-minute collection gap or the 450-attempt
rolling 24-hour cap. Other applications using the key consume additional quota.

The collector commits quota reservations BEFORE requests. Failed and interrupted
requests count against the cap. The `ndw-data` branch preserves quota history,
rotation position and last good results. Push deployments also run the collector,
subject to the same 15-minute gate and quota. Do not delete/reset this branch while
using the same key. Collection and publication runs are serialized. Pushes to
the data branch do not trigger another collection workflow.

Snapshot reads are shared across cities and cached for one minute per page.
Each result retains its original successful-check time. Results older than six
hours are unavailable; failed refreshes never turn a previous warning into an
all-clear. Ordinary weather and location lookup remain disabled to prioritize
warning coverage. This is periodic coverage, not instant emergency notification.

Only public assets and the snapshot enter the Pages artifact. The API key stays
in Actions Secrets. The data branch contains warning data and quota metadata.
The workflow also commits the public snapshot to `main` before publishing.
This keeps branch-based Pages builds and the Actions artifact consistent, so
a later source deployment cannot replace live data with an empty placeholder.
Refresh and Rescan discard browser snapshot caches; they only download public
JSON and never call the provider directly. Do not edit the generated JSON by hand.

## Reliability and offline behavior

Map cities show their actual successful-check time. Labels are thinned to avoid
overlap; all markers remain selectable with touch or keyboard. Selecting a city
shows freshness and a separate action to open its warnings. The six-hour maximum
age remains unchanged and does not imply real-time coverage.

Secondary hazards are descriptive guidance, without numerical probability claims.
Warning details prioritize actions, area, authority and publication/check times.
The Chinese original is available in a labeled disclosure; source links are
shown only when the provider supplies a valid HTTPS URL. Missing issue times
are not fabricated from the current time.

The service worker caches the app and safety knowledge after a successful online
visit. It never caches `public-data/warnings.json`. Offline pages show an explicit
notice and unknown warning status, while Guide content remains usable. Storage
is browser-specific and can be cleared or evicted. Notifications still require
the page to remain open, and background tabs can delay checks; there is no server
push or guarantee of emergency notification.

Before publishing, the workflow validates payloads and requires at least one fresh
city, checks every referenced asset, and hashes static assets into the offline
cache version. A final health check reads the published snapshot without weather
API calls. Pre-collection tests intentionally do not require fresh real data, so
a delayed workflow can still run the collector and recover.

## Running local checks

Use Node.js 22+: `node --test backend/*.test.mjs`.
Serve the site with `python3 -m http.server 8000`.
The committed snapshot mirrors the last published data; tests use fake provider
responses and consume no quota. The collector CLI is intended for Actions and pushes its
data commits; do not run it locally unless that is intended.
