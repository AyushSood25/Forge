# Forge — Changelog

Newest first.

## v9.16
- **Added** working daily reminders. The "Daily reminders" toggle (Settings) now
  schedules real Android notifications through the Local Notifications plugin, so
  they fire at each ritual time **even when the app is closed**, and repeat every
  day automatically.
- The browser version keeps its existing best-effort reminders; only the phone
  app gained the always-on behaviour.
- **Rebuild needed:** no. The notification plugin was already inside the app since
  v9.14 — this is the web/JavaScript that finally uses it. Upload to GitHub,
  Cloudflare deploys, and the app picks it up next time you open it.
- **To switch them on:** open the app, go to Settings, tap **Daily reminders**,
  and tap **Allow** on the Android popup.
- **Added** a "Calories burned" card on the dashboard, next to Steps. It reads
  the active calories your watch records (via Health Connect) and shows them
  against a daily goal. Tap the card to sync and grant permission the first time.

## v9.15
- **Changed** the Android app to load the live website
  (`forge.ayushsood25.workers.dev`) directly — the free "remote-URL" auto-update
  approach. From now on, every web change reaches the installed app the moment
  Cloudflare updates. No rebuild, no reinstall.
- **Changed** Capgo auto-update from on → off (replaced by the remote-URL
  approach; the paid Capgo service is not used).
- **Rebuild needed:** yes — this is the one final rebuild that switches the app
  over. Install straight over the existing app (no uninstall; same debug signing).
- **Order matters:** get the live Cloudflare site onto v9.15 *before* opening the
  newly installed app, or the app will show the old site.

## v9.14
- **Added** step counter from the Galaxy Watch via Health Connect (dashboard card).
- **Added** proper Forge app icon + splash screen.
- **Added** native notification engine — reminders that fire even when the app is
  closed. _(Installed in this version; switched on in a later update.)_
- **Added** auto-update ("over-the-air") plumbing, so future web changes can apply
  themselves without a reinstall.
- **Rebuild needed:** yes — the `app/` shell changed.

## v9.11
- The web app before any Android work: food logging, workouts, weight tracking,
  progress photos, AI coach, and the rest.
