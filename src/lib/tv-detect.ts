// CineStream — lightweight Smart TV detection utility.
// Checks the user-agent for known Smart TV browser strings.
// Used to disable heavy features (video autoplay, complex animations)
// that cripple the weak processors in Tizen, webOS, Fire TV, etc.

"use client";

const TV_UA_KEYWORDS = [
  "Tizen",
  "Web0S",    // LG webOS (note: capital 0)
  "webOS",    // LG webOS alternate
  "SmartTV",
  "SMART-TV",
  "smart-tv",
  "Smart-TV",
  "Large Screen",
  "NetCast",  // LG NetCast
  "Silk",     // Amazon Fire TV
  "AFT",      // Amazon Fire TV device code
  "BRAVIA",   // Sony Bravia
  "VIDAA",    // Hisense/Toshiba
  "Viera",    // Panasonic
  "CrKey",    // Chromecast
  "Roku",     // Roku (limited browser)
  "GoogleTV",
  "Android TV",
];

/**
 * Returns true if the current user-agent matches a known Smart TV browser.
 * Safe to call server-side (returns false when `navigator` is unavailable).
 */
export function isSmartTV(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return TV_UA_KEYWORDS.some((keyword) => ua.includes(keyword));
}
