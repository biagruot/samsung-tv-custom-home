# Quick Home – Handover for Home-Button Override

## Goal

The user wants their custom Samsung TV launcher app ("Quick Home") to open
automatically whenever the TV's physical **Home button** is pressed, replacing
Samsung's default Home bar.

---

## TV details

| Field | Value |
|---|---|
| Model | QE55Q70AATXZT (Q70A, 2021) |
| Firmware | T-NKM2DEUC-2301.1., BT-S |
| OS | Tizen ~6.0 (Chromium ~85 underneath) |
| Region | Italy |

---

## The Quick Home app

Already built and ready to install. Key identifiers:

| Field | Value |
|---|---|
| Package ID | `QuickHome1` (exactly 10 alphanumerics — must not change) |
| App ID | `QuickHome1.Launcher` |
| Entry point | `index.html` |
| WGT package | `dist/quick-home.wgt` (unsigned, signed at install by Apps2Samsung) |

The four tiles: TV channels (focused by default), Stremio, YouTube, YouTube Music.
Photo wallpapers, all-apps grid, navigation sounds, Samsung Home shortcut are all included.

---

## Project file layout

```
src/
  config.xml       — Tizen manifest
  index.html       — UI (four tiles, all-apps overlay, clock/date)
  style.css        — styles (no gap/inset/aspect-ratio — old Chromium)
  app.js           — main ES5 IIFE logic
  tizen-mock.js    — PC-only stub for browser testing
  icon.png         — 512×423 app icon
  img/
    wallpapers/    — night.jpg misty.jpg forest.jpg cove.jpg peaks.jpg ridge.jpg CREDITS.txt

dist/
  quick-home.wgt   — built package (run tools/build.ps1 to rebuild)

tools/
  build.ps1        — builds the .wgt
  make-icon.ps1    — regenerates icon.png
  fetch-wallpapers.ps1 — downloads/downscales wallpapers from CleanFrame

README.md          — full install guide (Developer Mode, Apps2Samsung, etc.)
HANDOVER.md        — this file
```

---

## What "set as Home" means technically

Samsung Tizen stores the app that the Home button opens in a system-level
key-value store called **vconf**. The relevant key is:

```
db/appfw/home_appid
```

By default its value is `com.samsung.tv.csfs` (Samsung's Home bar). Changing
it to `QuickHome1.Launcher` makes the Home button open Quick Home instead.

The arn0-tv project (https://github.com/NelsonEU/arn0-tv) and the CleanFrame
project (https://github.com/nthnclrk/CleanFrame) both do this via Tizen's
debug shell (`sdb`) with a privileged helper binary.

The general approach from those projects:

1. Enable **Developer Mode** on the TV (Apps → type 12345, enter PC IP, reboot).
2. Connect from PC with `sdb connect <TV_IP>`.
3. Run a privileged helper or use `sdb shell` as an elevated user (UID 901) to
   call `vconf_set` on `db/appfw/home_appid` = `QuickHome1.Launcher`.
4. Some implementations also restart the `appfw` service or reboot the TV.

Exact commands, the name/source of the helper binary, and whether UID 901
access is needed directly or via a helper — check the two repos above, as the
exact method differs by firmware and the repos document what worked for their
specific TVs.

---

## Known risk

This TV (QE55Q70AATXZT, firmware T-NKM2DEUC-2301.1.) has **not** been confirmed
to work with arn0-tv's or CleanFrame's method. Both projects tested on
different models/firmware. If the vconf write is rejected or the key name
differs in this firmware, Home may open nothing; recovery is typically a
factory reset or re-flashing firmware via USB.

---

## Installing Quick Home first (required before the override)

The app must be installed before its app ID can be registered as the Home app.

1. Put the TV in Developer Mode (README § 4).
2. Install with Apps2Samsung (README § 5).
3. Confirm `QuickHome1.Launcher` appears in the TV's app list.
4. Then apply the Home override.

---

## Reverting the override

Set `db/appfw/home_appid` back to `com.samsung.tv.csfs` via the same sdb
method, or factory-reset the TV (Settings → General → Reset).

---

## Platform notes (agent's environment)

- OS: Windows 11 Pro
- Shell: PowerShell 5.1 (no `&&`, no ternary, no `bash`)
- No Node.js installed; no Python (WindowsApps stub only)
- `sdb.exe` (Tizen CLI tools) may need to be downloaded separately from
  Samsung's Tizen SDK: https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html
- The working directory contains the full Quick Home project.
