/* ---------- Local map selection repair: preserve the existing 4-card UI ---------- */
(function(){
  "use strict";

  const mapScreen = document.getElementById("localMapScreen");
  const grid = document.getElementById("localMapGrid");
  const start = document.getElementById("btnStartLocalMap");
  const hint = document.getElementById("localMapSelectionHint");
  if (!mapScreen || !grid || !start) return;

  const cards = Array.from(grid.querySelectorAll(".local-map-card"));
  const mapImages = {
    space: "space-zone-lobby.png",
    asteroid: "asteroid-zone-lobby.png",
    neon: "neon-zone-lobby.png",
    "black-hole": "black-hole-zone-lobby.png"
  };

  // Resolve against this script's own location (not document.baseURI), since the
  // app shell can load index.html through a base URL that doesn't match the
  // folder the PNGs actually live in — that mismatch is what breaks loading.
  const scriptEl = document.currentScript;
  const assetBase = scriptEl ? scriptEl.src : document.baseURI;

  // Keep the existing image elements and filenames; only make sure they are loaded.
  cards.forEach(function(card){
    const key = card.getAttribute("data-map");
    const img = card.querySelector(".local-map-image img");
    if (img && mapImages[key]) {
      const resolvedSrc = new URL(mapImages[key], assetBase).href;
      img.addEventListener("error", function onErr(){
        // Fall back once to a plain document-relative path in case assetBase was wrong.
        img.removeEventListener("error", onErr);
        if (img.src !== mapImages[key]) img.src = mapImages[key];
      });
      img.src = resolvedSrc;
      img.style.display = "block";
    }
    card.setAttribute("aria-selected", "false");
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
  });

  function selectMap(card){
    cards.forEach(function(c){
      c.classList.remove("selected");
      c.setAttribute("aria-selected", "false");
    });

    card.classList.add("selected");
    card.setAttribute("aria-selected", "true");

    const key = card.getAttribute("data-map");
    window.__orbexLocalMapKey = key;

    // Preserve the selected map for the existing game-map renderer.
    window.__orbexGameMapKey = key;
    window.__orbexGameMapImage = card.querySelector(".local-map-image img");

    const label = card.querySelector(".local-map-card-label");
    if (hint) {
      hint.textContent = (label ? label.textContent.trim() : "MAP") + " SELECTED";
    }

    start.classList.remove("locked");
    start.setAttribute("aria-disabled", "false");
    start.disabled = false;
  }

  cards.forEach(function(card){
    card.addEventListener("click", function(){
      selectMap(card);
    });
    card.addEventListener("keydown", function(ev){
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        selectMap(card);
      }
    });
  });

  start.addEventListener("click", function(){
    const key = window.__orbexLocalMapKey;
    if (!key) return;

    const selected = cards.find(function(card){
      return card.getAttribute("data-map") === key;
    });
    if (selected) {
      window.__orbexGameMapImage = selected.querySelector(".local-map-image img");
      window.__orbexGameMapKey = key;
    }

    // Xt() is the existing Local Mode game-start function. Do not alter gameplay.
    if (typeof window.__orbexStartLocalMatch === "function") {
      window.__orbexStartLocalMatch();
    }
  });
})();

