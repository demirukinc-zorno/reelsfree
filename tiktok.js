// TikTok rules. When TikTok changes its site, this is the file to fix.
// TikTok's phone site has no messages, so the app opens TikTok as the desktop site, where
// /messages works. Everything else (For You, Explore, profiles, live) is sent to messages.
// Each block checks on("<feature>"); missing settings mean on.
(function () {
  function on(feature) {
    var settings = window.ReelsFreeSettings;
    return !settings || settings[feature] !== false;
  }

  // Sign-in and account pages must load, or you can't log in to reach your messages.
  var ALLOWED = /^\/(?:messages|login|signup|logout|passport|auth|oauth|legal|privacy|setting)(?:\/|$)/;
  var VIDEO = /^\/@[^\/]+\/(?:video|photo)\/\d+/;

  window.ReelsFreeRules = {
    rewrite: function (url) {
      if (!/(^|\.)tiktok\.com$/.test(url.hostname)) return null;  // Google / Apple sign-in pages
      var path = url.pathname;
      if (ALLOWED.test(path)) return null;
      // A video someone sends you opens a player you can scroll on from.
      if (VIDEO.test(path) && !on("sharedVideos")) return null;
      if (!on("messagesOnly")) return null;
      // Signed out, TikTok bounces /messages to For You; its sign-in page returns to messages afterwards.
      return url.origin + "/login?redirect_url=" + encodeURIComponent(url.origin + "/messages");
    },

    css: "",
    linkContains: [],
    cardSelector: null,

    sweep: function (document, helpers) {
      if (on("appPrompts")) helpers.hideAppPrompts();
      // Redirects can be bounced back (common.js stops after repeats), so never show a blocked page.
      var blocked = !!this.rewrite(new URL(location.href));
      document.documentElement.style.visibility = blocked ? "hidden" : "";
    }
  };
})();
