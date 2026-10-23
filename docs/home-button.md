# Far aprire Quick Home al tasto Home

**Stato: non fatto, mai provato su questo TV.** Samsung non dà alle app un modo
ufficiale per prendere il controllo del tasto Home. Qui c'è quello che si sa,
per quando ci proveremo.

| | |
| --- | --- |
| TV | QE55Q70AATXZT (Q70A, 2021) |
| Firmware | T-NKM2DEUC-2301.1., BT-S |
| Sistema | Tizen ~6.0 (Chromium ~85) |
| Id app Quick Home | `QuickHome1.Launcher` (pacchetto `QuickHome1`, da non cambiare) |

## Come funziona

L'app che si apre col tasto Home è salvata nell'archivio chiave-valore di
sistema di Tizen (**vconf**), sotto:

```
db/appfw/home_appid      predefinito: com.samsung.tv.csfs (la barra Home di Samsung)
```

Impostandola a `QuickHome1.Launcher`, il tasto Home aprirebbe Quick Home. Due
progetti della community lo fanno sui loro TV:

- arn0-tv: https://github.com/NelsonEU/arn0-tv
- CleanFrame: https://github.com/nthnclrk/CleanFrame

L'approccio in generale:

1. Quick Home installata e funzionante (vedi [internal.md](internal.md)).
2. TV in modalità sviluppatore e PC collegato con `sdb connect <IP_DEL_TV>`
   (`sdb` è incluso nel [Tizen TV SDK](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html)).
3. Scrivere la chiave con permessi elevati (un helper privilegiato, o una shell
   come utente di sistema), poi riavviare il framework delle app o il TV.

Comandi esatti e helper cambiano da modello a modello e da firmware a firmware:
prima di provare qualsiasi cosa qui, controlla in quei progetti cosa ha
funzionato sui loro TV.

## Rischi

Nessuno dei due metodi è stato confermato su questo modello e firmware. Se la
scrittura viene rifiutata o la chiave è diversa, il tasto Home potrebbe non
aprire più nulla, e per rimediare può servire un ripristino di fabbrica o
reinstallare il firmware da USB.

## Annullare

Rimetti `db/appfw/home_appid` a `com.samsung.tv.csfs` con lo stesso metodo,
oppure fai un ripristino di fabbrica (Impostazioni → Generale → Ripristina).
