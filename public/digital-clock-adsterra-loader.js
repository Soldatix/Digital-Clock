/* Digital Clock: original Adsterra iframe GET CODE, one unique code per tool and viewport.
 * Only explicit navigations to the selected tool can request an ad. Main clock and
 * screen saver are ad-free. Parser-time injection only; no refresh, no retries.
 */
(() => {
  "use strict";
  if (location.hostname !== "digitalclock.appsandgames.org") return;
  if (document.readyState !== "loading" || navigator.onLine === false) return;

  // Adsterra support provisioned separate placement IDs for all four tool views.
  const placements = {
    alarm: {
      desktop: "da8b4ca18aa474582835367a9da067ff",
      mobile: "5cd403c621a96eff09faffd7bb0ea19e"
    },
    timer: {
      desktop: "3753f3ac0331c324a30da85083b91b9b",
      mobile: "00b088b7f9ffaf325114177919e9f419"
    },
    stopwatch: {
      desktop: "185bb6347703c3bed86d52e8d00640ad",
      mobile: "5d6cde9a8584bb848da4a49dc81db115"
    },
    worldClock: {
      desktop: "b8a26c18b2e51fa7388f54cba2176cb3",
      mobile: "63d8ae61ae1cc25b787a3122c624117c"
    }
  };

  const route = new URLSearchParams(location.search).get("clockTool");
  if (!Object.prototype.hasOwnProperty.call(placements, route)) return;
  const current = document.currentScript;
  const slot = current?.parentElement;
  const area = slot?.parentElement;
  const view = current?.dataset.view;
  const size = current?.dataset.size;
  if (view !== route || !Object.prototype.hasOwnProperty.call(placements[route], size)) return;
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

  const key = placements[route][size];
  const height = size === "desktop" ? 90 : 50;
  const width = size === "desktop" ? 728 : 320;
  const originalGetCode = "<script>\n  atOptions = {\n    'key' : '" + key +
    "',\n    'format' : 'iframe',\n    'height' : " + height +
    ",\n    'width' : " + width +
    ",\n    'params' : {}\n  };\n</script>\n" +
    '<script src="https://bauval.org/22/' + key + '"></script>';
  area.hidden = false;
  slot.hidden = false;
  const label = document.createElement("span");
  label.textContent = "Advertisement";
  label.className = "clock-ad-label";
  slot.insertBefore(label, current);
  document.write(originalGetCode);
})();
