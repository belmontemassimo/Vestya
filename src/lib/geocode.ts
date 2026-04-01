/**
 * Geocode an address to lat/lng using OpenStreetMap Nominatim (free, no API key).
 * Rate-limited to 1 req/sec by Nominatim policy — only call server-side.
 */

interface GeocodingResult {
  latitude: number;
  longitude: number;
}

export async function geocodeAddress(parts: {
  addressLine1?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string | null;
}): Promise<GeocodingResult | null> {
  const query = [
    parts.addressLine1,
    parts.city,
    parts.region,
    parts.postalCode,
    parts.country,
  ]
    .filter(Boolean)
    .join(", ");

  if (!query.trim()) return null;

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Vestya-FamilyDashboard/1.0",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const results = (await response.json()) as Array<{
      lat: string;
      lon: string;
    }>;

    if (results.length === 0) return null;

    const { lat, lon } = results[0];
    return {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
    };
  } catch (error) {
    console.error("[Geocode] Failed to geocode address:", error);
    return null;
  }
}
