import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";

const base = "http://127.0.0.1:4174";
const server = spawn("python3", ["-m", "http.server", "4174", "--bind", "127.0.0.1", "--directory", "site"], { stdio: "ignore" });
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try { ready = (await fetch(base)).ok; } catch { /* wait for local static server */ }
    if (ready) break;
    await setTimeout(100);
  }
  if (!ready) throw new Error("Local preview server did not start.");
  await mkdir("docs/screenshots", { recursive: true });
  browser = await chromium.launch({ channel: "chromium" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(async () => { await Promise.all([...document.images].map((image) => { image.loading = "eager"; return image.decode(); })); });
  await page.screenshot({ path: "docs/screenshots/home-desktop.png" });
  await page.goto(`${base}/#/item/wanderer`, { waitUntil: "networkidle" });
  await page.screenshot({ path: "docs/screenshots/detail-desktop.png" });
  await page.locator("[data-login=\"wanderer\"]").click();
  await page.screenshot({ path: "docs/screenshots/login-desktop.png" });
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(async () => { await Promise.all([...document.images].map((image) => { image.loading = "eager"; return image.decode(); })); });
  await page.screenshot({ path: "docs/screenshots/home-mobile.png", fullPage: true });
  await page.goto(`${base}/#/item/wanderer`, { waitUntil: "networkidle" });
  await page.evaluate(async () => { await Promise.all([...document.images].map((image) => { image.loading = "eager"; return image.decode(); })); });
  await page.screenshot({ path: "docs/screenshots/detail-mobile.png", fullPage: true });
  console.log("Saved desktop and mobile home, detail and login screenshots to docs/screenshots/.");
} finally {
  await browser?.close();
  server.kill();
}
