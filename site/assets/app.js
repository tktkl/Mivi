import { catalog, categories, findMedia } from "./catalog.js";

const app = document.querySelector("#app");
const searchInput = document.querySelector("#search-input");
const loginDialog = document.querySelector("#login-dialog");
const loginForm = document.querySelector("#login-form");
const passwordInput = document.querySelector("#password");
const loginNotice = document.querySelector("#login-notice");
const passwordToggle = document.querySelector("#password-toggle");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const icon = (name, extraClass = "") => `<svg class="icon ${extraClass}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const byAdded = (a, b) => b.added - a.added;
const byRating = (a, b) => b.rating - a.rating || byAdded(a, b);
const duration = (item) => item.episodes ? `${item.episodes} episodes · ${item.minutes} min each` : `${Math.floor(item.minutes / 60)}h ${item.minutes % 60}m`;
const shortDuration = (item) => item.episodes ? `${item.episodes} episodes` : `${Math.floor(item.minutes / 60)}h ${item.minutes % 60}m`;

function currentRoute() {
  const raw = location.hash.slice(1) || "/";
  const separator = raw.indexOf("?");
  return {
    path: separator === -1 ? raw : raw.slice(0, separator),
    params: new URLSearchParams(separator === -1 ? "" : raw.slice(separator + 1)),
  };
}

function poster(item, extraClass = "", eager = false) {
  return `<div class="poster art-${item.art} ${extraClass}">
    <img class="atlas-image" src="assets/images/${item.atlas}.webp" alt="" width="1536" height="1728" loading="${eager ? "eager" : "lazy"}" decoding="async">
    <span class="poster-quality ${item.quality === "4K" ? "" : "quality-hd"}">${item.quality === "4K" ? "4K UHD" : "1080P"}</span>
    ${item.episodes ? `<span class="poster-episode">${item.episodes} EPS</span>` : ""}
    <span class="poster-title" lang="en">${escape(item.english)}</span>
  </div>`;
}

function card(item) {
  return `<a class="media-card" href="#/item/${item.id}" aria-label="View details for ${escape(item.title)}" data-media-id="${item.id}">
    <div class="card-art">${poster(item)}<span class="poster-hover"><span>${icon("play")}</span></span></div>
    <div class="card-title-line"><h3>${escape(item.title)}</h3><span class="card-rating">${icon("star")}${item.rating.toFixed(1)}</span></div>
    <p class="card-meta"><span>${item.year}</span><span>·</span><span>${escape(item.genres[0])}</span><span class="card-size">${item.size.toFixed(1)} GB</span></p>
  </a>`;
}

function section(title, english, items, href, id) {
  return `<section class="media-section" aria-labelledby="heading-${id}">
    <div class="section-heading"><div class="section-title"><h2 id="heading-${id}">${title}</h2><span lang="en">${english}</span></div>
      <div class="section-actions"><a class="section-more" href="${href}">View all${icon("chevron-right")}</a>
      <button class="icon-button" type="button" data-scroll="row-${id}" data-direction="-1" aria-label="Scroll ${title} left" disabled>${icon("chevron-left")}</button>
      <button class="icon-button" type="button" data-scroll="row-${id}" data-direction="1" aria-label="Scroll ${title} right">${icon("chevron-right")}</button></div>
    </div><div class="media-row" id="row-${id}" tabindex="0" role="region" aria-label="${title}">${items.map(card).join("")}</div>
  </section>`;
}

function tabs(active = "all") {
  const links = [["all", "All"], ["movies", "Movies"], ["series", "TV Shows"], ["documentaries", "Documentaries"]];
  return `<nav class="browse-tabs" aria-label="Media types">${links.map(([key, title]) => `<a class="browse-tab" href="#/library/${key}" ${active === key ? 'aria-current="page"' : ""}>${title}</a>`).join("")}</nav>`;
}

function hero() {
  const item = catalog[0];
  return `<section class="hero" aria-labelledby="hero-title">
    <img class="hero-image" src="assets/images/hero.webp" alt="A lone astronaut crosses red dunes beneath a vast alien planet and sandstone cliffs" width="1920" height="1080" fetchpriority="high" decoding="async">
    <div class="hero-copy"><p class="hero-eyebrow">${icon("star")}MIVI WEEKLY PICK</p>
    <h2 id="hero-title">${item.title}</h2><p class="hero-english" lang="en">BEYOND THE LAST HORIZON</p>
    <div class="hero-meta"><span class="rating">${icon("star")}${item.rating}</span><span>${item.year}</span><span>Sci-Fi / Adventure</span><span>${shortDuration(item)}</span></div>
    <p class="hero-summary">Across silent stars and seas of red sand, one explorer searches for a way home.<br>Some journeys change what home means.</p>
    <div class="hero-actions"><button class="button button-primary" type="button" data-login="${item.id}">${icon("play", "icon-play")}Play now</button><a class="button button-secondary" href="#/item/${item.id}">${icon("info")}More info</a></div>
    <div class="hero-formats"><span class="format-badge gold">4K ULTRA HD</span><span class="format-badge">HDR10+</span><span class="format-badge">DOLBY ATMOS</span></div></div>
    <div class="hero-edition"><strong>THE REMUX EDITION</strong>75.8 Mbps <span> / </span> 78.4 GB</div>
  </section>`;
}

function renderHome() {
  app.innerHTML = `<div class="page-intro"><div><h1>Your next great story.</h1><p>A world of cinema. A collection of your own.</p></div><span class="collection-note">${icon("layers")}${catalog.length} curated titles</span></div>
    ${hero()}<div class="home-browse">${tabs()}<span class="browse-tabs-label">${icon("check")}Every frame, just as it was meant to be.</span></div>
    ${section("Recently added", "JUST ADDED", [...catalog].sort(byAdded).slice(0, 8), "#/library/recent", "recent")}
    ${section("4K essentials", "THE REMUX COLLECTION", catalog.filter((item) => item.quality === "4K").sort(byRating).slice(0, 8), "#/library/4k", "remux")}
    ${section("One more episode", "TV SERIES", catalog.filter((item) => item.category === "series"), "#/library/series", "series")}
    ${section("Explore our world", "DOCUMENTARIES", catalog.filter((item) => item.category === "documentaries"), "#/library/documentaries", "documentaries")}`;
}

function libraryData(key) {
  const special = {
    all: { title: "All media", english: "THE COLLECTION", description: "Movies, shows and documentaries. All in one private collection.", items: catalog },
    recent: { title: "Recently added", english: "JUST ADDED", description: "Fresh additions. Something new to look forward to.", items: catalog },
    top: { title: "Top rated", english: "HIGHLY RATED", description: "Our highest-rated picks. Every title rated 9.0 or above.", items: catalog.filter((item) => item.rating >= 9) },
    "4k": { title: "4K Remux", english: "THE UHD COLLECTION", description: "High bitrates. Beautiful detail. Cinema in its finest form.", items: catalog.filter((item) => item.quality === "4K") },
  };
  if (Object.hasOwn(special, key)) return special[key];
  if (Object.hasOwn(categories, key)) return { ...categories[key], items: catalog.filter((item) => item.category === key) };
  return null;
}

function sortItems(items, sort) {
  return [...items].sort(sort === "rating" ? byRating : sort === "year" ? (a, b) => b.year - a.year || byRating(a, b) : byAdded);
}

function sortSelect(value) {
  return `<select class="sort-select" id="sort-select" aria-label="Sort titles"><option value="recent" ${value === "recent" ? "selected" : ""}>Recently added</option><option value="rating" ${value === "rating" ? "selected" : ""}>Top rated</option><option value="year" ${value === "year" ? "selected" : ""}>Release year</option></select>`;
}

function renderLibrary(key, params) {
  const library = libraryData(key);
  if (!library) return renderNotFound();
  const sort = params.get("sort") || (key === "top" ? "rating" : "recent");
  app.innerHTML = `<div class="library-intro"><p class="eyebrow">${library.english}</p><h1>${library.title}</h1><p>${library.description}</p></div>
    <div class="library-tools">${tabs(key)}${sortSelect(sort)}</div><p class="result-count"><strong>${library.items.length}</strong> titles in your collection</p>
    <div class="library-grid">${sortItems(library.items, sort).map(card).join("")}</div>`;
}

function searchCatalog(query) {
  const tokens = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  return catalog.filter((item) => {
    const text = [item.title, item.english, item.year, ...item.genres, item.quality, item.codec, item.hdr, categories[item.category].title].join(" ").toLocaleLowerCase();
    return tokens.every((word) => text.includes(word));
  });
}

function renderSearch(params) {
  const query = (params.get("q") || "").slice(0, 120);
  const matches = searchCatalog(query);
  app.innerHTML = `<div class="library-intro"><p class="eyebrow">SEARCH YOUR COLLECTION</p><h1>Search your collection</h1><p>Find your next watch by title, genre, year or quality.</p></div>
    <div class="library-tools"><p class="result-count search-result-count">${query ? `${escape(query)} · <strong>${matches.length}</strong> results` : "Type a few words to discover your next great story."}</p>${matches.length ? sortSelect(params.get("sort") || "recent") : ""}</div>
    ${matches.length ? `<div class="library-grid">${sortItems(matches, params.get("sort")).map(card).join("")}</div>` : `<section class="empty-state">${icon("search")}<h2>${query ? "No titles found" : "What would you like to watch?"}</h2><p>${query ? "Try a different title, or search for Sci-Fi, 4K or Documentaries." : "Search for The Wanderer, or explore a collection to get started."}</p><a class="button button-secondary" href="#/library/all">Browse all media${icon("arrow-right")}</a></section>`}`;
}

function renderDetail(id) {
  const item = findMedia(id);
  if (!item) return renderNotFound();
  const category = categories[item.category];
  const fileDetails = [
    ["Edition", item.edition], [item.episodes ? "Season size" : "File size", `${item.size.toFixed(1)} GB`], ["Video bitrate", `${item.bitrate.toFixed(1)} Mbps`], ["Resolution", item.quality === "4K" ? "3840 × 2160 · 4K UHD" : "1920 × 1080 · Full HD"],
    ["Video codec", item.codec], ["Dynamic range", item.hdr], ["Audio", item.audio], ["Subtitles", "English / Spanish / French"],
  ];
  app.innerHTML = `<a class="back-link" href="#/library/${item.category}">${icon("arrow-left")}Back to ${category.title}</a>
    <section class="detail-shell" aria-labelledby="detail-title">
    ${item.id === "wanderer" ? '<img class="detail-backdrop" src="assets/images/hero.webp" width="1920" height="1080" alt="">' : `<div class="detail-backdrop-poster" aria-hidden="true">${poster(item, "", true)}</div>`}
    <div class="detail-layout">${poster(item, "detail-poster", true)}<div class="detail-copy">
      <p class="detail-type">MIVI ${category.english} COLLECTION</p><h1 id="detail-title">${item.title}</h1><p class="detail-english" lang="en">${item.edition}</p>
      <div class="hero-meta"><span class="rating">${icon("star")}${item.rating.toFixed(1)}</span><span>${item.year}</span><span>${duration(item)}</span></div>
      <div class="detail-genres">${item.genres.map((genre) => `<span class="genre-tag">${genre}</span>`).join("")}<span class="genre-tag">${item.quality}</span></div>
      <p class="detail-summary">${item.synopsis}</p><button class="button button-primary" type="button" data-login="${item.id}">${icon("play", "icon-play")}Play now</button>
    </div></div></section>
    <section class="file-panel" aria-labelledby="file-heading"><h2 id="file-heading">${icon("drive")}Media information</h2><dl class="file-grid">${fileDetails.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl></section>
    ${section("You might also like", "MORE TO DISCOVER", catalog.filter((other) => other.category === item.category && other.id !== item.id).sort(byRating).slice(0, 8), `#/library/${item.category}`, "related")}`;
}

function renderNotFound() {
  app.innerHTML = `<section class="empty-state">${icon("film")}<h1>This page is off the reel</h1><p>This title is not in the collection. Head back and discover another story.</p><a class="button button-primary" href="#/">Back to home${icon("arrow-right")}</a></section>`;
}

function updateScrollButtons(row) {
  const max = row.scrollWidth - row.clientWidth;
  for (const button of app.querySelectorAll(`[data-scroll="${row.id}"]`)) {
    button.disabled = Number(button.dataset.direction) < 0 ? row.scrollLeft <= 2 : row.scrollLeft >= max - 2;
  }
}

function renderRoute(keepScroll = false) {
  const { path, params } = currentRoute();
  const libraryMatch = path.match(/^\/library\/([a-z0-9-]+)$/);
  const itemMatch = path.match(/^\/item\/([a-z0-9-]+)$/);
  let active = "home";
  let label = "Discover";

  if (path === "/") {
    renderHome();
    document.title = "Mivi · Your Private Cinema";
  } else if (libraryMatch) {
    const library = libraryData(libraryMatch[1]);
    active = library ? libraryMatch[1] : "";
    label = library?.title || "Not found";
    renderLibrary(libraryMatch[1], params);
    document.title = `${label} · Mivi`;
  } else if (itemMatch) {
    const item = findMedia(itemMatch[1]);
    active = item?.category || "";
    label = item?.title || "Not found";
    renderDetail(itemMatch[1]);
    document.title = `${label} · Mivi`;
  } else if (path === "/search") {
    active = "";
    label = "Search";
    renderSearch(params);
    document.title = "Search your collection · Mivi";
  } else {
    active = "";
    label = "Not found";
    renderNotFound();
    document.title = "Not found · Mivi";
  }

  document.querySelector("#breadcrumb-current").textContent = label;
  for (const link of document.querySelectorAll("[data-nav]")) {
    if (link.dataset.nav === active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
    // Collapsed desktop navigation still has an accessible name and a tooltip.
    link.setAttribute("aria-label", link.textContent.trim().replace(/\s+/g, " "));
    link.title = link.textContent.trim().replace(/\s+/g, " ");
  }
  if (document.activeElement !== searchInput) searchInput.value = path === "/search" ? (params.get("q") || "").slice(0, 120) : "";
  for (const row of app.querySelectorAll(".media-row")) {
    updateScrollButtons(row);
    row.addEventListener("scroll", () => updateScrollButtons(row), { passive: true });
  }
  if (!keepScroll) window.scrollTo({ top: 0, behavior: "instant" });
}

function showLogin(mediaId) {
  if (loginDialog.open) return;
  const item = findMedia(mediaId);
  document.querySelector("#login-title").textContent = item ? `Sign in to watch ${item.title}` : "Sign in to Mivi";
  loginNotice.hidden = true;
  document.documentElement.classList.add("dialog-open");
  loginDialog.showModal();
  document.querySelector("#username").focus({ preventScroll: true });
}

function restrictLogin(event) {
  event?.preventDefault();
  // Deliberately do not read, validate, transmit, log or persist either input.
  // This is an invitation notice, never a simulated authentication response.
  passwordInput.value = "";
  passwordInput.type = "password";
  passwordToggle.setAttribute("aria-label", "Show password");
  passwordToggle.setAttribute("aria-pressed", "false");
  loginNotice.hidden = false;
}

document.addEventListener("click", (event) => {
  const target = event.target.closest?.("[data-login], [data-close-login], [data-scroll]");
  if (!target) return;
  if (target.hasAttribute("data-login")) showLogin(target.dataset.login);
  if (target.hasAttribute("data-close-login")) loginDialog.close();
  if (target.hasAttribute("data-scroll")) {
    const row = document.getElementById(target.dataset.scroll);
    row?.scrollBy({ left: Number(target.dataset.direction) * row.clientWidth * .8, behavior: reducedMotion.matches ? "instant" : "smooth" });
  }
});

loginForm.addEventListener("submit", restrictLogin);
loginDialog.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const controls = [...loginDialog.querySelectorAll("button:not([disabled]), input:not([disabled])")];
  const first = controls[0];
  const last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
document.querySelector("#login-submit").addEventListener("click", restrictLogin);
loginForm.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.target.matches("input")) restrictLogin(event);
});
passwordToggle.addEventListener("click", () => {
  const reveal = passwordInput.type === "password";
  passwordInput.type = reveal ? "text" : "password";
  passwordToggle.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
  passwordToggle.setAttribute("aria-pressed", String(reveal));
});
loginDialog.addEventListener("click", (event) => {
  if (event.target === loginDialog) loginDialog.close();
});
loginDialog.addEventListener("close", () => {
  loginForm.reset();
  passwordInput.type = "password";
  passwordToggle.setAttribute("aria-label", "Show password");
  passwordToggle.setAttribute("aria-pressed", "false");
  loginNotice.hidden = true;
  document.documentElement.classList.remove("dialog-open");
});

function updateSearch(replace = false) {
  const query = searchInput.value.trim();
  const next = query ? `/search?q=${encodeURIComponent(query)}` : "/search";
  if (replace && currentRoute().path === "/search") {
    history.replaceState(null, "", `#${next}`);
    renderRoute(true);
  } else if (location.hash !== `#${next}`) {
    location.hash = next;
  }
}
document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  updateSearch(true);
});
searchInput.addEventListener("input", () => updateSearch(true));
document.addEventListener("keydown", (event) => {
  const typing = event.target.matches?.("input, textarea, select, [contenteditable]");
  if (event.key === "/" && !typing && !loginDialog.open) {
    event.preventDefault();
    searchInput.focus();
  }
});
app.addEventListener("change", (event) => {
  if (event.target.id !== "sort-select") return;
  const { path, params } = currentRoute();
  params.set("sort", event.target.value);
  history.replaceState(null, "", `#${path}?${params.toString()}`);
  renderRoute(true);
});
window.addEventListener("hashchange", () => {
  if (loginDialog.open) loginDialog.close();
  renderRoute();
});
window.addEventListener("resize", () => app.querySelectorAll(".media-row").forEach(updateScrollButtons), { passive: true });
// A back/forward cache restore must not resurrect credentials in the form.
window.addEventListener("pageshow", () => loginForm.reset());
document.querySelector(".skip-link").addEventListener("click", (event) => {
  event.preventDefault();
  document.querySelector("#main-content").focus();
});
renderRoute();
