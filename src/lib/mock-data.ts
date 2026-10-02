// CineStream — generated-default catalog data (mock fallback).
// These titles are INVENTED placeholders used until TMDB_API_KEY is configured.
// They are labeled as generated defaults per .clinerules rule 7.

import type { MediaTitle } from "./types";

const POSTER_BASE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='342' height='513'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#151B26'/><stop offset='1' stop-color='#232B3B'/></linearGradient></defs><rect width='342' height='513' fill='url(#g)'/><circle cx='171' cy='236' r='42' fill='none' stroke='#E50914' stroke-width='4'/><polygon points='160,216 160,256 196,236' fill='#E50914'/></svg>`
  );

const BACKDROP_BASE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1280' height='720'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#0B0E14'/><stop offset='0.6' stop-color='#151B26'/><stop offset='1' stop-color='#232B3B'/></linearGradient></defs><rect width='1280' height='720' fill='url(#g)'/><circle cx='640' cy='360' r='64' fill='none' stroke='#E50914' stroke-width='6'/><polygon points='615,325 615,395 675,360' fill='#E50914'/></svg>`
  );

function makeTitle(
  id: string,
  title: string,
  overview: string,
  releaseDate: string,
  voteAverage: number,
  genres: string[],
  mediaType: "movie" | "tv" = "movie"
): MediaTitle {
  return {
    id,
    mediaType,
    title,
    overview,
    posterUrl: POSTER_BASE,
    backdropUrl: BACKDROP_BASE,
    releaseDate,
    voteAverage,
    genres,
    qualityTags: ["4K UHD", "HDR", "Dolby Atmos"],
  };
}

export const FEATURED_HERO: MediaTitle = makeTitle(
  "mock-1",
  "Midnight Protocol",
  "When a rogue AI seizes control of a global satellite network, a disgraced cybersecurity analyst and an elite extraction team have twelve hours to stop a digital blackout that could plunge civilization into darkness.",
  "2026-08-14",
  8.7,
  ["Sci-Fi", "Thriller", "Action"]
);

export const TRENDING_NOW: MediaTitle[] = [
  makeTitle("mock-2", "Crimson Harbor", "A homicide detective returns to her hometown to investigate a string of ritualistic crimes that mirror an unsolved case from twenty years ago.", "2026-07-02", 8.1, ["Crime", "Mystery", "Drama"]),
  makeTitle("mock-3", "The Last Cartographer", "In a flooded future, a mapmaker charts the drowned cities in search of a legendary settlement that may still stand above the waterline.", "2026-05-19", 7.9, ["Adventure", "Sci-Fi"]),
  makeTitle("mock-4", "Neon Dynasty", "Rival families battle for control of a neon-soaked megacity's underground tech trade in this sweeping crime saga.", "2026-06-11", 8.4, ["Crime", "Thriller"]),
  makeTitle("mock-5", "Silent Orbit", "The lone astronaut aboard a decaying space station must repair a failing life-support system while decoding a mysterious signal from deep space.", "2026-04-28", 8.0, ["Sci-Fi", "Drama"]),
  makeTitle("mock-6", "Paper Kingdoms", "A young forger in 1920s Paris infiltrates high society by selling fake masterpieces — until one buyer wants something far more dangerous.", "2026-03-15", 7.6, ["Drama", "Crime"]),
  makeTitle("mock-7", "Frostline", "Two rival mountaineering teams race to summit an unclimbed Himalayan peak as a deadly storm system converges on the ridge.", "2026-02-09", 7.8, ["Adventure", "Thriller"]),
  makeTitle("mock-8", "The Understudy", "An overlooked stage actress gets her breakout role when the lead mysteriously vanishes — and the police begin asking questions.", "2026-01-22", 7.4, ["Thriller", "Drama"]),
];

export const TOP_RATED: MediaTitle[] = [
  makeTitle("mock-9", "Empire of Glass", "The rise and fall of a 1930s hotel empire, told through the eyes of the maid who witnessed everything.", "2025-11-30", 9.1, ["Drama", "History"]),
  makeTitle("mock-10", "Quantum Debt", "A physicist discovers her breakthrough experiment is borrowing time from the future — and the interest is coming due.", "2025-10-18", 8.9, ["Sci-Fi", "Thriller"]),
  makeTitle("mock-11", "The Salt Road", "Following an ancient trade route, a caravan merchant and a runaway princess forge an unlikely alliance against an empire.", "2025-09-05", 8.8, ["Adventure", "Drama"]),
  makeTitle("mock-12", "Hollow Crown", "After the king dies without an heir, three noble houses spiral into a war of spies, assassins, and broken oaths.", "2025-08-21", 9.0, ["Fantasy", "Drama"], "tv"),
  makeTitle("mock-13", "Signal Lost", "A deep-sea research crew intercepts a transmission that shouldn't exist — from a vessel that disappeared in 1968.", "2025-07-14", 8.5, ["Mystery", "Horror"]),
  makeTitle("mock-14", "Velvet Revolution", "In 1989 Prague, a jazz club becomes the unlikely headquarters of a resistance movement built on smuggled broadcasts.", "2025-06-02", 8.6, ["Drama", "History"]),
  makeTitle("mock-15", "The Ninth Inning", "A washed-up pitcher gets one last season with a last-place team — and one last chance to fix what he broke.", "2025-05-10", 8.2, ["Drama", "Sport"]),
];

export const CONTINUE_WATCHING: MediaTitle[] = [
  makeTitle("mock-16", "Ashfall", "A volcanologist races to evacuate a island town before a catastrophic eruption — but the evacuation convoy is already compromised.", "2025-12-12", 7.7, ["Action", "Thriller"]),
  makeTitle("mock-17", "Glasshouse", "A botanist living in a sealed biodome discovers her employer has been lying about what's outside.", "2025-11-08", 7.5, ["Sci-Fi", "Mystery"]),
  makeTitle("mock-18", "The Long Con", "A retired grifter is pulled back for one final mark: the casino empire that ruined her family.", "2025-10-01", 8.3, ["Crime", "Comedy"]),
  makeTitle("mock-19", "Northbound", "A father and daughter drive the length of a country to deliver a message that could end a decades-old feud.", "2025-09-19", 7.9, ["Drama"]),
  makeTitle("mock-20", "Static", "A late-night radio host starts receiving calls from listeners who claim to be from tomorrow.", "2025-08-30", 8.0, ["Mystery", "Horror"]),
  makeTitle("mock-21", "Iron Meadow", "In a post-war countryside, a farmhand hides a wounded deserter as patrols close in on the harvest.", "2025-07-25", 8.1, ["Drama", "War"]),
  makeTitle("mock-22", "The Gilded Hour", "A Gilded Age heiress moonlights as an investigative journalist exposing the very elite she dines with.", "2025-06-14", 8.4, ["Drama", "Mystery"], "tv"),
];

export const NEW_RELEASES: MediaTitle[] = [
  makeTitle("mock-23", "Solar Wind", "A solar-sail racer enters the most dangerous regatta in the solar system to clear her family's debt.", "2026-09-04", 7.3, ["Sci-Fi", "Action"]),
  makeTitle("mock-24", "The Quiet Divide", "Two brothers on opposite sides of a border dispute meet for the first time in twenty years.", "2026-08-29", 7.8, ["Drama"]),
  makeTitle("mock-25", "Nightbloom", "A florist discovers her rare night-blooming orchid attracts more than admirers.", "2026-08-16", 7.1, ["Horror", "Thriller"]),
  makeTitle("mock-26", "Terminal Velocity", "A skydiving instructor witnesses a murder mid-freefall — and the killer saw her see it.", "2026-08-02", 7.6, ["Action", "Thriller"]),
  makeTitle("mock-27", "The Recipe", "A street-food chef inherits a restaurant with a menu that predicts diners' deaths.", "2026-07-21", 7.9, ["Mystery", "Comedy"]),
  makeTitle("mock-28", "Deep Field", "An astronomer's discovery of a dying galaxy becomes an obsession that costs her everything.", "2026-07-08", 8.2, ["Drama", "Sci-Fi"]),
  makeTitle("mock-29", "Wolfpack Rising", "The streets of a divided city belong to whoever controls the night — and the pack has new leadership.", "2026-06-27", 7.4, ["Crime", "Action"]),
];