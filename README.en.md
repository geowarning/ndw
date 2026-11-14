*English translation of [README.md](README.md).*

# Natural Disaster Early Warning (Web Edition)

## Features and Data Notes

Each page provides an expandable "Notes" section that explains operations, data meaning, update times, and usage boundaries; it supports five languages and offline reading. The notes do not trigger data requests. "Snapshot download attempts" in Settings only counts shared-data download attempts in the current browser (including failures); it is not the weather provider's API usage.

The map retains the warning count and original query time from the last successful query. Green means zero warnings in the last query, yellow means warnings are present, and red means red-level warnings are included. When data is older than six hours, when the network is disconnected, or when a refresh fails, the original color is kept and a dashed ring marks a historical result; click it to view the count and time. Gray means there is no history at all. Historical counts do not indicate warnings that are currently still in effect, and they are not written into the current counts or trends. A new successful query (including zero warnings) replaces the old result. The refresh button only re-downloads already-published data; for a city with no updates, a clear message is shown.

## Shared Data Collection (Current Version)

The site is still statically hosted on GitHub Pages. Warnings are now collected on a schedule by GitHub Actions, and all visitors share `public-data/warnings.json`; browsers no longer request the weather API directly.
Add `WEATHERCN_API_KEY` to the repository's Actions Secrets, then after merging into `main`, manually run "Deploy to GitHub Pages" once. Set the Pages Source to GitHub Actions.
Normally 4 cities are collected every 15 minutes; after scheduling delays, catch-up collection covers the elapsed periods, with at most 77 cities per run, limited by the remaining quota. A rolling 24-hour window allows at most 450 attempts; the 77 configured cities take about 5 hours to complete one round, and scheduling delays lengthen the cycle. Data older than 6 hours is marked unavailable.
The first run prioritizes collecting the remaining cities within the same quota cap (up to 77 requests, with at least 300 ms between requests); afterwards it rotates at a rate of 4 cities per 15 minutes, and delayed jobs catch up according to the rules above. Cities not yet collected show as unknown, along with the number of cities that currently have valid data.
Live weather and city-location queries are not collected for now, in order to prioritize the warning quota.
For full configuration and quota-persistence details, see [backend/README.md](backend/README.md).
Clicking the nationwide map on the home page opens the large-map page at `#/map`; selecting a city there returns to that city's warnings.
The "Update Data" button on the home page and the large map opens a GitHub request form; the user must be logged in and submit the form to trigger collection. Requests respect the shared cooldown time and quota and are closed automatically once successfully published; return to the site and click "Refresh Published Data" to read the result. Visitors who are not logged in can still read all published data.
On mobile, the large map can be swiped through while continuing to use the same shared snapshot, without additional weather-API calls.
After selecting a city on the large map, you can view the last query time and whether the data has expired, then enter the local warnings.
Secondary disasters are now shown as qualitative safety prompts, and unverified occurrence probabilities are no longer displayed; the detail page prioritizes the affected area, issuance information, and defense key points, and provides the original official text with a language label. After visiting while online, the safety guide can be read offline in the same browser; when offline, old warnings are not shown as current data. Notifications are checked only while the web page remains open.
The browser-direct API access and front-end Key configuration described in the original feature notes below no longer apply to the current version.

A single-page web app fully ported from the WeChat mini-program "Natural Disaster Early Warning": **pure front-end, no backend, no build required**; open it directly in a browser and it runs, on both mobile and desktop browsers.

The visuals use a "Holographic Command Center" theme: a full-screen **3D dot-matrix holographic globe** (latitude/longitude grid + scanning sector + pulsing markers on disaster cities) and a **China holographic situation map** (glowing national/provincial borders, scan lines, cities clickable to switch directly), paired with translucent cyan-glow cards; the top navigation is fixed, and the table of contents sits in the top-right corner (collapses into a hamburger menu on mobile).

## How to Open

- Simplest: double-click `index.html` and open it with any modern browser (Chrome / Edge / Safari / WeChat built-in browser).
- On mobile: place the entire folder in any static web space (or a local HTTP server on the phone), and access `index.html` in the mobile browser.
- No Node installation, no compilation, and no third-party CDN dependencies.

> The folder structure must be preserved (`index.html`, `css/`, `js/` must keep their relative positions); copy/upload the whole folder.

## Features

| Module | Contents |
|---|---|
| Warning Center | Province → city → **district three-level selection**; after a city is selected, **district pills in the hero area switch districts independently**; status dots to the right of cities and districts: green/dark = no warnings, yellow = warnings present, red = includes red-level warnings; live weather; red/orange/yellow/blue counts; **China holographic situation map (click a city to switch directly)**; warning activity timeline, type-distribution donut chart, top-5 secondary risks, 14-day warning trend line chart |
| Warning Details | Warning body text, **district-level affected areas and key impact areas** (extracted from the official text, marked with chips), **end-time countdown**, **radar-style impact-radius map**, **secondary-disaster probability estimate**, **recommended emergency-supplies checklist**, same-type knowledge quiz, defense guide, issuing agency/time/period; one-tap call to 12121, share |
| Defense Guides | 12 disaster types (typhoon, torrential rain, flood, earthquake, high temperature, cold wave, lightning, strong wind, hail, dense fog, forest fire, drought): **causes**, warning signals, defense key points, preparation checklist, knowledge quiz, **read check-in (learning progress X/12)** |
| Emergency Tools | **Step-by-step first-aid cards** (CPR / bleeding / burns / airway obstruction, with steps + progress dots), **emergency-kit guide** (home / driving / outdoor scenarios), emergency phone numbers (tap to call), supplies checklist (auto-saved when checked), **family emergency plan (fill in / export)**, safety key points, disclaimer |
| Settings | Language card (中文/English/Español/Français/Italiano; **the entire UI switches to the corresponding language**), accessibility card (three text sizes / high contrast / reduced motion), warning-reminder card (browser notification + 15/30/60-minute frequency + test), data-source switch, cache and **cumulative request count**, **reset all local data**, about |
| Product Catalog | Navigation entry and placeholder page; content is currently empty and will be added later |

## District Scope (Important Boundaries)

- The WeatherCN (华风) API provides **city-level** data (no district-level keys): weather and warning requests are still made per city, and **local matching and filtering** are performed at the district level.
- When the official text explicitly mentions districts (e.g., "focus on Longwan District and Ouhai District"), the corresponding districts show status dots and can be filtered; broad warnings not broken down to districts are treated as **covering the whole city** (the district popover explains this).
- District names are proper place names and keep their Chinese spelling in non-Chinese interfaces (e.g., Longwan District is written "龙湾区"), while all other interface text is translated into the selected language.

## Data Sources

- Default data source: **WeatherCN (华风爱科) Weather OpenAPI** (officially authorized by the China Meteorological Administration); endpoint `https://openapi.weathercn.com`
  - Warnings: `/alerts/v1/{locationKey}.json`
  - Live weather: `/currentconditions/v1/{locationKey}.json`
  - City resolution: `/locations/v1/cities/translate` (keys for common cities are pre-filled; querying these cities does not consume location requests)
- Administrative boundaries and district coordinates: Alibaba Cloud DataV geographic data open platform (`geo.datav.aliyun.com`; fetched only at build time and solidified into local data, with no requests at runtime).
- The web version **requests the official APIs directly from the browser** (the APIs allow cross-origin access via CORS), bypassing any intermediary server, so it is not subject to the mini-program's "legal request domain" restriction.
- API requests uniformly use the original Chinese text; all copy in non-Chinese interfaces is translated by the local i18n module, and the Chinese interface shows the original official text.
- The defense guides, secondary-disaster probabilities, emergency phone numbers/supplies/safety key points are local static knowledge data. Secondary-disaster probabilities are empirical estimates based on warning type and level (probability = lower bound + (upper bound − lower bound) × level weight; red 1.0 / orange 0.75 / yellow 0.5 / blue 0.25). They are **not official probability forecasts** and are for reference only.

## Quota and Caching

- Currently built in is the WeatherCN standard test Key: 500 free calls per day, 5 QPS.
- Two levels of local caching are built in to save quota: warnings for 15 minutes and live weather for 30 minutes (adjustable via `cacheMinutes` / `cacheWeatherMinutes` in `js/config.js`); the status dots in the city selection panel also use the cache.
- Warnings that have been loaded are registered in memory, so even if the cache expires, entering details from an already-open page does not fail.
- For multi-user or high-frequency use, upgrade to a paid official Key on the WeatherCN platform; just replace `weathercn.apiKey` in `js/config.js`, with no other code changes needed.
- The Settings page allows manual cache clearing and viewing the cumulative request count.

## File Structure

```
natural-disaster-warning-web/
├── index.html          Sole entry point (includes the holographic globe canvas)
├── css/
│   └── styles.css      All styles (Holographic Command Center theme, responsive layout)
└── js/
    ├── shim.js         Browser adapter layer: wx.request→fetch, wx.storage→localStorage, request counting
    ├── config.js       Data source and cache configuration (API Key lives here)
    ├── data.js         Level colors, 12 defense guides
    ├── cities.js       National provinces/cities and pre-filled city keys
    ├── districts.js    800+ district coordinates and city coordinates (DataV, with Hong Kong/Macau/Taiwan hand-completed)
    ├── china-geo.js    National/provincial border GeoJSON (simplified point sampling)
    ├── i18n.js         5-language strings; place-name/weather/risk/defense/quiz/first-aid translations
    ├── risk.js         Secondary-disaster probability calculation
    ├── api.js          WeatherCN data fetching, district extraction, caching, city status, in-memory registry
    ├── holo-globe.js   3D dot-matrix holographic globe
    ├── china-holo.js   China holographic situation map (SVG, cities clickable)
    ├── charts.js       Donut / bar / line charts (canvas)
    └── app.js          Hash routing, top navigation, and rendering/interaction for each view
```

## Deployment Tips

- These are pure static files; place them on any static hosting (intranet web server, object-storage static website, GitHub Pages, etc.) and they can be accessed.
- Browser requirements: support for ES5+ syntax, fetch, and localStorage (all major browsers in recent years support these).
- Cities are selected manually and cover the whole country; location permission is not forcibly used.
