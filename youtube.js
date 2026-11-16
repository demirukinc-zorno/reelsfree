// YouTube (m.youtube.com) rules. When YouTube changes its site, this is the file to fix.
// Each block checks on("<feature>"); the app's settings screen turns features off by setting
// window.ReelsFreeSettings[feature] = false before this file runs. Missing settings mean on.
(function () {
  function on(feature) {
    var settings = window.ReelsFreeSettings;
    return !settings || settings[feature] !== false;
  }

  // Background audio: YouTube pauses playback when the page reports itself hidden, which is
  // what happens when the app goes to the background. Report the page as always visible.
  if (on("backgroundAudio")) {
    try {
      Object.defineProperty(document, "hidden", { configurable: true, get: function () { return false; } });
      Object.defineProperty(document, "visibilityState", { configurable: true, get: function () { return "visible"; } });
      document.addEventListener("visibilitychange", function (event) { event.stopImmediatePropagation(); }, true);
    } catch (e) {}
  }

  var shortsCss = [
    "ytm-reel-shelf-renderer",
    "ytm-shorts-lockup-view-model",
    "ytm-shorts-lockup-view-model-v2",
    "ytm-rich-section-renderer:has(ytm-shorts-lockup-view-model)",
    "ytm-rich-section-renderer:has(ytm-shorts-lockup-view-model-v2)",
    "ytm-rich-section-renderer:has(ytm-reel-shelf-renderer)",
    "grid-shelf-view-model:has(ytm-shorts-lockup-view-model)",
    "grid-shelf-view-model:has(ytm-shorts-lockup-view-model-v2)",
    "ytm-item-section-renderer:has(ytm-reel-shelf-renderer)",
    "ytm-pivot-bar-item-renderer:has(.pivot-shorts)",
    'ytm-pivot-bar-item-renderer:has(a[href^="/shorts"])'
  ];
  var playablesCss = [
    'ytm-rich-section-renderer:has(a[href*="/playables"])',
    'grid-shelf-view-model:has(a[href*="/playables"])',
    'ytm-item-section-renderer:has(a[href*="/playables"])',
    'ytm-compact-link-renderer:has(a[href*="/playables"])',
    'ytm-pivot-bar-item-renderer:has(a[href*="/playables"])'
  ];
  var css = [].concat(on("shortsFeed") ? shortsCss : [], on("playables") ? playablesCss : []);

  window.ReelsFreeRules = {
    rewrite: function (url) {
      var path = url.pathname;

      // A Short opens as a normal video page, which has no swipe-to-next.
      if (on("shortsSwipe")) {
        var short = path.match(/^\/shorts\/([\w-]{6,})/);
        if (short) return url.origin + "/watch?v=" + short[1];
      }

      if (on("shortsFeed")) {
        if (/^\/(?:feed\/)?shorts\/?$/.test(path)) return url.origin + "/";

        // A channel's Shorts tab: go to the channel's home tab.
        var channelShorts = path.match(/^\/(@[^\/]+|channel\/[^\/]+|c\/[^\/]+|user\/[^\/]+)\/shorts\/?$/);
        if (channelShorts) return url.origin + "/" + channelShorts[1];
      }

      // Playables (YouTube's built-in games).
      if (on("playables") && /^\/(?:feed\/)?playables(?:\/|$)/.test(path)) return url.origin + "/";

      return null;
    },

    css: css.length ? css.join(",\n") + " { display: none !important; }" : "",

    // Any remaining card that links to a Short or a game is hidden as a whole.
    linkContains: [on("shortsFeed") && "/shorts/", on("playables") && "/playables"].filter(Boolean),
    cardSelector: [
      "ytm-rich-item-renderer",
      "ytm-video-with-context-renderer",
      "ytm-compact-video-renderer",
      "ytm-reel-item-renderer",
      "ytm-shorts-lockup-view-model",
      "ytm-shorts-lockup-view-model-v2"
    ].join(",")
  };
})();
