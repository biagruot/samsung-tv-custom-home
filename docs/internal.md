# Quick Home – note interne

Note di installazione, test e manutenzione per il mio TV (QE55Q70AATXZT ·
Q70A 2021 · Tizen 6). Il README pubblico è in inglese ed è volutamente breve;
qui c'è tutto il resto.

| Telecomando | Cosa fa |
| --- | --- |
| ◀ ▶ ▲ ▼ · OK | Sposta (▼ porta alle scene) · apri |
| 1 – 4 | Apre direttamente quel riquadro |
| 5 – 8 | Apre una scena: Camino, Pioggia, Acquario, Mare |
| 0 | *Temporaneo:* cambia il metodo con cui le scene aprono YouTube (vedi sotto) |
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
- [ ] ▼ porta alle scene, ▲ torna ai riquadri; 5–8 aprono le scene

### Scene: quale metodo apre YouTube sul video

Samsung non documenta come aprire l'app YouTube su un video preciso, quindi ci
sono quattro metodi candidati. Il tasto **0** passa al successivo e mostra in
alto a destra quale è attivo e se YouTube è già aperto in background. Il metodo
scelto resta memorizzato. All'inizio è attivo il metodo 1.

Per ogni metodo da 1 a 4, prova due volte:

1. **Con YouTube chiuso del tutto**: spegni e riaccendi il TV (tieni premuto il
   tasto di accensione), oppure dentro YouTube tieni premuto Indietro finché si
   chiude. Il messaggio deve dire "YouTube aperto: no".
2. **Con YouTube aperto**: apri YouTube, premi Home e torna su Quick Home.
   Il messaggio deve dire "YouTube aperto: sì".

Ogni volta premi **5** (Camino) e annota cosa succede: il video parte, YouTube
si apre sulla sua pagina iniziale, oppure non succede nulla. Se a YouTube
appare la scelta del profilo, scegli il tuo e annota se poi parte il video.

| Metodo | YouTube chiuso | YouTube aperto |
| --- | --- | --- |
| 1 PAYLOAD | | |
| 2 PAYLOAD + resume | | |
| 3 URL | | |
| 4 DIAL | | |

Con i risultati teniamo solo il metodo che funziona e togliamo il tasto 0.

## Anteprima sul PC

Apri `src/index.html` in Chrome o Edge. Frecce, Invio e 1–8 funzionano come
sul telecomando; **R G Y B** sono i tasti colorati ed **Esc** è Indietro.
Non si apre niente davvero: un'etichetta gialla mostra cosa aprirebbe il TV.
Aggiungi `?nostremio` all'indirizzo per vedere un TV senza Stremio.

## Modifiche

- **Riquadri:** `APPS` in `src/app.js` e il markup dei riquadri in `src/index.html`.
- **Scene:** in `src/index.html`, ogni `.scene` ha in `data-video` l'id del
  video YouTube (quello dopo `watch?v=`). Basta cambiarlo, o copiare un blocco
  per aggiungere una scena (fino al tasto 9).
- **Sfondi:** `WALLPAPERS` in `src/app.js`. Le foto sono JPEG 1920×1080 in
  `src/img/wallpapers/` (licenza Unsplash, vedi `CREDITS.txt`).
- Non cambiare l'id del pacchetto `QuickHome1` in `src/config.xml`: con un id
  nuovo il TV la installa come un'altra app.

## Limiti

- **Il tasto Home apre ancora la barra Home di Samsung.** Le app non possono
  prenderne il controllo; il metodo non ufficiale, e rischioso, è in
  [home-button.md](home-button.md).
- **YouTube Music apre YouTube**, perché sui TV Samsung non c'è un'app a parte.
  Se un giorno compare, il riquadro 4 la trova da solo.
- Le app aperte si caricano comunque con i loro tempi.
- **Le scene dipendono da YouTube**: servono internet e, per non avere
  pubblicità, YouTube Premium. Se YouTube rifiuta il video, si apre comunque
  sulla sua pagina iniziale.

## Come funziona

Appena la schermata è visibile, `src/app.js` legge le app installate, trova
Stremio, YouTube e YouTube Music per id o per nome e ne memorizza gli id per
le volte successive. Se un'app manca, rilegge l'elenco una volta prima di
mostrare un messaggio; se il TV non risponde, nella griglia OK riprova.
Canali TV prima porta l'immagine sul sintonizzatore, poi apre il visualizzatore
TV di Samsung. Le scene passano l'id del video all'app YouTube col metodo
scelto (`VIDEO_WAYS` in `src/app.js`): un `PAYLOAD` come quello delle anteprime
della Home Samsung, l'indirizzo del video, oppure una richiesta DIAL al TV
stesso, come fa l'app YouTube del telefono quando trasmette. `src/tizen-mock.js` simula le API del TV sul PC e sul TV non fa nulla.

In `tools/` ci sono anche gli script che hanno creato `src/icon.png` e gli
sfondi; servono solo per rifarli.

## Disinstallare

Disinstalla **Quick Home** da App. La modalità sviluppatore si spegne come si
è accesa (App, poi 1 2 3 4 5).
