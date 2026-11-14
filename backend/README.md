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

The site's **Update data** button opens the `data-update.yml` GitHub issue form.
Visitors must sign in and submit the form; opening the form alone does not start
collection. Issues with the exact title `[Data update] Refresh warning data`
trigger the same trusted-main deployment workflow and quota ledger. Unrelated
issues do not run the job. Request text is never executed. The workflow closes
the request only after deployment and the published-data check succeed.
Users then choose **Refresh published data** on the site to download the result.
This GitHub approach requires no browser API key or personal access token.

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

## GDACS live versus history

The GDACS SEARCH endpoint returns records in a date range, including disasters
that have ended. `iscurrent` alone does not establish that a disaster is ongoing.
Live requires an explicitly current report with valid UTC start/end dates whose
interval contains the present time. Ended, future, undated, disappeared and
superseded episodes are excluded from Live. This is a conservative display rule
based on GDACS reports, not independent confirmation of conditions on the ground.

Every successful GDACS collection (including a valid empty result) first saves
complete GeoJSON records to `public-data/gdacs-disaster-history.json`, which both
History and Database read, then writes only active events to `gdacs-events.json`.
A failed request leaves both files intact. Older episodes and original locations
remain in history. `--reconcile` uses this same path; the older `gdacs-history.json`
summary is retained for compatibility but is no longer updated.
The browser also checks dates when rendering, so expired cached records cannot
remain live just because the next collection has not run. Historical ranges use
the event's reported start/end interval, including long-running disasters.

## Alert retention and rescue directory

China collection now archives every observed alert revision in the quota ledger
and publishes `china-warning-history.json`, exposed by the China tab in Database.
A successful empty refresh does not delete previous alerts. Existing published
alerts seed the archive; unobserved past alerts cannot be reconstructed reliably.
Earthquake refreshes append to the persistent archive, and daily historical
backfills no longer delete events older than 24 months. GDACS records remain
retained by event/episode. All main-branch snapshot writers share the Pages
concurrency group to avoid competing archive publications.

This is an archive of collected records, not a complete history of every disaster:
China coverage is limited to configured cities and collection intervals, USGS
historical backfills query magnitude 2.5+, and GDACS collection covers WF/FL/TC/DR.
Source outages and provider retention can leave gaps.

`public-data/rescue-contacts.json` is derived from the official IFRC GO public
country fixtures, with source commit URL and retrieval date embedded. It links
national Red Cross / Red Crescent societies and official local-branch directories;
it is not a complete dispatch-ready list of every rescue team. No phone numbers
were inferred from that dataset. China emergency numbers are separately labeled.
Refresh the directory against IFRC's current official sources when available;
retrieval of the public fixture is not verification that each linked contact is
still operational. No API credentials or personal contact records are included.


## Current GDACS publication (2026-11-14)

Live now uses the official https://www.gdacs.org/xml/rss.xml current-event feed,
enriched with SEARCH API details. `todate` is retained as a reporting-period
boundary, not treated as confirmed closure. Current membership is verified at
collection time and expires from Live after 30 minutes without another successful
check. Removed events remain in the archive. This supersedes the earlier strict
start/end interval rule above; current listing is not on-site verification.

Collection requests run every five minutes, offset from the top of the hour.
GitHub schedules remain best-effort and may be delayed. Each collection workflow
also publishes Pages directly because GITHUB_TOKEN pushes do not trigger another
workflow. The browser refreshes published data every minute, and shows overdue
updates explicitly. A strict real-time interval would need an external scheduler.


## Delayed GDACS updates (display policy)

Collection age is not incident closure. The map retains the last successfully
listed GDACS events when updates are overdue (30 minutes), with dashed markers,
last-check time and an explicit unconfirmed-status notice. A successful current
feed refresh still removes events no longer listed from the map and preserves
them in history. This supersedes the previous 30-minute visibility expiry.


## Site-wide search

`node backend/prepare-site.mjs [site-root]` now generates the published search
catalog from public datasets and static HTML pages. The primary index contains
countries, organizations and current content; history is a separate lazy shard.
Both files are generated outputs and should not be committed. For local source
serving, run `ALLOW_STALE_DATA=1 node backend/prepare-site.mjs` after changing
content. The browser refreshes the catalog on reopening after one minute.

New records in the existing data schemas are indexed automatically. Future public
JSON content can expose `{title, href, keywords/body, category}` (or `label/name`
and `route`) anywhere in its object tree; the index discovers those linked records
without changes to the search UI. Future custom browser features can register a
provider using `NDSearch.registerSource(() => [{label, category, href, keywords}])`.
New navigation items are picked up from the shared navigation list, and headings
and section text on the current rendered page are also searchable. Keep private
configuration outside public-data; only published content belongs in the catalog.
