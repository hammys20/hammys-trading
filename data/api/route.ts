import { NextResponse } from "next/server";

const WHATNOT_URL = "https://www.whatnot.com/s/UlNKtYo1";

// Fallback if we can't extract schedule from Whatnot HTML.
// Set this in .env.local as an ISO string, e.g. 2026-02-01T20:00:00-05:00
const FALLBACK_NEXT_SHOW_ISO = process.env.NEXT_SHOW_ISO || "";

/**
 * Best-effort extraction of a start time from Whatnot HTML.
 * This is intentionally defensive: if Whatnot changes markup, we still work via fallback.
 */
function extractStartTimeIso(html: string): string | null {
  // Common patterns in modern apps:
  // - JSON embedded with "startAt":"2026-..."
  // - "startTime" / "start_time" fields
  const patterns = [
    /"startAt"\s*:\s*"([^"]+)"/i,
    /"startTime"\s*:\s*"([^"]+)"/i,
    /"start_time"\s*:\s*"([^"]+)"/i,
    /"scheduledStartAt"\s*:\s*"([^"]+)"/i,
  ];

  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1];
  }

  // JSON-LD sometimes includes startDate
  const m2 = html.match(/"startDate"\s*:\s*"([^"]+)"/i);
  if (m2?.[1]) return m2[1];

  return null;
}

function toMillis(iso: string): number | null {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

export async function GET() {
  let nextStartIso: string | null = null;

  try {
    const res = await fetch(WHATNOT_URL, {
      // avoid caching during dev; you can change to revalidate later
      cache: "no-store",
      headers: { "user-agent": "Mozilla/5.0" },
    });

    const html = await res.text();
    nextStartIso = extractStartTimeIso(html);
  } catch {
    // ignore; fallback below
  }

  if (!nextStartIso && FALLBACK_NEXT_SHOW_ISO) {
    nextStartIso = FALLBACK_NEXT_SHOW_ISO;
  }

  const now = Date.now();
  const startMs = nextStartIso ? toMillis(nextStartIso) : null;

  // We don’t know end time reliably; assume "live window" = 4 hours after start.
  // (You can adjust if your shows are typically shorter/longer.)
  const LIVE_WINDOW_MS = 4 * 60 * 60 * 1000;

  const isLive =
    startMs !== null && now >= startMs && now <= startMs + LIVE_WINDOW_MS;

  const msUntilStart =
    startMs !== null ? Math.max(0, startMs - now) : null;

  return NextResponse.json({
    whatnotUrl: WHATNOT_URL,
    nextStartIso: nextStartIso ?? null,
    isLive,
    msUntilStart,
    source: nextStartIso ? (nextStartIso === FALLBACK_NEXT_SHOW_ISO ? "fallback_env" : "scraped") : "unknown",
  });
}
