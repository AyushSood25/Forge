// Runs in GitHub Actions AFTER `npx cap add android`, so the Android project is
// configured for Health Connect without you ever editing android/ by hand.
// Idempotent: safe to run more than once.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const manifestPath = 'android/app/src/main/AndroidManifest.xml';
const varsPath = 'android/variables.gradle';

if (!existsSync(manifestPath)) {
  console.error(`[patch-android] ${manifestPath} not found — did "cap add android" run?`);
  process.exit(1);
}

let m = readFileSync(manifestPath, 'utf8');

// 1) Let the app detect Health Connect — <queries> right after <manifest ...>
if (!m.includes('com.google.android.apps.healthdata')) {
  m = m.replace(/(<manifest[^>]*>)/,
    `$1\n    <queries>\n        <package android:name="com.google.android.apps.healthdata" />\n    </queries>`);
}

// 2) Permissions-rationale intent-filter inside MainActivity (Android 13 and below)
if (!m.includes('androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE')) {
  m = m.replace(/(<activity[^>]*\.MainActivity[\s\S]*?)(<\/activity>)/,
    `$1        <intent-filter>\n                <action android:name="androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" />\n            </intent-filter>\n        $2`);
}

// 3) VIEW_PERMISSION_USAGE alias inside <application> (Android 14+)
if (!m.includes('ViewPermissionUsageActivity')) {
  const alias =
`        <activity-alias
            android:name="ViewPermissionUsageActivity"
            android:exported="true"
            android:targetActivity=".MainActivity"
            android:permission="android.permission.START_VIEW_PERMISSION_USAGE">
            <intent-filter>
                <action android:name="android.intent.action.VIEW_PERMISSION_USAGE" />
                <category android:name="android.intent.category.HEALTH_PERMISSIONS" />
            </intent-filter>
        </activity-alias>
`;
  m = m.replace('</application>', alias + '    </application>');
}

writeFileSync(manifestPath, m);
console.log('[patch-android] AndroidManifest.xml patched for Health Connect');

// 4) Health Connect needs min SDK 26
if (existsSync(varsPath)) {
  let v = readFileSync(varsPath, 'utf8');
  if (/minSdkVersion\s*=\s*\d+/.test(v)) {
    v = v.replace(/minSdkVersion\s*=\s*\d+/, 'minSdkVersion = 26');
    writeFileSync(varsPath, v);
    console.log('[patch-android] minSdkVersion set to 26');
  } else {
    console.warn('[patch-android] minSdkVersion not found in variables.gradle — set it to 26 if the build complains');
  }
}

// 5) Generate the app launcher icon + splash from /assets (Forge branding).
//    Runs @capacitor/assets now that android/ exists. If it fails for any reason,
//    the build still succeeds with the default icon, so a logo hiccup never blocks a build.
if (existsSync('assets/icon-only.png')) {
  try {
    console.log('[patch-android] generating app icon + splash from assets/ ...');
    execSync(
      "npx --yes @capacitor/assets generate --android --iconBackgroundColor '#c4633f' --iconBackgroundColorDark '#a8512f'",
      { stdio: 'inherit' }
    );
    console.log('[patch-android] icon + splash generated');
  } catch (e) {
    console.warn('[patch-android] icon generation skipped (default icon kept):', e.message);
  }
} else {
  console.warn('[patch-android] assets/icon-only.png not found — keeping default icon');
}
