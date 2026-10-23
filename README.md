# Quick Home

A four-tile home screen for my Samsung TV (QE55Q70AATXZT · Q70A 2021 · Tizen 6):
**TV channels · Stremio · YouTube · YouTube Music**. It always opens on
TV channels, so **OK** goes straight to live TV. Works offline.

| Remote | Does |
| --- | --- |
| ◀ ▶ · OK | Move · open |
| 1 – 4 | Open that tile directly |
| 🔴 Red | All installed apps (arrows, OK, Back closes) |
| 🟢 Green | Next wallpaper (5 gradients, 6 photos) |
| 🟡 Yellow | Navigation sounds on/off |
| 🔵 Blue | Samsung Home (settings and everything else) |

The colour keys are the A/B/C/D row on the remote. Wallpaper and sound are
remembered; coming back from an app always lands on TV channels.

## Install

Needs a Windows PC on the same network as the TV and a Samsung account.

1. **Build.** In the repo folder:
   ```powershell
   powershell -ExecutionPolicy Bypass -File tools\build.ps1
   ```
   This writes `dist\quick-home.wgt`. It is unsigned; Apps2Samsung signs it.
2. **Developer Mode.** On the TV open **Apps** and type **1 2 3 4 5** (on the
   Smart Remote, the **123** button brings up the number pad). Switch it
   **On**, enter the PC's IPv4 address (from `ipconfig`), then hold Power
   until the TV restarts.
3. **Install.** Start [Apps2Samsung](https://github.com/Apps2Samsung/Apps2Samsung/releases),
   let it find the TV, sign in with the Samsung account (this creates the
   certificate once), and install `dist\quick-home.wgt`.
4. **Pin it.** Apps → **Quick Home** → options (Down, or hold OK) →
   **Add to Home**, and move it to the first position. From then on:
   **Home**, **OK**.

To update, rebuild and install again with the same tool and account. With a
different certificate the install fails until the old copy is uninstalled.

Optional: **Settings → General → Smart Features** (Impostazioni → Generale →
Funzioni Smart): turn off **Autorun Samsung TV Plus** and **Autorun Smart
Hub** so the TV starts on your channels. Firmware updates can turn them back on.

## Test on the TV

- [ ] Opens with **TV channels** focused; OK shows live TV, also when an HDMI input was used last
- [ ] **2**, **3**, **4** open Stremio, YouTube and YouTube (Music)
- [ ] 🔴 lists the installed apps; arrows, OK and Back work
- [ ] 🟢 goes through all 11 wallpapers, photos included
- [ ] 🟡 turns the clicks off and on
- [ ] 🔵 opens Samsung Home
- [ ] Leave an app with Back or Home → Quick Home is back on TV channels
- [ ] Turn the TV off and on → wallpaper and sound setting are kept

## Preview on a PC

Open `src/index.html` in Chrome or Edge. Arrows, Enter and 1–4 work as on
the remote; **R G Y B** are the colour keys and **Esc** is Back. Nothing
really opens: a yellow label shows what the TV would open. Add `?nostremio`
to the address to see a TV without Stremio.

## Change things

- **Tiles:** `APPS` in `src/app.js` and the tile markup in `src/index.html`.
- **Wallpapers:** `WALLPAPERS` in `src/app.js`. Photos are 1920×1080 JPEGs in
  `src/img/wallpapers/` (Unsplash License, see `CREDITS.txt`).
- Keep the package id `QuickHome1` in `src/config.xml`: a new id installs
  as a different app.

## Limits

- **The Home button still opens Samsung's Home bar.** Apps can't take it
  over; the unofficial and risky way is in [docs/home-button.md](docs/home-button.md).
- **YouTube Music opens YouTube**, because Samsung TVs have no separate app.
  If one ever appears, tile 4 picks it up by itself.
- Apps you open still load at their own speed.

## How it works

`src/app.js` lists the installed apps once the screen is up, finds Stremio,
YouTube and YouTube Music by id or name, and caches their ids for next time. A missing app
gets one fresh lookup before a message appears. TV channels first switches
the picture to the tuner, then opens Samsung's TV viewer. `src/tizen-mock.js`
stands in for the TV's APIs on a PC and does nothing on the TV.

`tools/` also holds the scripts that made `src/icon.png` and the wallpapers;
they are only needed to redo those.

## Undo

Uninstall **Quick Home** from Apps. Switch Developer Mode off the same way it
was switched on (Apps, then 1 2 3 4 5).
