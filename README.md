# Forge

My personal fitness tracker — a single-page web app (`index.html`) wrapped as an
Android app with Capacitor, built automatically by GitHub Actions.

**Current version: v9.15**

---

## How to update Forge

Everything in this folder is meant to live in the repository, so updating is one
wholesale upload — just like deploying on Cloudflare:

1. Extract the zip and open the `Forge-v9.15` folder.
2. On the repo's **main page**: **Add file → Upload files**.
3. Select **everything** inside the folder (`Ctrl+A`) and drag it into the box,
   then **Commit changes**.
   GitHub keeps your other files (privacy policy, build settings) and only updates
   what changed — nothing is deleted.
4. Finish based on the kind of update (see `CHANGELOG.md`):
   - **App-shell change** — the `app/` folder changed (icon, notifications, a new
     device ability). Build + reinstall:
     **Actions → Build Android APK → Run workflow → `debug` → Run**, then install
     the result on your phone.
   - **Web-only change** — only `index.html` changed. Auto-updates are **on**
     (since v9.15): the app loads the live website directly, so once Cloudflare is
     updated there's nothing else to do — the app shows the new version next time
     you open it.

---

## What's in the repo

| Item | What it is |
|------|------------|
| `index.html` | The whole app — every screen and all the logic. |
| `app/` | The Android shell (Capacitor project, build scripts, icon assets). |
| `privacypolicy.html` | Privacy policy page. |
| `.github/workflows/` | The GitHub Actions build. Already set up — you don't touch it. |
