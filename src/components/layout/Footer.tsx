// CineStream — site footer

import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/browse", label: "Browse" },
  { href: "/search", label: "Search" },
  { href: "/profile", label: "Watchlist" },
];

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface/40 px-4 py-10 sm:px-8 lg:px-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg font-extrabold text-accent">
            CINE<span className="text-text-primary">STREAM</span>
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Stream Without Limits. Unlimited Stories, Zero Interruption.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/privacy"
                className="text-sm text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <p className="mt-8 text-xs text-text-secondary">
        © {new Date().getFullYear()} CineStream. Catalog metadata powered by TMDB.
      </p>
    </footer>
  );
}