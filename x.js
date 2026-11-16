// X / Twitter (x.com) rules. When X changes its site, this is the file to fix.
// Each block checks on("<feature>"); the app's settings screen turns features off by setting
// window.ReelsFreeSettings[feature] = false before this file runs. Missing settings mean on.
(function () {
  function on(feature) {
    var settings = window.ReelsFreeSettings;
    return !settings || settings[feature] !== false;
  }

  window.ReelsFreeRules = {
    rewrite: function (url) {
      var path = url.pathname;

      // Tapping a video opens an immersive player where swiping moves on to other videos.
      // Open the tweet itself instead; the video still plays inline there.
      if (on("videoSwipe")) {
        var video = path.match(/^\/(\w+\/status\/\d+)\/video\/\d+\/?$/);
        if (video) return url.origin + "/" + video[1];
      }

      return null;
    },

    css: "",
    linkContains: [],
    cardSelector: null,

    sweep: function (document, helpers) {
      var FOR_YOU = /^(for you|sana özel)$/i;
      var FOLLOWING = /^(following|takip edilenler)$/i;
      var AD = /^(ad|promoted|reklam|tanıtılan)$/i;

      // Home timeline: hide the algorithmic "For you" tab and stay on "Following".
      if (on("forYou")) {
        var forYou = null;
        var following = null;
        document.querySelectorAll('[role="tab"]').forEach(function (tab) {
          var text = tab.textContent.trim();
          if (FOR_YOU.test(text)) forYou = tab;
          else if (FOLLOWING.test(text)) following = tab;
        });
        if (forYou && following) {
          if (forYou.getAttribute("aria-selected") === "true") following.click();
          helpers.hide(forYou.closest('[role="presentation"]') || forYou);
        }
      }

      // Promoted tweets carry a short "Ad" label outside the tweet text.
      if (on("ads")) {
        document.querySelectorAll('article[data-testid="tweet"]').forEach(function (tweet) {
          var labels = tweet.querySelectorAll("span");
          for (var i = 0; i < labels.length; i++) {
            var label = labels[i];
            // Tweet text and display names can say "Ad" too; only the label outside them counts.
            if (label.closest('[data-testid="tweetText"], [data-testid="User-Name"]')) continue;
            if (AD.test(label.textContent.trim())) {
              helpers.hide(tweet.closest('[data-testid="cellInnerDiv"]') || tweet);
              return;
            }
          }
        });
      }

      if (on("appPrompts")) helpers.hideAppPrompts();
    }
  };
})();
