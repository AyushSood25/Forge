# Forge — Android app + Health Connect steps (100% cloud, no local installs)

Everything below happens in a **web browser** (github.com + the Capgo dashboard) and
on your **phone**. Nothing is installed on any computer — GitHub's servers do the
project generation, the APK build, and even the keystore creation.

## How it works
- The app is bundled into the APK so Health Connect works (a remote URL + service
  worker breaks native plugins).
- **Web edits → push to `main` → Capgo updates the app over the air. No reinstall.**
- You only rebuild the APK when adding a *native* feature.
- Your Cloudflare PWA keeps working in the browser exactly as today.

## App id
Everything uses the app id `dev.ayushsood.forge` (in `capacitor.config.json`). If you
change it, change it in that file AND in your Capgo app.

---

## Step 1 — Put these files in your repo (browser)
On github.com, open your Forge repo → **Add file → Upload files** → drag in the
contents of the setup bundle. Everything for the app lives in an isolated `app/` folder
so it can't affect your live website:
```
.github/workflows/build-apk.yml
.github/workflows/gen-keystore.yml
.github/workflows/ota.yml
app/package.json
app/capacitor.config.json
app/.gitignore
app/scripts/copy-web.mjs
app/scripts/patch-android.mjs
privacypolicy.html        <- this one sits next to your index.html at the repo root
```
Commit to `main`. (If your repo had an earlier, half-built Capacitor attempt, delete its
old `capacitor.config*`, `android/` folder, and old workflow first.)
> The web app files (`index.html`, `manifest.json`, icons, `brand/`) are already in the
> repo — deploy the v9.13 build to Cloudflare as usual.

## Step 2 — Capgo account → token (browser)
1. Go to capgo.app, sign up (free), and create an app with id **`dev.ayushsood.forge`**.
2. Create an API key in the dashboard.
3. In your repo: **Settings → Secrets and variables → Actions → New repository secret**
   → name `CAPGO_TOKEN`, value = your key.

## Step 3 — Signing key (browser, via a workflow)
1. Add three secrets (any values you choose):
   - `ANDROID_KEYSTORE_PASSWORD` — a long random string
   - `ANDROID_KEY_PASSWORD` — another long random string
   - `ANDROID_KEY_ALIAS` — e.g. `forge`
2. **Actions → "Generate signing keystore" → Run workflow.**
3. Open the finished run → download the **forge-keystore** artifact → open
   `forge.keystore.b64.txt` → copy ALL of it into a new secret `ANDROID_KEYSTORE_BASE64`.
4. Keep the `forge.keystore` file somewhere safe, then delete the artifact.
   (Use a **private** repo — that artifact is your signing key.)

## Step 4 — Build the APK (browser)
**Actions → "Build Android APK" → Run workflow.** When it finishes, open the run and
download the **forge-release-apk** artifact. Easiest: do this in your **phone's browser**
(log into github.com on the phone) so the laptop isn't involved at all.

## Step 5 — Install + connect (phone)
1. The artifact is a `.zip` — unzip it on the phone (any file manager) to get the `.apk`,
   then install it (allow "install unknown apps" when prompted).
2. In **Samsung Health → Settings → Health Connect**, allow **Steps**.
3. Open **Forge** → grant the Health Connect permission → tap the **Steps card** to sync.
   Your watch's steps appear. (Sync isn't instant — tap the card to refresh.)

---

## Deploying updates afterwards
**Web change (the usual case — no reinstall):**
1. Edit `index.html` on github.com (or push from anywhere). Bump the build tag/cache like
   you do now, and deploy to Cloudflare for the browser PWA.
2. The push to `main` triggers **"OTA web update"**, which pushes the new bundle to Capgo.
   Your app updates itself on next launch. Done.

**Native change (rare — new plugin / config / manifest):**
- Run **"Build Android APK"** again, download the new APK, install it over the old one
  (same key = installs as an update, keeps your data). This is the only time you reinstall.

---

## Honest note
A first cloud build often needs one round of fixing (package versions, the SDK platform,
manifest merge, or the Capgo CLI flags). That's normal. If **"Build Android APK"** comes
back red, open the failed step, copy the log, and send it to me — I'll tell you the exact
line to change.
