// Carries the ad tags a visitor arrived with (the utm_ tags and the X and
// Google click IDs) onto every Get started link, so the app can record which
// post or ad brought a signup. The tags stay in this browser for 30 days and
// go nowhere else. A browser that sends Do Not Track or Global Privacy
// Control keeps none.
(function () {
  var TAGS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "twclid"];
  var KEY = "claimsnative.signupSource";
  var KEEP_MS = 30 * 24 * 60 * 60 * 1000;

  if (navigator.globalPrivacyControl === true || navigator.doNotTrack === "1") return;

  // The same rule the app applies: allowlisted tags, short printable ASCII.
  function clean(params) {
    var tags = null;
    TAGS.forEach(function (tag) {
      var value = (params.get(tag) || "").trim();
      if (value && value.length <= 200 && /^[\x20-\x7e]+$/.test(value)) {
        tags = tags || {};
        tags[tag] = value;
      }
    });
    return tags;
  }

  var tags = clean(new URLSearchParams(location.search));
  try {
    if (tags) {
      localStorage.setItem(KEY, JSON.stringify({ tags: tags, saved: Date.now() }));
    } else {
      var stored = JSON.parse(localStorage.getItem(KEY) || "null");
      if (stored && stored.tags && Date.now() - stored.saved < KEEP_MS) {
        tags = clean(new URLSearchParams(stored.tags));
      } else {
        localStorage.removeItem(KEY);
      }
    }
  } catch (error) {
    // Storage is off or the saved value is unreadable: use this address's tags only.
  }
  if (!tags) return;

  document.querySelectorAll('a[href^="https://app.claimsnative.com/signup"]').forEach(function (link) {
    var url = new URL(link.href);
    Object.keys(tags).forEach(function (tag) {
      if (!url.searchParams.has(tag)) url.searchParams.set(tag, tags[tag]);
    });
    link.href = url.toString();
  });
})();
