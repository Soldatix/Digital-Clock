/* Digital Clock — original Adsterra GET CODE in native Alarm / Timer views.
 * Only an intentional full page navigation (?clockTool=alarm|timer) can load ads.
 * The ordinary clock page does not request an Adsterra banner.
 * Only original parser-time tag (no custom iframe, no document.write after load).
 * No repeated requests on app events, no auto-refresh, no requests offline.
 */
(() => {
  "use strict";
  if (location.hostname !== "digitalclock.appsandgames.org") return;
  if (document.readyState !== "loading" || navigator.onLine === false) return;

  const route = new URLSearchParams(location.search).get("clockTool");
  if (route !== "alarm" && route !== "timer") return;
  const current = document.currentScript;
  const slot = current?.parentElement;
  const area = slot?.parentElement;
  const view = current?.dataset.view;
  const size = current?.dataset.size;
  if (view !== route || !(view === "alarm" || view === "timer")) return;
  if (!slot?.classList.contains("clock-ad-unit") ||
      !area?.classList.contains("clock-ad-area") ||
      area?.closest(".app-container")?.id !== view + "Container") return;

  const desktop = matchMedia("(min-width: 800px)").matches;
  const mobile = matchMedia("(min-width: 320px) and (max-width: 799px)").matches;
  if (!((size === "desktop" && desktop) || (size === "mobile" && mobile))) return;

  let allowed = false;
  try {
    const cookie = document.cookie.split(";").map(s => s.trim())
      .find(s => s.startsWith("ag_privacy_choices_v1="));
    const choice = cookie && JSON.parse(decodeURIComponent(
      cookie.slice("ag_privacy_choices_v1=".length)));
    const age = choice && Date.now() - choice.timestamp;
    allowed = !!choice && choice.version === 1 &&
      choice.partnerRevision === "adsterra-2026-11" &&
      choice.advertising === true &&
      Number.isFinite(age) && age >= 0 &&
      age <= 180 * 24 * 60 * 60 * 1000;
  } catch (_) { allowed = false; }
  if (!allowed) return;

  const tags = {
    desktop: "<script>\n  atOptions = {\n    'key' : 'da8b4ca18aa474582835367a9da067ff',\n    'format' : 'iframe',\n    'height' : 90,\n    'width' : 728,\n    'params' : {}\n  };\n</script>\n<script src=\"https://bauval.org/22/da8b4ca18aa474582835367a9da067ff\"></script>",
    mobile: "<script>\n  atOptions = {\n    'key' : '5cd403c621a96eff09faffd7bb0ea19e',\n    'format' : 'iframe',\n    'height' : 50,\n    'width' : 320,\n    'params' : {}\n  };\n</script>\n<script src=\"https://bauval.org/22/5cd403c621a96eff09faffd7bb0ea19e\"></script>"
  };
  area.hidden = false;
  slot.hidden = false;
  const label = document.createElement("span");
  label.textContent = "Advertisement";
  label.className = "clock-ad-label";
  slot.insertBefore(label, current);
  document.write(tags[size]);
})();
