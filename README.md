# Quick Home

A four-tile home screen for a Samsung Tizen TV: **TV channels**, **Stremio**,
**YouTube**, **YouTube Music**. TV channels always has focus when it opens, so
OK takes you straight to live TV. Built for a QE55Q70AATXZT (Q70A, 2021, Tizen 6.0).

It is about 10 KB, uses no internet and no fonts or images to download. The
tiles are plain HTML, so the screen is drawn before any script runs.

| Remote | Does |
| --- | --- |
| ◀ ▶ | Move between tiles |
| OK | Open the tile |
| 1 2 3 4 | Open that tile directly |
| 🔴 Red | Open **all installed apps** in a grid |
| 🟢 Green | Change **wallpaper** (5 themes, cycles) |
| 🟡 Yellow | Turn **navigation sounds** on/off |
| 🔵 Blue | Open **Samsung Home** (your way to settings and everything else) |
| Back | Close the all-apps grid, or nothing on the home screen |

The coloured buttons are the A/B/C/D row on the Samsung remote (red, green,
yellow, blue). Wallpaper and sound choices are remembered on the TV.

## Extra features

- **All apps:** the red button opens a grid of everything installed, so apps
  beyond the four tiles are still one button away. Arrows move, OK opens, Back
  closes. It launches as fast as the tiles do.
- **Wallpapers:** five instant CSS themes (Midnight, Ocean, Aurora, Ember,
  Plum) plus six photo wallpapers (Desert stars, Misty coast, Forest mist,
  Quiet cove, Blue peaks, Sunlit ridges). Green cycles through all eleven. The
  gradients are the default so the screen still paints instantly; a photo is a
  ~0.2–0.5 MB JPEG that loads only when you select it. The photos are from
  Unsplash under the Unsplash License — credits in
  `src/img/wallpapers/CREDITS.txt`.
- **Navigation sounds:** soft clicks on move and open, made on the fly with no
  audio files. Yellow turns them off if you'd rather have silence.

## 1. Stop the TV starting on Samsung TV Plus (no install needed)

On the TV: **Settings → General → Smart Features**, then turn off
**Autorun Samsung TV Plus** and **Autorun Smart Hub**. With the menus in
Italian the names are similar (Impostazioni → Generale → Funzioni Smart).

Then hold the remote's power button until the TV switches off completely and
turn it back on. It should now start on your normal TV channels. A firmware
update can switch these back on; if TV Plus returns, check this menu again.

## 2. Try it on your PC first (optional)

Double-click `src/index.html` to open it in Edge or Chrome. Use the arrow keys,
Enter and 1-4. On a PC nothing really opens: a yellow label in the corner shows
what the TV would open. Add `?nostremio` to the address to see how it looks
when Stremio is not installed.

## 3. Build the package

```bash
powershell -ExecutionPolicy Bypass -File tools\build.ps1
```

This writes `dist/quick-home.wgt`. It is unsigned; the installer below signs it.

## 4. Put the TV in Developer Mode

1. Find your PC's IP address: run `ipconfig` and note the **IPv4 Address**
   (for example 192.168.1.20). The PC and the TV must be on the same network.
2. On the TV, open **Apps** (Home → Apps).
3. Type **1 2 3 4 5**. The Q70A's Smart Remote has no number keys: press its
   **123** (coloured dots) button to get the on-screen number pad.
4. In the Developer Mode window, switch it **On**, enter the PC's IP, and OK.
5. Restart the TV: hold the power button until it reboots.

## 5. Install with Apps2Samsung

1. Download the Windows build from
   [Apps2Samsung releases](https://github.com/Apps2Samsung/Apps2Samsung/releases).
2. Start it. It should find the TV; if not, check Developer Mode and the IP.
3. Sign in with a Samsung account when asked. It uses that to create the
   certificate your TV requires (one time only).
4. Choose to install a custom `.wgt` and pick `dist/quick-home.wgt`.

To update later, rebuild and install again with the same tool and account.
Installing with a different certificate fails until the old copy is removed.

## 6. Make it one press from Home

On the TV, go to **Apps**, highlight **Quick Home**, open its options
(press Down or hold OK) and choose **Add to Home**. Then move it to the first
position in the Home bar. From any app: **Home**, then **OK** on Quick Home.

## What it can't do

- **The Home button still opens Samsung's Home bar.** Samsung gives apps no way
  to take over Home. The arn0-tv project did it by rewriting hidden system
  settings, but only on one 2022 TV with one firmware, using a tool that is not
  published. It does not apply to a 2021 Q70A as-is.
- **YouTube Music opens YouTube.** There is no separate YouTube Music app on
  Samsung TVs as far as I could find; music is inside the YouTube app. If a
  YouTube Music app ever shows up on the TV, the tile picks it up by itself.
- Apps you open (YouTube, Stremio) still load at their own speed.

## How it works

- `src/app.js` lists the installed apps once after the screen appears, finds
  Stremio, YouTube and YouTube Music by name, and remembers their ids so the
  next opens skip the lookup. If an app is missing or won't open, it checks
  the list again once before showing a message.
- **TV channels** switches the picture to the TV tuner (in case an HDMI input
  was used last), then opens Samsung's TV viewer.
- `src/tizen-mock.js` only runs in a PC browser. On the TV it does nothing.

To change a tile, edit `APPS` in `src/app.js` and the tile markup in
`src/index.html`, then rebuild and reinstall.

## Undo

Uninstall **Quick Home** from Apps. Developer Mode can be switched off the same
way it was switched on (Apps, then 1 2 3 4 5).
