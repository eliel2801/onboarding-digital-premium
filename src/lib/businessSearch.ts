export interface BusinessResult {
  name: string;
  address: string;
  types: string[];
  rating?: number;
  totalRatings?: number;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/**
 * Search for businesses with a similar name in a given location
 * using Google Places API (New) Text Search
 */
export async function searchBusinesses(
  businessName: string,
  location: string
): Promise<BusinessResult[]> {
  if (!API_KEY || businessName.trim().length < 2) return [];

  const query = location?.trim() ? `${businessName} en ${location}` : businessName;

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.types,places.rating,places.userRatingCount',
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'es',
        maxResultCount: 5,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return [];

    const data = await res.json();

    if (!data.places || data.places.length === 0) return [];

    return data.places.map((p: any) => ({
      name: p.displayName?.text || '',
      address: p.formattedAddress || '',
      types: (p.types || []).slice(0, 3),
      rating: p.rating,
      totalRatings: p.userRatingCount,
    }));
  } catch {
    return [];
  }
}
