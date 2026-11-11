import { test, expect } from "@playwright/test";
import { catalog } from "../site/assets/catalog.js";

test("the international site defaults to English, including all media descriptions", async ({ page }) => {
  expect(catalog).toHaveLength(24);
  expect(new Set(catalog.map((item) => item.id)).size).toBe(24);
  for (const item of catalog) {
    expect(item.title).toMatch(/^[A-Z]/);
    expect(item.synopsis.length).toBeGreaterThan(70);
    expect(JSON.stringify(item)).not.toMatch(/\p{Script=Han}/u);
    if (item.episodes !== undefined) expect(Number.isInteger(item.episodes) && item.episodes > 0).toBe(true);
  }
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("body")).not.toContainText(/\p{Script=Han}/u);
  await page.locator(".topbar [data-login]").click();
  await expect(page.getByRole("heading", { name: "Sign in to Mivi" })).toBeVisible();
  await expect(page.locator("#login-subtitle")).toHaveText("Private library. Access is by invitation only.");
});

test("browse all 24 media entries and filter real local categories", async ({ page }) => {
  await page.goto("/#/library/all");
  await expect(page.locator(".media-card")).toHaveCount(24);
  for (const [category, title, count] of [["movies", "Movies", 12], ["series", "TV Shows", 8], ["documentaries", "Documentaries", 4]]) {
    await page.locator(`.sidebar [data-nav="${category}"]`).click();
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
    await expect(page.locator(".media-card")).toHaveCount(count);
  }
  await page.goto("/#/library/4k");
  await expect(page.locator(".media-card")).toHaveCount(20);
  await expect(page.locator(".poster-quality.quality-hd")).toHaveCount(0);
});

test("search supports case-insensitive titles, genres and an empty result", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox");
  await search.fill("wanderer");
  await expect(page.locator(".media-card")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "View details for The Wanderer" })).toBeVisible();
  await search.fill("THE WANDERER");
  await expect(page.locator(".media-card")).toHaveCount(1);
  await search.fill("Sci-Fi 4K");
  await expect(page.locator(".media-card")).toHaveCount(4);
  await search.fill("not-in-this-library");
  await expect(page.getByRole("heading", { name: "No titles found" })).toBeVisible();
  await search.fill("");
  await expect(page.getByRole("heading", { name: "What would you like to watch?" })).toBeVisible();
});

test("search strings are displayed as text, never executable markup", async ({ page }) => {
  await page.goto(`/#/search?q=${encodeURIComponent('<img src=x onerror="window.injected=true">')}`);
  await expect(page.locator(".search-result-count")).toContainText('<img src=x onerror="window.injected=true">');
  expect(await page.evaluate(() => window.injected)).toBeUndefined();
  await expect(page.locator("#app img")).toHaveCount(0);
});

test("detail routes survive refresh, back and forward", async ({ page }) => {
  await page.goto("/#/library/movies");
  await page.getByRole("link", { name: "View details for The Wanderer" }).click();
  await expect(page.locator("#detail-title")).toHaveText("The Wanderer");
  for (const text of ["78.4 GB", "75.8 Mbps", "3840 × 2160 · 4K UHD", "HEVC / H.265", "HDR10+", "TrueHD 7.1 · Dolby Atmos"]) {
    await expect(page.locator(".file-grid")).toContainText(text);
  }
  await page.reload();
  await expect(page.locator("#detail-title")).toHaveText("The Wanderer");
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Movies", exact: true })).toBeVisible();
  await page.goForward();
  await expect(page.locator("#detail-title")).toHaveText("The Wanderer");
});

test("sorting and curated collections change actual results", async ({ page }) => {
  await page.goto("/#/library/all");
  await page.getByLabel("Sort titles").selectOption("rating");
  await expect(page.locator(".media-card").first()).toHaveAttribute("data-media-id", "wild-earth");
  await page.reload();
  await expect(page.getByLabel("Sort titles")).toHaveValue("rating");
  await page.goto("/#/library/top");
  const ratings = await page.locator(".card-rating").allTextContents();
  expect(ratings.length).toBeGreaterThan(0);
  expect(ratings.every((rating) => Number(rating) >= 9)).toBe(true);
});

test("mouse and keyboard login never request, validate or retain credentials", async ({ page }) => {
  const requests = [];
  const messages = [];
  page.on("request", (request) => requests.push({ url: request.url(), method: request.method(), body: request.postData() }));
  page.on("console", (message) => messages.push(message.text()));
  await page.goto("/#/item/wanderer");
  await page.getByRole("button", { name: "Play now" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const username = "mivi-sensitive-user-5127";
  const password = "mivi-sensitive-password-5127";
  await page.getByLabel("Username", { exact: true }).fill(username);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Show password", exact: true }).click();
  await expect(page.locator("#password")).toHaveAttribute("type", "text");
  const count = requests.length;
  await page.locator("#login-submit").click();
  await expect(page.locator("#login-notice")).toHaveText("Private library. Access is by invitation only.");
  await expect(page.locator("#password")).toHaveValue("");
  await expect(page.locator("#password")).toHaveAttribute("type", "password");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Password", { exact: true }).press("Enter");
  await expect(page.locator("#password")).toHaveValue("");
  expect(requests.length).toBe(count);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator("#username")).toHaveValue("");
  await expect(page.locator("#password")).toHaveValue("");
  expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage }, cookies: document.cookie }))).toEqual({ local: {}, session: {}, cookies: "" });
  expect(JSON.stringify({ requests, messages, url: page.url() })).not.toContain(username);
  expect(JSON.stringify({ requests, messages, url: page.url() })).not.toContain(password);
});

test("empty login shows the same invitation notice without simulated authentication", async ({ page }) => {
  await page.goto("/");
  await page.locator(".topbar [data-login]").click();
  await page.locator("#login-submit").click();
  await expect(page.locator("#login-notice")).toBeVisible();
  await expect(page.locator("#login-notice")).toHaveText("Private library. Access is by invitation only.");
  await expect(page.locator("#login-submit")).toHaveText("Sign in");
});

test("dialog traps keyboard focus, closes on Escape and clears inputs", async ({ page }) => {
  await page.goto("/");
  const trigger = page.locator(".topbar [data-login]");
  await trigger.click();
  await expect(page.locator("#username")).toBeFocused();
  await page.locator("#password").fill("do-not-retain");
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
  }
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Shift+Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(page.locator("#password")).toHaveValue("");
  await expect(page.locator("#login-notice")).not.toBeVisible();
});

test("runtime requests only same-origin static assets, without console errors", async ({ page }) => {
  const requests = [];
  const errors = [];
  page.on("request", (request) => requests.push({ method: request.method(), url: request.url(), type: request.resourceType() }));
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  await page.goto("/#/library/all");
  await page.locator(".media-card").last().scrollIntoViewIfNeeded();
  await page.getByRole("searchbox").fill("4K");
  await page.locator(".media-card").first().click();
  await page.getByRole("button", { name: "Play now" }).click();
  await page.locator("#login-submit").click();
  expect(errors).toEqual([]);
  expect(requests.every((request) => request.method === "GET" && new URL(request.url).origin === "http://127.0.0.1:4173")).toBe(true);
  expect(requests.filter((request) => ["xhr", "fetch", "websocket", "media", "eventsource"].includes(request.type))).toEqual([]);
  const images = await page.locator("img").evaluateAll((images) => images.filter((image) => image.loading !== "lazy" || image.getBoundingClientRect().top < innerHeight).map((image) => image.complete && image.naturalWidth > 0));
  expect(images.every(Boolean)).toBe(true);
});

test("invalid routes and unknown item IDs provide a usable return path", async ({ page }) => {
  for (const hash of ["/item/not-in-library", "/library/unknown", "/%E0%A4%A", "/library/__proto__"]) {
    await page.goto(`/#${hash}`);
    await expect(page.getByRole("heading", { name: "This page is off the reel" })).toBeVisible();
  }
  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(page.getByRole("heading", { name: "Your next great story." })).toBeVisible();
});

for (const width of [360, 768, 1440]) {
  test(`${width}px layout has no horizontal page overflow and usable login`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goto("/#/library/all");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator(".media-card").first().click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: "Play now" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator("#login-submit")).toBeInViewport();
  });
}

test("poster artwork loads when each lazy row comes into view", async ({ page }) => {
  await page.goto("/");
  for (const row of await page.locator(".media-row").all()) {
    await row.scrollIntoViewIfNeeded();
    const image = row.locator(".atlas-image").first();
    await expect.poll(() => image.evaluate((node) => node.complete && node.naturalWidth > 0)).toBe(true);
  }
});

test("login has no native credential submission even without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const requests = [];
  page.on("request", (request) => requests.push(request));
  await page.goto("http://127.0.0.1:4173/");
  // The closed dialog is unavailable without JavaScript, so no credential form
  // can be opened or submitted. Neither input has a submission name either.
  await expect(page.locator("dialog")).not.toBeVisible();
  await expect(page.locator("#username")).not.toHaveAttribute("name");
  await expect(page.locator("#password")).not.toHaveAttribute("name");
  await expect(page.locator("#login-submit")).toHaveAttribute("type", "button");
  expect(requests.every((request) => request.method() === "GET")).toBe(true);
  await context.close();
});
