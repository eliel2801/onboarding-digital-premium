export interface DomainResult {
  domain: string;
  tld: string;
  available: boolean | null; // null = checking/error
}

/**
 * RDAP servers by TLD — only servers that actually resolve from browsers
 * Verified working: verisign (.com/.net), publicinterestregistry (.org), nic.biz (.biz)
 */
const RDAP_SERVERS: Record<string, string> = {
  com: 'https://rdap.verisign.com/com/v1/domain/',
  net: 'https://rdap.verisign.com/net/v1/domain/',
  org: 'https://rdap.publicinterestregistry.org/rdap/domain/',
  biz: 'https://rdap.nic.biz/domain/',
};

const TLDs = Object.keys(RDAP_SERVERS);

/**
 * Converts a business name to a domain-friendly slug.
 * "Mi Empresa Legal" → "miempresalegal"
 */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]/g, '')       // keep only alphanumeric
    .slice(0, 63);                   // max domain label length
}

/**
 * Check a single domain via RDAP.
 * HTTP 200 = registered (taken), HTTP 404 = not found (available)
 * Uses GET with minimal headers; browser network errors are expected and handled.
 */
async function checkSingleDomain(slug: string, tld: string): Promise<DomainResult> {
  const domain = `${slug}.${tld}`;
  const rdapUrl = RDAP_SERVERS[tld];

  if (!rdapUrl) {
    return { domain, tld, available: null };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${rdapUrl}${domain}`, {
      method: 'GET',
      headers: { 'Accept': 'application/rdap+json' },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.status === 404) {
      return { domain, tld, available: true };
    }

    if (res.ok) {
      // Consume body to avoid browser warnings
      await res.text().catch(() => {});
      return { domain, tld, available: false };
    }

    return { domain, tld, available: null };
  } catch {
    clearTimeout(timeout);
    return { domain, tld, available: null };
  }
}

/**
 * Quick check: only .com domain
 * Used by the name validator for fast filtering
 */
export async function checkComDomain(businessName: string): Promise<DomainResult | null> {
  const slug = nameToSlug(businessName);
  if (slug.length < 2) return null;
  return checkSingleDomain(slug, 'com');
}

/**
 * Check domain availability for a business name across multiple TLDs
 * Uses RDAP (free, no API key, CORS-enabled, authoritative)
 */
export async function checkDomainAvailability(businessName: string): Promise<DomainResult[]> {
  const slug = nameToSlug(businessName);

  if (slug.length < 2) return [];

  const results = await Promise.all(
    TLDs.map(tld => checkSingleDomain(slug, tld))
  );

  return results;
}
