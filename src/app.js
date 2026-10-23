/* Quick Home: a four-tile home screen for Samsung Tizen TVs.
   TV channels is tile 1 and has focus every time the screen opens.
   Colour keys: RED all apps, GREEN wallpaper, YELLOW sound, BLUE Samsung Home.
   Plain ES5 so it runs on older TV browsers. */
(function () {
  'use strict';

  var TV_VIEWER_APP = 'org.tizen.tv-viewer';
  var SAMSUNG_HOME_APP = 'com.samsung.tv.csfs';
  var LIST_TIMEOUT_MS = 8000;
  var TUNER_TIMEOUT_MS = 2000;
  var LAUNCH_LOCK_MS = 2000;
  var GRID_COLS = 5;

  // Remote key codes. Digits and colour keys only arrive after registerKeys().
  var KEY = {
    OK: 13, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, DIGIT_1: 49,
    RED: 403, GREEN: 404, YELLOW: 405, BLUE: 406, BACK: 10009
  };

  // Everything remembered on the TV, as JSON in localStorage.
  var STORE = {
    appIds: 'quickhome.appIds',
    wallpaper: 'quickhome.wallpaper',
    sound: 'quickhome.sound'
  };

  // Gradient wallpapers are CSS only, so switching to one is instant and
  // downloads nothing. Photo wallpapers are bundled JPEGs (Unsplash, see
  // img/wallpapers/CREDITS.txt); each loads only when selected. Gradients
  // come first so the default stays instant.
  var WALLPAPERS = [
    { cls: 'wp-midnight', label: 'Midnight' },
    { cls: 'wp-ocean', label: 'Ocean' },
    { cls: 'wp-aurora', label: 'Aurora' },
    { cls: 'wp-ember', label: 'Ember' },
    { cls: 'wp-plum', label: 'Plum' },
    { photo: 'img/wallpapers/night.jpg', label: 'Desert stars' },
    { photo: 'img/wallpapers/misty.jpg', label: 'Misty coast' },
    { photo: 'img/wallpapers/forest.jpg', label: 'Forest mist' },
    { photo: 'img/wallpapers/cove.jpg', label: 'Quiet cove' },
    { photo: 'img/wallpapers/peaks.jpg', label: 'Blue peaks' },
    { photo: 'img/wallpapers/ridge.jpg', label: 'Sunlit ridges' }
  ];

  // Apps are found by known id first, then by name, because store ids can
  // differ between TV years and regions. `fallback` is used when the app
  // itself is missing (YouTube Music has no separate app on most Samsung TVs).
  var APPS = {
    stremio: { label: 'Stremio', ids: [], name: /^stremio/i },
    youtube: { label: 'YouTube', ids: ['9Ur5IzDKqV.TizenYouTube'], name: /^youtube$/i },
    ytmusic: { label: 'YouTube Music', ids: [], name: /^youtube music/i, fallback: 'youtube' }
  };

  var stage = document.getElementById('stage');
  var clockEl = document.getElementById('clock');
  var dateEl = document.getElementById('date');
  var toastEl = document.getElementById('toast');
  var appsScreen = document.getElementById('appsScreen');
  var appsGrid = document.getElementById('appsGrid');
  var appsEmpty = document.getElementById('appsEmpty');
  var tiles = [].slice.call(document.querySelectorAll('.tile'));

  var mode = 'home';          // 'home' or 'apps'
  var focused = 0;            // focused tile on the home screen
  var gridFocus = 0;          // focused cell in the all-apps grid
  var launching = false;
  var appIds = load(STORE.appIds, {}); // key -> app id, or null when the TV has no such app
  var allApps = [];           // every launchable app, for the grid
  var listing = false;
  var afterList = [];
  var tickTimer = null;
  var toastTimer = null;

  var wallpaper = load(STORE.wallpaper, 0);
  var soundOn = !!load(STORE.sound, true);
  var audioCtx = null;

  // ---- keys ----

  document.addEventListener('keydown', function (e) {
    if (mode === 'apps') handleAppsKey(e);
    else handleHomeKey(e);
  });

  function handleHomeKey(e) {
    var k = e.keyCode;
    var digit = k - KEY.DIGIT_1;
    if (k === KEY.LEFT) { setFocus(focused - 1); soundMove(); }
    else if (k === KEY.RIGHT) { setFocus(focused + 1); soundMove(); }
    else if (k === KEY.OK) open(focused);
    else if (digit >= 0 && digit < tiles.length) { setFocus(digit); open(digit); }
    else if (k === KEY.RED) { openAllApps(); soundMove(); }
    else if (k === KEY.GREEN) cycleWallpaper();
    else if (k === KEY.YELLOW) toggleSound();
    else if (k === KEY.BLUE) { soundOpen(); launch(SAMSUNG_HOME_APP, noHome); }
    else if (k === KEY.BACK) { /* this is the home screen, so stay */ }
    else return;
    e.preventDefault();
  }

  function handleAppsKey(e) {
    var k = e.keyCode;
    if (k === KEY.BACK || k === KEY.RED) closeAllApps();
    else if (k === KEY.OK) launchGridApp();
    else if (k === KEY.LEFT) { setGridFocus(gridFocus - 1); soundMove(); }
    else if (k === KEY.RIGHT) { setGridFocus(gridFocus + 1); soundMove(); }
    else if (k === KEY.UP) { setGridFocus(gridFocus - GRID_COLS); soundMove(); }
    else if (k === KEY.DOWN) { setGridFocus(gridFocus + GRID_COLS); soundMove(); }
    else if (k === KEY.GREEN) cycleWallpaper();
    else if (k === KEY.YELLOW) toggleSound();
    else return;
    e.preventDefault();
  }

  function registerKeys() {
    try {
      // '1'-'4' open tiles; the four colour keys drive the extra features.
      tizen.tvinputdevice.registerKeyBatch(
        ['1', '2', '3', '4', 'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue']);
    } catch (e) { /* arrows and OK still work */ }
  }

  // ---- home tiles ----

  function setFocus(index) {
    tiles[focused].classList.remove('is-focused');
    focused = Math.max(0, Math.min(tiles.length - 1, index));
    tiles[focused].classList.add('is-focused');
  }

  tiles.forEach(function (tile, i) {
    tile.addEventListener('mouseenter', function () { if (mode === 'home') setFocus(i); });
    tile.addEventListener('click', function () { if (mode === 'home') { setFocus(i); open(i); } });
  });

  function open(index) {
    if (launching) return; // a held OK button repeats; open once
    launching = true;
    soundOpen();
    setTimeout(function () { launching = false; }, LAUNCH_LOCK_MS);

    var key = tiles[index].getAttribute('data-open');
    if (key === 'tv') openLiveTv();
    else openApp(key, false);
  }

  function openLiveTv() {
    showTuner(function () {
      launch(TV_VIEWER_APP, function (err) {
        fail('Couldn\'t open TV channels (' + err.name + ').');
      });
    });
  }

  // Points the main picture at the antenna/cable tuner, so the TV viewer
  // shows channels even if an HDMI input was used last.
  function showTuner(next) {
    next = once(next);
    setTimeout(next, TUNER_TIMEOUT_MS);
    try {
      var current = tizen.tvwindow.getSource('MAIN');
      if (current && current.type === 'TV') return next();
      tizen.systeminfo.getPropertyValue('VIDEOSOURCE', function (info) {
        var tuner = findTuner(info);
        if (!tuner) return next();
        tizen.tvwindow.setSource(tuner, next, next, 'MAIN');
      }, next);
    } catch (e) {
      next();
    }
  }

  function findTuner(info) {
    var all = (info.connected || []).concat(info.disconnected || []);
    for (var i = 0; i < all.length; i++) {
      if (all[i].type === 'TV') return all[i];
    }
    return null;
  }

  // A missing or failing id gets one fresh look at the installed apps,
  // because apps can be installed, updated or removed after it was cached.
  function openApp(key, retried) {
    var app = APPS[key];
    var id = appIds[key] || (app.fallback && appIds[app.fallback]);
    var retry = function () { refreshApps(function () { openApp(key, true); }); };

    if (!id) {
      if (!retried) retry();
      else fail('Couldn\'t find ' + app.label + ' on this TV. Install it from the Samsung app store.');
      return;
    }
    launch(id, function (err) {
      if (!retried) retry();
      else fail('Couldn\'t open ' + app.label + ' (' + err.name + ').');
    });
  }

  function launch(appId, onError) {
    try {
      tizen.application.launch(appId, null, onError);
    } catch (e) {
      onError(e);
    }
  }

  function noHome(err) {
    fail('Couldn\'t open Samsung Home (' + err.name + ').');
  }

  function fail(message) {
    launching = false;
    toast(message);
  }

  // ---- all-apps grid ----

  function openAllApps() {
    mode = 'apps';
    appsScreen.classList.add('is-open');
    renderGrid();
    if (!allApps.length) refreshApps(renderGrid);
  }

  function closeAllApps() {
    mode = 'home';
    appsScreen.classList.remove('is-open');
  }

  function renderGrid() {
    appsGrid.innerHTML = '';
    if (!allApps.length) {
      appsEmpty.style.display = 'block';
      return;
    }
    appsEmpty.style.display = 'none';
    allApps.forEach(function (app, i) {
      var cell = document.createElement('div');
      cell.className = 'app-cell';
      var badge = document.createElement('span');
      badge.className = 'app-badge';
      badge.textContent = (app.name || '?').charAt(0).toUpperCase();
      var name = document.createElement('span');
      name.className = 'app-name';
      name.textContent = app.name || app.id;
      cell.appendChild(badge);
      cell.appendChild(name);
      cell.addEventListener('mouseenter', function () { setGridFocus(i); });
      cell.addEventListener('click', function () { setGridFocus(i); launchGridApp(); });
      appsGrid.appendChild(cell);
    });
    setGridFocus(gridFocus);
  }

  function setGridFocus(index) {
    var cells = appsGrid.children;
    if (!cells.length) return;
    if (cells[gridFocus]) cells[gridFocus].classList.remove('is-focused');
    gridFocus = Math.max(0, Math.min(cells.length - 1, index));
    var cell = cells[gridFocus];
    cell.classList.add('is-focused');
    // Keep the focused cell on screen without relying on scrollIntoView options.
    var top = cell.offsetTop, bottom = top + cell.offsetHeight;
    if (top < appsGrid.scrollTop) appsGrid.scrollTop = top - 20;
    else if (bottom > appsGrid.scrollTop + appsGrid.clientHeight) appsGrid.scrollTop = bottom - appsGrid.clientHeight + 20;
  }

  function launchGridApp() {
    var app = allApps[gridFocus];
    if (!app) return;
    soundOpen();
    launch(app.id, function (err) {
      toast('Couldn\'t open ' + (app.name || app.id) + ' (' + err.name + ').');
    });
  }

  // ---- installed apps ----

  function refreshApps(then) {
    if (then) afterList.push(then);
    if (listing) return;
    listing = true;

    var done = once(function () {
      listing = false;
      var queued = afterList;
      afterList = [];
      queued.forEach(function (fn) { fn(); });
    });
    setTimeout(done, LIST_TIMEOUT_MS);

    try {
      tizen.application.getAppsInfo(function (list) {
        var self = selfAppId();
        allApps = list
          .filter(function (a) { return a.show !== false && a.name && a.id !== self; })
          .sort(function (a, b) { return (a.name || '').localeCompare(b.name || ''); });
        Object.keys(APPS).forEach(function (key) {
          appIds[key] = findApp(APPS[key], allApps);
        });
        save(STORE.appIds, appIds);
        updateSubtitles();
        done();
      }, done);
    } catch (e) {
      done();
    }
  }

  function findApp(app, list) {
    var i, j;
    for (i = 0; i < app.ids.length; i++) {
      for (j = 0; j < list.length; j++) {
        if (list[j].id === app.ids[i]) return list[j].id;
      }
    }
    for (j = 0; j < list.length; j++) {
      if (app.name.test(list[j].name || '')) return list[j].id;
    }
    return null;
  }

  function selfAppId() {
    try { return tizen.application.getCurrentApplication().appInfo.id; } catch (e) { return null; }
  }

  function updateSubtitles() {
    setSub('stremio', 'stremio' in appIds && !appIds.stremio ? 'Not installed' : '');
    setSub('youtube', 'youtube' in appIds && !appIds.youtube ? 'Not installed' : '');
    setSub('ytmusic', 'ytmusic' in appIds && !appIds.ytmusic ? 'Opens in YouTube' : '');
  }

  function setSub(key, text) {
    var el = document.querySelector('[data-sub="' + key + '"]');
    if (el) el.textContent = text;
  }

  // ---- wallpapers ----

  function applyWallpaper() {
    if (!WALLPAPERS[wallpaper]) wallpaper = 0;
    var w = WALLPAPERS[wallpaper];
    document.body.className = w.cls || 'wp-photo';
    // Dark scrim over a photo so bright tiles and white text stay readable.
    document.body.style.backgroundImage = w.photo
      ? 'linear-gradient(rgba(6,8,12,0.5), rgba(6,8,12,0.5)), url("' + w.photo + '")'
      : '';
  }

  function cycleWallpaper() {
    wallpaper = (wallpaper + 1) % WALLPAPERS.length;
    applyWallpaper();
    save(STORE.wallpaper, wallpaper);
    soundMove();
    toast('Wallpaper: ' + WALLPAPERS[wallpaper].label);
  }

  // ---- navigation sounds (synthesised, no audio files) ----

  function toggleSound() {
    soundOn = !soundOn;
    save(STORE.sound, soundOn);
    if (soundOn) soundOpen();
    toast('Sound: ' + (soundOn ? 'on' : 'off'));
  }

  function beep(freq, duration, volume) {
    if (!soundOn) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume(); // e.g. after another app had the audio
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      var t = audioCtx.currentTime;
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.start(t);
      osc.stop(t + duration);
    } catch (e) { /* no audio: not important */ }
  }

  function soundMove() { beep(660, 0.045, 0.04); }
  function soundOpen() { beep(880, 0.07, 0.06); setTimeout(function () { beep(1245, 0.09, 0.05); }, 55); }

  // ---- storage (optional: without it nothing is remembered) ----

  function load(key, fallback) {
    try {
      var value = JSON.parse(localStorage.getItem(key));
      return value === null ? fallback : value;
    } catch (e) { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* not remembered */ }
  }

  // ---- clock, toast, layout ----

  function tick() {
    var now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    dateEl.textContent = now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
    clearTimeout(tickTimer);
    tickTimer = setTimeout(tick, 60050 - now.getSeconds() * 1000 - now.getMilliseconds());
  }

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-shown'); }, 4000);
  }

  // The TV gives the page exactly 1920x1080; a PC window is scaled to fit.
  function fitStage() {
    var scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    var css = scale === 1 ? '' : 'scale(' + scale + ')';
    var left = Math.max(0, (window.innerWidth - 1920 * scale) / 2) + 'px';
    stage.style.transform = css;
    appsScreen.style.transform = css;
    stage.style.left = left;
    appsScreen.style.left = left;
  }

  function once(fn) {
    var called = false;
    return function () {
      if (called) return;
      called = true;
      fn();
    };
  }

  // ---- start ----

  // Coming back from another app: reset to TV channels on the home screen.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    launching = false;
    closeAllApps();
    setFocus(0);
    tick();
  });

  window.addEventListener('resize', fitStage);
  applyWallpaper();
  fitStage();
  tick();
  updateSubtitles();

  // Talk to the TV only after the first frame is on screen.
  requestAnimationFrame(function () {
    setTimeout(function () {
      registerKeys();
      refreshApps();
    }, 0);
  });
})();
