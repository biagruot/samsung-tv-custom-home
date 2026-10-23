# Making the Home button open Quick Home

**Status: not done, not tested on this TV.** Samsung gives apps no official way to
take over the Home button. This page collects what is known for when we try it.

| | |
| --- | --- |
| TV | QE55Q70AATXZT (Q70A, 2021) |
| Firmware | T-NKM2DEUC-2301.1., BT-S |
| OS | Tizen ~6.0 (Chromium ~85) |
| Quick Home app id | `QuickHome1.Launcher` (package `QuickHome1`, must not change) |

## How it works

The app the Home button opens is stored in Tizen's system key-value store
(**vconf**) under:

```
db/appfw/home_appid      default: com.samsung.tv.csfs (Samsung's Home bar)
```

Setting it to `QuickHome1.Launcher` would make Home open Quick Home. Two
community projects do this on their own TVs:

- arn0-tv: https://github.com/NelsonEU/arn0-tv
- CleanFrame: https://github.com/nthnclrk/CleanFrame

The general approach:

1. Quick Home installed and working (see the README).
2. TV in Developer Mode, PC connected with `sdb connect <TV_IP>` (`sdb` comes
   with the [Tizen TV SDK](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html)).
3. Write the key with elevated rights (a privileged helper, or a shell as the
   system user), then restart the app framework or reboot the TV.

The exact commands and helper differ by model and firmware; check those
projects for what worked on their TVs before trying anything here.

## Risk

Neither method has been confirmed on this model and firmware. If the write is
refused or the key differs, Home may open nothing, and recovery can mean a
factory reset or reflashing the firmware from USB.

## Undo

Set `db/appfw/home_appid` back to `com.samsung.tv.csfs` the same way, or
factory-reset the TV (Settings → General → Reset).
