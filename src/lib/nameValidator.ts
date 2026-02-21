import { checkComDomain, checkDomainAvailability, nameToSlug, type DomainResult } from './domainCheck';
import { searchBusinesses, type BusinessResult } from './businessSearch';

export interface ValidatedName {
  name: string;
  slug: string;
  comAvailable: boolean | null;
  availableDomains: DomainResult[];
  allDomains: DomainResult[];
  similarBusinesses: BusinessResult[];
  score: number;
}

/**
 * Check if a found business name is actually similar to the searched name
 */
function isNameSimilar(searched: string, found: string): boolean {
  const a = searched.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const b = found.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  if (b.includes(a) || a.includes(b)) return true;

  const wordA = a.split(/\s+/)[0];
  const wordB = b.split(/\s+/)[0];
  if (wordA.length >= 3 && wordA === wordB) return true;

  return false;
}

/**
 * Validate name candidates in 2 phases:
 * Phase 1: Quick .com check for all names (fast)
 * Phase 2: Full validation (all TLDs + Google search) only for names with .com available
 */
export async function validateNameCandidates(
  names: string[],
): Promise<ValidatedName[]> {
  const unique = [...new Set(names.map(n => n.trim()).filter(n => n.length >= 2))];

  // Phase 1: Quick .com check for all names in parallel
  const comResults = await Promise.all(
    unique.map(async (name) => {
      const slug = nameToSlug(name);
      if (slug.length < 2) return { name, slug, comAvailable: null as boolean | null };
      const result = await checkComDomain(name);
      return { name, slug, comAvailable: result?.available ?? null };
    })
  );

  // Phase 2: For names with .com available, do full check (all TLDs + Google)
  const results: ValidatedName[] = await Promise.all(
    comResults.map(async ({ name, slug, comAvailable }) => {
      if (slug.length < 2) {
        return {
          name, slug, comAvailable: null,
          availableDomains: [], allDomains: [],
          similarBusinesses: [], score: 0,
        };
      }

      if (comAvailable === true) {
        // .com is free — do full validation
        let allDomains: DomainResult[] = [];
        let businesses: BusinessResult[] = [];

        try {
          [allDomains, businesses] = await Promise.all([
            checkDomainAvailability(name),
            searchBusinesses(name, ''),
          ]);
        } catch {
          try { allDomains = await checkDomainAvailability(name); } catch { /* */ }
        }

        const similarBusinesses = businesses.filter(b => isNameSimilar(name, b.name));
        const availableDomains = allDomains.filter(d => d.available === true);

        const score =
          50 + // .com is free
          (similarBusinesses.length === 0 ? 30 : -similarBusinesses.length * 15) +
          availableDomains.length * 3;

        return {
          name, slug, comAvailable: true,
          availableDomains, allDomains,
          similarBusinesses, score,
        };
      }

      // .com is taken or unknown — minimal result
      return {
        name, slug, comAvailable,
        availableDomains: [], allDomains: [],
        similarBusinesses: [], score: comAvailable === false ? -100 : 0,
      };
    })
  );

  return results.sort((a, b) => b.score - a.score);
}
