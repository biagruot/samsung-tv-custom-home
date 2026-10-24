<div align="center">

# Quick Home

**A clean, fast home screen for Samsung Smart TVs.**

Four big tiles for what you actually watch, ambient scenes, and every
other app one button away — all driven with just the arrows and OK.

![License: MIT](https://img.shields.io/badge/license-MIT-black)
![Platform: Samsung Tizen](https://img.shields.io/badge/platform-Samsung%20Tizen-1428a0)
![No ads · No tracking](https://img.shields.io/badge/no%20ads-no%20tracking-2a7)

![Quick Home](docs/screenshots/home.jpg)

</div>

## Why

Samsung's Home bar is crowded with promotions and apps you never open, and it
loads slowly. Quick Home is a simpler screen to use instead: **live TV,
Stremio, YouTube and YouTube Music** as four big tiles, a row of ambient
scenes underneath, and the rest of your apps a single button away.

## Highlights

- 📺 **Opens on live TV.** TV channels is selected by default, so OK drops you
  straight onto your channels.
- 🎛️ **Works with any remote.** Everything is reachable with the arrows and OK
  — no number or colour keys needed, so the plain Smart Remote is enough.
- 🔥 **Ambient scenes.** Fireplace, rain, aquarium and sea open YouTube right on
  a long video. With YouTube Premium, no ads.
- 🗂️ **All your apps.** One button shows every installed app in a grid.
- 🪟 **Frosted-glass look.** Tiles and scenes are translucent over your
  wallpaper, with 11 backgrounds to choose from — photos included.
- 🔒 **Light and private.** No ads, no tracking; the home screen itself works
  offline.

<div align="center">

| Pick a wallpaper | All your apps |
| :---: | :---: |
| ![Wallpaper](docs/screenshots/wallpaper.jpg) | ![All apps](docs/screenshots/all-apps.jpg) |

</div>

## Remote

| Button | Action |
| --- | --- |
| ◀ ▶ ▲ ▼ · OK | Move · open |
| ▲ from the tiles | Open the settings bar (all apps · wallpaper · sounds · Samsung Home) |

> Remotes with number and colour keys get shortcuts too: **1–4** open a tile,
> **5–8** a scene, and 🔴 🟢 🟡 🔵 mirror the settings bar, in that order.

## Install it on your TV

You need a Windows PC on the same network as the TV and a free Samsung account.

**1 · Build the app** — download this repo, open PowerShell in its folder and run:

```powershell
powershell -ExecutionPolicy Bypass -File tools\build.ps1
```

This creates `dist\quick-home.wgt`.

**2 · Turn on Developer Mode** — on the TV, open **Apps**, type **1 2 3 4 5**,
switch Developer Mode **on**, enter your PC's IP address and restart the TV.

**3 · Install** — use [Apps2Samsung](https://github.com/Apps2Samsung/Apps2Samsung/releases)
to send `dist\quick-home.wgt` to the TV, and sign in with your Samsung account
when it asks.

**4 · Pin it** — in **Apps**, select **Quick Home**, choose **Add to Home** and
move it to the first position. From then on it's **Home**, then **OK**.

## Try it in your browser

Open `src/index.html` in Chrome or Edge. The arrow keys, Enter and 1–8 act like
the remote; **R G Y B** are the coloured buttons and **Esc** is Back. Nothing
really opens — a label shows what the TV would launch.

## Good to know

- **The Home button still opens Samsung's Home bar.** TV apps aren't allowed to
  replace it, so Quick Home sits one press away instead (Home, then OK).
- **YouTube Music opens in YouTube**, because Samsung TVs have no separate app
  for it.
- **Scenes need YouTube.** Each one is just a YouTube video id in
  `src/index.html` (`data-video`), so you can swap in your own favourites.
- **The on-screen text is in Italian.** It all lives in `src/index.html` and
  `src/app.js` if you want another language.
- Built for a 2021 Samsung **Q70A** (Tizen 6). Other recent Samsung TVs will
  probably work too, but haven't been tried.

## License

The code is [MIT](LICENSE). The wallpaper photos are **not** covered by it: they
come from [Unsplash](https://unsplash.com/license), under the Unsplash License,
and were selected by the [CleanFrame](https://github.com/nthnclrk/CleanFrame)
project. See [CREDITS.txt](src/img/wallpapers/CREDITS.txt).
