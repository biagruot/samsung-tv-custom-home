/* PC preview only. The TV provides window.tizen, so on the TV this file
   returns immediately. In a browser it fakes the few calls app.js makes and
   shows what would have been opened. Add ?nostremio to the URL to preview a
   TV without Stremio. */
(function () {
  'use strict';
  if (window.tizen) return;

  // Keyboard stand-ins for remote keys a PC doesn't have:
  // R G Y B are the colour keys, Esc or Backspace is Back.
  var remoteKeys = { 82: 403, 71: 404, 89: 405, 66: 406, 27: 10009, 8: 10009 };
  window.addEventListener('keydown', function (e) {
    var code = remoteKeys[e.keyCode];
    if (!code) return;
    e.stopPropagation();
    e.preventDefault();
    var remote = new Event('keydown', { bubbles: true, cancelable: true });
    remote.keyCode = code;
    document.dispatchEvent(remote);
  }, true);

  // A plausible set of installed apps, so the all-apps grid looks real.
  var apps = [
    { id: '9Ur5IzDKqV.TizenYouTube', name: 'YouTube', show: true },
    { id: 'org.tizen.netflix-app', name: 'Netflix', show: true },
    { id: 'org.tizen.primevideo', name: 'Prime Video', show: true },
    { id: '3201606009684.DisneyPlus', name: 'Disney+', show: true },
    { id: '11101200001.SpotifyTV', name: 'Spotify', show: true },
    { id: 'org.tizen.browser', name: 'Internet', show: true },
    { id: 'MCmYXNxgcu.DaznTV', name: 'DAZN', show: true },
    { id: 'org.tizen.apple.apple-music', name: 'Apple TV', show: true },
    { id: 'rViGl5mw2l.RaiPlay', name: 'RaiPlay', show: true },
    { id: 'kk8MbItQ0H.VprimePlay', name: 'Plex', show: true }
  ];
  if (location.search.indexOf('nostremio') < 0) {
    apps.push({ id: 'Preview0St.Stremio', name: 'Stremio', show: true });
  }

  var alwaysKnown = { 'org.tizen.tv-viewer': 1, 'com.samsung.tv.csfs': 1 };
  var source = { type: 'HDMI', number: 1 };

  function later(fn, arg) {
    setTimeout(function () { if (fn) fn(arg); }, 120);
  }

  function announce(text) {
    var el = document.getElementById('preview-banner');
    if (!el) {
      el = document.createElement('div');
      el.id = 'preview-banner';
      el.style.cssText = 'position:fixed;right:16px;top:16px;padding:10px 16px;border-radius:10px;' +
        'background:#ffd54a;color:#111;font:600 16px/1.3 Segoe UI,Arial,sans-serif;z-index:9';
      document.body.appendChild(el);
    }
    el.textContent = 'Preview: ' + text;
  }

  window.tizen = {
    application: {
      getAppsInfo: function (ok) { later(ok, apps); },
      getCurrentApplication: function () { return { appInfo: { id: 'QuickHome1.Launcher' } }; },
      launch: function (id, ok, err) {
        var known = alwaysKnown[id] || apps.some(function (a) { return a.id === id; });
        if (!known) { later(err, { name: 'NotFoundError' }); return; }
        announce('would open ' + id + (id === 'org.tizen.tv-viewer' ? ' on ' + source.type : ''));
        later(ok);
      }
    },
    systeminfo: {
      getPropertyValue: function (name, ok) {
        later(ok, { connected: [{ type: 'TV', number: 1 }, { type: 'HDMI', number: 1 }], disconnected: [] });
      }
    },
    tvwindow: {
      getSource: function () { return source; },
      setSource: function (src, ok) { source = src; later(ok, src); }
    },
    tvinputdevice: {
      registerKeyBatch: function () {}
    }
  };
})();
