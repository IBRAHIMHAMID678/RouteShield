/**
 * Comprehensive US commercial freight hubs and geocoding dictionary.
 * Supports instant offline lookup, fuzzy alias matching (e.g. "Los Angelas" -> Los Angeles, CA),
 * and live Open-Meteo geocoding fallback.
 */

export interface CityLocation {
  name: string;
  state: string;
  lat: number;
  lon: number;
  aliases?: string[];
}

export const US_MAJOR_CITIES: CityLocation[] = [
  { name: "New York", state: "NY", lat: 40.7128, lon: -74.006, aliases: ["new york", "nyc", "new york city", "manhattan", "ny"] },
  { name: "Los Angeles", state: "CA", lat: 34.0522, lon: -118.2437, aliases: ["los angeles", "la", "los angelas", "los angelus", "los angeles ca", "los angeles, ca"] },
  { name: "Chicago", state: "IL", lat: 41.8781, lon: -87.6298, aliases: ["chicago", "chi-town", "chicago il"] },
  { name: "Houston", state: "TX", lat: 29.7604, lon: -95.3698, aliases: ["houston", "houston tx"] },
  { name: "Phoenix", state: "AZ", lat: 33.4484, lon: -112.074, aliases: ["phoenix", "pheonix", "phoenix az"] },
  { name: "Philadelphia", state: "PA", lat: 39.9526, lon: -75.1652, aliases: ["philadelphia", "philly", "philly pa"] },
  { name: "San Antonio", state: "TX", lat: 29.4241, lon: -98.4936, aliases: ["san antonio", "san antonio tx"] },
  { name: "San Diego", state: "CA", lat: 32.7157, lon: -117.1611, aliases: ["san diego", "san diego ca"] },
  { name: "Dallas", state: "TX", lat: 32.7767, lon: -96.797, aliases: ["dallas", "dallas tx", "dfw"] },
  { name: "Austin", state: "TX", lat: 30.2672, lon: -97.7431, aliases: ["austin", "austin tx"] },
  { name: "San Jose", state: "CA", lat: 37.3382, lon: -121.8863, aliases: ["san jose", "san jose ca"] },
  { name: "San Francisco", state: "CA", lat: 37.7749, lon: -122.4194, aliases: ["san francisco", "sf", "san fransisco", "san francisco ca"] },
  { name: "Seattle", state: "WA", lat: 47.6062, lon: -122.3321, aliases: ["seattle", "seatle", "seattle wa"] },
  { name: "Denver", state: "CO", lat: 39.7392, lon: -104.9903, aliases: ["denver", "denver co", "mile high"] },
  { name: "Salt Lake City", state: "UT", lat: 40.7608, lon: -111.891, aliases: ["salt lake city", "slc", "salt lake", "salt lake city ut"] },
  { name: "Atlanta", state: "GA", lat: 33.749, lon: -84.388, aliases: ["atlanta", "atl", "atlanta ga"] },
  { name: "Miami", state: "FL", lat: 25.7617, lon: -80.1918, aliases: ["miami", "miami fl"] },
  { name: "Boston", state: "MA", lat: 42.3601, lon: -71.0589, aliases: ["boston", "boston ma"] },
  { name: "Detroit", state: "MI", lat: 42.3314, lon: -83.0458, aliases: ["detroit", "detroit mi", "motor city"] },
  { name: "Minneapolis", state: "MN", lat: 44.9778, lon: -93.265, aliases: ["minneapolis", "minneapolis mn", "twin cities"] },
  { name: "St. Louis", state: "MO", lat: 38.627, lon: -90.1994, aliases: ["st louis", "st. louis", "saint louis", "st louis mo"] },
  { name: "Kansas City", state: "MO", lat: 39.0997, lon: -94.5786, aliases: ["kansas city", "kc", "kansas city mo"] },
  { name: "Indianapolis", state: "IN", lat: 39.7684, lon: -86.1581, aliases: ["indianapolis", "indy", "indianapolis in"] },
  { name: "Nashville", state: "TN", lat: 36.1627, lon: -86.7816, aliases: ["nashville", "nashville tn", "music city"] },
  { name: "Memphis", state: "TN", lat: 35.1495, lon: -90.049, aliases: ["memphis", "memphis tn"] },
  { name: "Charlotte", state: "NC", lat: 35.2271, lon: -80.8431, aliases: ["charlotte", "charlotte nc"] },
  { name: "Las Vegas", state: "NV", lat: 36.1699, lon: -115.1398, aliases: ["las vegas", "vegas", "las vegas nv"] },
  { name: "Portland", state: "OR", lat: 45.5152, lon: -122.6784, aliases: ["portland", "portland or"] },
  { name: "Pittsburgh", state: "PA", lat: 40.4406, lon: -79.9959, aliases: ["pittsburgh", "pittsburgh pa"] },
  { name: "Cleveland", state: "OH", lat: 41.4993, lon: -81.6944, aliases: ["cleveland", "cleveland oh"] },
  { name: "Columbus", state: "OH", lat: 39.9612, lon: -82.9988, aliases: ["columbus", "columbus oh"] },
  { name: "Cincinnati", state: "OH", lat: 39.1031, lon: -84.512, aliases: ["cincinnati", "cincinnati oh"] },
  { name: "Oklahoma City", state: "OK", lat: 35.4676, lon: -97.5164, aliases: ["oklahoma city", "okc", "oklahoma city ok"] },
  { name: "Albuquerque", state: "NM", lat: 35.0844, lon: -106.6504, aliases: ["albuquerque", "albuquerque nm", "abq"] },
  { name: "El Paso", state: "TX", lat: 31.7619, lon: -106.485, aliases: ["el paso", "el paso tx"] },
  { name: "New Orleans", state: "LA", lat: 29.9511, lon: -90.0715, aliases: ["new orleans", "nola", "new orleans la"] },
  { name: "Tampa", state: "FL", lat: 27.9506, lon: -82.4572, aliases: ["tampa", "tampa fl"] },
  { name: "Orlando", state: "FL", lat: 28.5383, lon: -81.3792, aliases: ["orlando", "orlando fl"] },
  { name: "Jacksonville", state: "FL", lat: 30.3322, lon: -81.6557, aliases: ["jacksonville", "jacksonville fl"] },
  { name: "Baltimore", state: "MD", lat: 39.2904, lon: -76.6122, aliases: ["baltimore", "baltimore md"] },
  { name: "Washington", state: "DC", lat: 38.9072, lon: -77.0369, aliases: ["washington", "dc", "washington dc", "washington d.c."] },
  { name: "Omaha", state: "NE", lat: 41.2565, lon: -95.9345, aliases: ["omaha", "omaha ne"] },
  { name: "Boise", state: "ID", lat: 43.615, lon: -116.2023, aliases: ["boise", "boise id"] },
  { name: "Cheyenne", state: "WY", lat: 41.1399, lon: -104.8202, aliases: ["cheyenne", "cheyenne wy"] },
  { name: "Billings", state: "MT", lat: 45.7833, lon: -108.5007, aliases: ["billings", "billings mt"] },
  { name: "Fargo", state: "ND", lat: 46.8772, lon: -96.7898, aliases: ["fargo", "fargo nd"] },
  { name: "Sioux Falls", state: "SD", lat: 43.546, lon: -96.7313, aliases: ["sioux falls", "sioux falls sd"] },
  { name: "Des Moines", state: "IA", lat: 41.5868, lon: -93.625, aliases: ["des moines", "des moines ia"] },
  { name: "Little Rock", state: "AR", lat: 34.7465, lon: -92.2896, aliases: ["little rock", "little rock ar"] },
  { name: "Birmingham", state: "AL", lat: 33.5186, lon: -86.8104, aliases: ["birmingham", "birmingham al"] },
  { name: "Louisville", state: "KY", lat: 38.2527, lon: -85.7585, aliases: ["louisville", "louisville ky"] },
  { name: "Milwaukee", state: "WI", lat: 43.0389, lon: -87.9065, aliases: ["milwaukee", "milwaukee wi"] },
  { name: "Sacramento", state: "CA", lat: 38.5816, lon: -121.4944, aliases: ["sacramento", "sacramento ca"] },
  { name: "Reno", state: "NV", lat: 39.5296, lon: -119.8138, aliases: ["reno", "reno nv"] },
];

/**
 * Normalizes query string for robust fuzzy matching.
 */
function normalizeQuery(str: string): string {
  return str
    .toLowerCase()
    .replace(/[,\.\-\_\/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Searches the local dictionary for city suggestions based on text input.
 */
export function searchLocalCities(query: string, maxResults = 5): CityLocation[] {
  const q = normalizeQuery(query);
  if (!q || q.length < 2) return [];

  const matches: { city: CityLocation; score: number }[] = [];

  for (const city of US_MAJOR_CITIES) {
    const fullName = `${city.name} ${city.state}`.toLowerCase();
    const cleanName = city.name.toLowerCase();

    // Exact name match gets highest score
    if (cleanName === q || fullName === q) {
      matches.push({ city, score: 100 });
      continue;
    }

    // Prefix match
    if (cleanName.startsWith(q) || fullName.startsWith(q)) {
      matches.push({ city, score: 80 });
      continue;
    }

    // Alias matches (handles typos like "los angelus", "los angelas", "pheonix")
    if (city.aliases?.some((a) => a === q || a.startsWith(q) || q.startsWith(a))) {
      matches.push({ city, score: 75 });
      continue;
    }

    // Substring match
    if (cleanName.includes(q) || fullName.includes(q)) {
      matches.push({ city, score: 50 });
      continue;
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, maxResults).map((m) => m.city);
}

/**
 * Resolves coordinates for a location string.
 * Priority:
 * 1. Local US freight hubs dictionary (instant & handles common typos)
 * 2. Backend `/api/v1/geocode` endpoint
 * 3. Direct Open-Meteo Geocoding API
 */
export async function resolveLocationCoords(
  query: string
): Promise<{ name: string; lat: number; lon: number } | null> {
  const q = normalizeQuery(query);
  if (!q) return null;

  // 1. Check local dictionary
  const localMatches = searchLocalCities(query, 1);
  if (localMatches.length > 0) {
    const best = localMatches[0];
    return {
      name: `${best.name}, ${best.state}`,
      lat: best.lat,
      lon: best.lon,
    };
  }

  // 2. Query backend geocode endpoint
  try {
    const backendRes = await fetch(`/api/v1/geocode?q=${encodeURIComponent(query)}`);
    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.results && data.results.length > 0) {
        const top = data.results[0];
        return {
          name: top.name,
          lat: top.latitude,
          lon: top.longitude,
        };
      }
    }
  } catch (err) {
    console.warn("Backend geocoding request failed:", err);
  }

  // 3. Direct Open-Meteo Geocoding API fallback
  try {
    const openMeteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query
    )}&count=1&language=en&format=json`;
    const resp = await fetch(openMeteoUrl);
    if (resp.ok) {
      const data = await resp.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        return {
          name: `${item.name}${item.admin1 ? `, ${item.admin1}` : ""}`,
          lat: item.latitude,
          lon: item.longitude,
        };
      }
    }
  } catch (err) {
    console.warn("Open-Meteo geocoding request failed:", err);
  }

  return null;
}
