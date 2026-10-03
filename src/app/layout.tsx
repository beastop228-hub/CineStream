import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import dynamic from "next/dynamic";
import { ClientTVDetector } from "@/components/ClientTVDetector";

// Wrap non-essential dynamic widgets in next/dynamic to prevent hydration blocking on legacy TVs
const MediaDetailsModal = dynamic(
  () => import("@/components/media/MediaDetailsModal").then((mod) => mod.MediaDetailsModal)
);

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CineStream — Stream Without Limits",
    template: "%s | CineStream",
  },
  description:
    "Watch award-winning series, blockbuster films, and exclusive indie cinema in 4K HDR. Unlimited stories, zero interruption.",
  openGraph: {
    siteName: "CineStream",
    type: "website",
    locale: "en_US",
  },
};

// ---------------------------------------------------------------------------
// SPATIAL NAVIGATION ENGINE — ES5 INLINE SCRIPT
// ---------------------------------------------------------------------------
// This is injected as raw JavaScript into <head> so it runs IMMEDIATELY on
// page load, before React hydrates. It uses pure ES5 syntax (no arrow funcs,
// no const/let, no template literals, no optional chaining) to guarantee
// compatibility with the oldest Tizen/webOS/Fire TV browser engines.
// ---------------------------------------------------------------------------
const SPATIAL_NAV_SCRIPT = `
(function() {
  // Focusable element selector
  var SEL = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]';

  // Key codes for arrow keys (works on ALL TV remotes including Samsung, LG, Sony, Fire)
  var KEY_LEFT  = 37;
  var KEY_UP    = 38;
  var KEY_RIGHT = 39;
  var KEY_DOWN  = 40;
  var KEY_ENTER = 13;
  var KEY_BACK_SAMSUNG = 10009;
  var KEY_BACK_LG = 461;
  var KEY_BACK_GENERIC = 8;

  function getCenter(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function isVisible(el) {
    if (!el || el.offsetWidth === 0 && el.offsetHeight === 0) return false;
    var s = window.getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') return false;
    if (s.opacity === '0') return false;
    // Check the element is not clipped entirely off-screen
    var r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight + 200) return false;
    if (r.right < 0 || r.left > window.innerWidth + 200) return false;
    return true;
  }

  function getAllFocusable() {
    var all = document.querySelectorAll(SEL);
    var result = [];
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.getAttribute('tabindex') === '-1') continue;
      if (!isVisible(el)) continue;
      result.push(el);
    }
    return result;
  }

  function findBest(currentEl, keyCode) {
    var items = getAllFocusable();
    var cur = getCenter(currentEl);
    var best = null;
    var bestDist = Infinity;

    for (var i = 0; i < items.length; i++) {
      var el = items[i];
      if (el === currentEl) continue;
      var tgt = getCenter(el);
      var dx = tgt.x - cur.x;
      var dy = tgt.y - cur.y;
      var ok = false;
      var dist = Infinity;

      if (keyCode === KEY_LEFT && dx < -10) {
        ok = true;
        dist = Math.abs(dx) + Math.abs(dy) * 5;
      } else if (keyCode === KEY_RIGHT && dx > 10) {
        ok = true;
        dist = Math.abs(dx) + Math.abs(dy) * 5;
      } else if (keyCode === KEY_UP && dy < -10) {
        ok = true;
        dist = Math.abs(dy) + Math.abs(dx) * 5;
      } else if (keyCode === KEY_DOWN && dy > 10) {
        ok = true;
        dist = Math.abs(dy) + Math.abs(dx) * 5;
      }

      if (ok && dist < bestDist) {
        bestDist = dist;
        best = el;
      }
    }
    return best;
  }

  function focusElement(el) {
    if (!el) return;
    el.focus();
    // Scroll into view — use scrollIntoView if available, else manual scroll
    if (el.scrollIntoView) {
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      } catch(e) {
        // Fallback for browsers that don't support options object
        el.scrollIntoView(true);
      }
    }
  }

  document.addEventListener('keydown', function(e) {
    var kc = e.keyCode || e.which;

    // Handle Back button — go to previous page
    if (kc === KEY_BACK_SAMSUNG || kc === KEY_BACK_LG || kc === KEY_BACK_GENERIC) {
      e.preventDefault();
      if (window.history.length > 1) {
        window.history.back();
      }
      return;
    }

    // Only handle arrow keys and Enter
    if (kc !== KEY_LEFT && kc !== KEY_RIGHT && kc !== KEY_UP && kc !== KEY_DOWN && kc !== KEY_ENTER) {
      return;
    }

    // Don't hijack arrow keys inside text inputs
    var tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      return;
    }

    // Handle Enter — simulate click on the focused element
    if (kc === KEY_ENTER) {
      if (document.activeElement && document.activeElement !== document.body) {
        e.preventDefault();
        document.activeElement.click();
      }
      return;
    }

    // Arrow key navigation
    e.preventDefault();

    var active = document.activeElement;
    // If nothing is focused, focus the first focusable element
    if (!active || active === document.body || active === document.documentElement) {
      var items = getAllFocusable();
      if (items.length > 0) {
        focusElement(items[0]);
      }
      return;
    }

    var next = findBest(active, kc);
    if (next) {
      focusElement(next);
    }
  }, true);

  // Auto-focus the first interactive element after page loads
  // (so the user sees the focus ring immediately)
  function initialFocus() {
    var items = getAllFocusable();
    if (items.length > 0 && (!document.activeElement || document.activeElement === document.body)) {
      items[0].focus();
    }
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initialFocus, 500);
    });
  } else {
    setTimeout(initialFocus, 500);
  }
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        {/* Critical inline CSS: guarantees a dark background and readable text
            even when the TV's legacy browser engine fails to parse Tailwind v4.
            Without this, Smart TVs render raw white HTML (as seen in the TV screenshots). */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                background-color: #000 !important;
                color: #fff !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                margin: 0;
                padding: 0;
              }
              /* Extreme fallback resets if Tailwind fails */
              a { color: inherit; text-decoration: none !important; }
              ul, ol { list-style: none !important; padding: 0 !important; margin: 0 !important; }
              img { max-width: 100%; height: auto; }
              /* TV overscan safe zone */
              @media (min-width: 1920px) {
                body { padding: 3vh 5vw; }
              }
              /* Focus ring — MUST be in inline CSS so it works even if Tailwind fails */
              a:focus, button:focus, [tabindex]:focus {
                outline: 3px solid #fff !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 4px rgba(255,255,255,0.4) !important;
                position: relative;
                z-index: 9999 !important;
              }
            `,
          }}
        />
        {/* SPATIAL NAVIGATION ENGINE — runs immediately as raw ES5 JavaScript.
            This does NOT depend on React. It intercepts arrow keys from the TV
            remote and moves browser focus between interactive elements. */}
        <script dangerouslySetInnerHTML={{ __html: SPATIAL_NAV_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-text-primary">
        <ClientTVDetector />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MediaDetailsModal />
      </body>
    </html>
  );
}