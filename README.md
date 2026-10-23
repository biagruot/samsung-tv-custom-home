# Quick Home

Una schermata Home a quattro riquadri per il mio TV Samsung (QE55Q70AATXZT ·
Q70A 2021 · Tizen 6): **Canali TV · Stremio · YouTube · YouTube Music**. Si
apre sempre su Canali TV, quindi **OK** porta subito alla TV in diretta.
Funziona senza internet.

| Telecomando | Cosa fa |
| --- | --- |
| ◀ ▶ · OK | Sposta · apri |
| 1 – 4 | Apre direttamente quel riquadro |
| 🔴 Rosso | Tutte le app installate (frecce, OK, Indietro chiude) |
| 🟢 Verde | Sfondo successivo (5 sfumature, 6 foto) |
| 🟡 Giallo | Suoni di navigazione sì/no |
| 🔵 Blu | Home Samsung (impostazioni e tutto il resto) |

I tasti colorati sono la fila A/B/C/D del telecomando. Sfondo e suoni restano
memorizzati; tornando da un'app si riparte sempre da Canali TV.

## Installazione

Servono un PC Windows sulla stessa rete del TV e un account Samsung.

1. **Build.** Nella cartella del repo:
   ```powershell
   powershell -ExecutionPolicy Bypass -File tools\build.ps1
   ```
   Crea `dist\quick-home.wgt`, non firmato: lo firma Apps2Samsung.
2. **Modalità sviluppatore.** Sul TV apri **App** e digita **1 2 3 4 5** (sullo
   Smart Remote il tasto **123** mostra il tastierino numerico). Attivala,
   inserisci l'indirizzo IPv4 del PC (da `ipconfig`) e tieni premuto il tasto
   di accensione finché il TV si riavvia.
3. **Installa.** Avvia [Apps2Samsung](https://github.com/Apps2Samsung/Apps2Samsung/releases),
   lascia che trovi il TV, accedi con l'account Samsung (crea il certificato,
   una volta sola) e installa `dist\quick-home.wgt`.
4. **Fissala in Home.** App → **Quick Home** → opzioni (giù, o tieni premuto
   OK) → **Aggiungi a Home**, e spostala al primo posto. Da lì in poi:
   **Home**, **OK**.

Per aggiornare: rifai la build e reinstalla con lo stesso strumento e lo
stesso account. Con un certificato diverso l'installazione fallisce finché
non disinstalli la vecchia copia.

Facoltativo: in **Impostazioni → Generale → Funzioni Smart** disattiva
l'**avvio automatico di Samsung TV Plus** e di **Smart Hub**, così il TV si
accende sui tuoi canali. Un aggiornamento del firmware può riattivarli.

## Test sul TV

- [ ] Si apre con **Canali TV** selezionato; OK mostra la TV in diretta, anche se prima era attivo un ingresso HDMI
- [ ] **2**, **3**, **4** aprono Stremio, YouTube e YouTube (Music)
- [ ] 🔴 mostra le app installate; frecce, OK e Indietro funzionano
- [ ] 🟢 passa per tutti gli 11 sfondi, foto comprese
- [ ] 🟡 spegne e riaccende i suoni
- [ ] 🔵 apre la Home Samsung
- [ ] Uscendo da un'app con Indietro o Home si torna su Canali TV
- [ ] Spegnendo e riaccendendo il TV, sfondo e suoni restano come li avevi lasciati

## Anteprima sul PC

Apri `src/index.html` in Chrome o Edge. Frecce, Invio e 1–4 funzionano come
sul telecomando; **R G Y B** sono i tasti colorati ed **Esc** è Indietro.
Non si apre niente davvero: un'etichetta gialla mostra cosa aprirebbe il TV.
Aggiungi `?nostremio` all'indirizzo per vedere un TV senza Stremio.

## Modifiche

- **Riquadri:** `APPS` in `src/app.js` e il markup dei riquadri in `src/index.html`.
- **Sfondi:** `WALLPAPERS` in `src/app.js`. Le foto sono JPEG 1920×1080 in
  `src/img/wallpapers/` (licenza Unsplash, vedi `CREDITS.txt`).
- Non cambiare l'id del pacchetto `QuickHome1` in `src/config.xml`: con un id
  nuovo il TV la installa come un'altra app.

## Limiti

- **Il tasto Home apre ancora la barra Home di Samsung.** Le app non possono
  prenderne il controllo; il metodo non ufficiale, e rischioso, è in
  [docs/home-button.md](docs/home-button.md).
- **YouTube Music apre YouTube**, perché sui TV Samsung non c'è un'app a parte.
  Se un giorno compare, il riquadro 4 la trova da solo.
- Le app aperte si caricano comunque con i loro tempi.

## Come funziona

Appena la schermata è visibile, `src/app.js` legge le app installate, trova
Stremio, YouTube e YouTube Music per id o per nome e ne memorizza gli id per
le volte successive. Se un'app manca, rilegge l'elenco una volta prima di
mostrare un messaggio; se il TV non risponde, nella griglia OK riprova.
Canali TV prima porta l'immagine sul sintonizzatore, poi apre il visualizzatore
TV di Samsung. `src/tizen-mock.js` simula le API del TV sul PC e sul TV non fa nulla.

In `tools/` ci sono anche gli script che hanno creato `src/icon.png` e gli
sfondi; servono solo per rifarli.

## Disinstallare

Disinstalla **Quick Home** da App. La modalità sviluppatore si spegne come si
è accesa (App, poi 1 2 3 4 5).
