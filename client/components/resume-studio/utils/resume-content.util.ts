import { ResumeProjectItem, ResumeSkillItem, ResumeAchievementItem } from '@/types/resume-document';

export const CATEGORY_LABELS: Record<string, string> = {
  LANGUAGE: 'Languages',
  LANGUAGES: 'Languages',
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATABASE: 'Databases',
  DATABASES: 'Databases',
  CLOUD: 'Cloud & DevOps',
  INFRASTRUCTURE: 'Cloud & DevOps',
  DEVOPS: 'Cloud & DevOps',
  DEV_OPS: 'Cloud & DevOps',
  CLOUD_DEVOPS: 'Cloud & DevOps',
  AI_ML: 'AI & Tools',
  AI: 'AI & Tools',
  TOOLS: 'AI & Tools',
  TESTING: 'Testing & QA',
  MOBILE: 'Mobile Development',
  OTHER: 'Other Skills',
};

export const CANONICAL_SKILL_CATEGORY_ORDER = [
  'Languages',
  'Frontend',
  'Backend',
  'Databases',
  'Cloud & DevOps',
  'AI & Tools',
  'Testing & QA',
  'Mobile Development',
  'Other Skills',
];

const SOFT_SKILLS_EXCLUDE = new Set([
  'problem solving',
  'teamwork',
  'communication',
  'analytical thinking',
  'critical thinking',
  'leadership',
  'time management',
  'adaptability',
  'work ethic',
  'collaboration',
  'creativity',
  'interpersonal skills',
  'multitasking',
  'attention to detail',
]);

export interface FormattedSkillGroup {
  categoryKey: string;
  label: string;
  skills: string[];
  formattedLine: string;
}

/**
 * Normalizes, deduplicates, groups, and formats skills into a clean, strictly 1-line representation per category.
 */
export function groupAndFormatSkills(
  skills?: ResumeSkillItem[] | null,
  options?: { maxItemsPerCategory?: number; maxCharsPerLine?: number }
): FormattedSkillGroup[] {
  if (!skills || skills.length === 0) return [];

  const maxItems = options?.maxItemsPerCategory ?? 6;
  const maxChars = options?.maxCharsPerLine ?? 75;

  const groups: Record<string, string[]> = {};
  const seenPerCategory: Record<string, Set<string>> = {};

  for (const skill of skills) {
    if (!skill.name) continue;
    const name = skill.name.trim();
    if (!name) continue;

    const lowerName = name.toLowerCase();
    // Filter out generic soft skills to prevent cluttering technical skills section
    if (SOFT_SKILLS_EXCLUDE.has(lowerName)) continue;

    const label = getCategoryLabel(skill.category || 'OTHER');

    if (!groups[label]) {
      groups[label] = [];
      seenPerCategory[label] = new Set<string>();
    }

    // Deduplicate within the category
    if (!seenPerCategory[label].has(lowerName)) {
      seenPerCategory[label].add(lowerName);
      groups[label].push(name);
    }
  }

  // Canonical ordering
  const sortedLabels = Object.keys(groups).sort((a, b) => {
    const idxA = CANONICAL_SKILL_CATEGORY_ORDER.indexOf(a);
    const idxB = CANONICAL_SKILL_CATEGORY_ORDER.indexOf(b);
    const orderA = idxA !== -1 ? idxA : 999;
    const orderB = idxB !== -1 ? idxB : 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b);
  });

  const result: FormattedSkillGroup[] = [];
  for (const label of sortedLabels) {
    const rawSkills = groups[label];
    if (!rawSkills || rawSkills.length === 0) continue;

    const chosenSkills: string[] = [];
    let currentLength = 0;

    for (const item of rawSkills) {
      if (chosenSkills.length >= maxItems) break;
      const additionLen = (chosenSkills.length > 0 ? 3 : 0) + item.length;
      if (chosenSkills.length > 0 && currentLength + additionLen > maxChars) {
        break; // Strict 1-line constraint
      }
      chosenSkills.push(item);
      currentLength += additionLen;
    }

    if (chosenSkills.length > 0) {
      result.push({
        categoryKey: label.toUpperCase().replace(/[\s&]+/g, '_'),
        label,
        skills: chosenSkills,
        formattedLine: chosenSkills.join(' · '),
      });
    }
  }

  return result;
}

/**
 * Returns clean, human-friendly category label for skill groups
 */
export function getCategoryLabel(category: string): string {
  if (!category) return 'Other Skills';
  const clean = category.trim().toUpperCase().replace(/[\s\-]+/g, '_');
  if (CATEGORY_LABELS[clean]) return CATEGORY_LABELS[clean];
  return category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Strips leading bullet symbols (•, -, *, etc.) and trims excess whitespace
 */
export function cleanBulletText(text: string): string {
  if (!text) return '';
  return text.replace(/^[•\-\*·\s]+/, '').trim();
}

/**
 * Splits raw bullet text on bullet glyphs or newlines
 */
export function splitBullets(text: string): string[] {
  if (!text) return [];
  return text
    .split(/(?:^|\s+)[•\-\*·]\s+|\n+/)
    .map((s) => cleanBulletText(s))
    .filter((s) => s.length > 0);
}

export interface CleanedProjectContent {
  cleanSummary: string | null;
  cleanBullets: string[];
}

/**
 * Normalizes project description and bullets for unified rendering in both DOM and PDF export.
 * - Extracts clean distinct bullet items (max 4).
 * - Strips leading bullet characters.
 * - Avoids duplicate summary if description is just a concatenation of bullets.
 */
export function cleanProjectContent(proj: ResumeProjectItem): CleanedProjectContent {
  const rawDesc = proj.description?.trim() || '';
  const rawBullets = (proj.bullets || []).map((b) => b.trim()).filter(Boolean);

  let cleanBullets: string[] = [];
  if (rawBullets.length > 0) {
    if (rawBullets.length === 1 && (rawBullets[0].includes('•') || rawBullets[0].includes('\n'))) {
      cleanBullets = splitBullets(rawBullets[0]);
    } else {
      cleanBullets = rawBullets.flatMap(splitBullets);
    }
  } else if (rawDesc) {
    cleanBullets = splitBullets(rawDesc);
  }

  // Deduplicate and cap at max 4 bullets
  const seen = new Set<string>();
  cleanBullets = cleanBullets
    .map(cleanBulletText)
    .filter((b) => {
      const lower = b.toLowerCase();
      if (!lower || seen.has(lower)) return false;
      seen.add(lower);
      return true;
    })
    .slice(0, 4);

  // Only show description as summary if it's NOT a bullet list and NOT a duplicate of bullets
  let cleanSummary: string | null = null;
  if (rawDesc) {
    const descNorm = cleanBulletText(rawDesc).toLowerCase();
    const isBulletList = rawDesc.includes('•') || rawDesc.startsWith('-') || rawDesc.includes('\n•');
    const isDuplicate = cleanBullets.some((b) => b.toLowerCase() === descNorm);
    if (!isBulletList && !isDuplicate) {
      cleanSummary = rawDesc;
    }
  }

  return { cleanSummary, cleanBullets };
}

export interface FormattedAchievement {
  boldPrefix?: string;
  normalText: string;
  formattedDate?: string;
}

const ACTION_VERB_STARTS =
  /^(recognized|led|served|awarded|won|selected|achieved|secured|built|published|presented|ranked|completed|participated|honored|received|co-authored|founded|organized|spearheaded|developed)\b/i;

/**
 * Formats ISO or generic date strings into human-friendly resume display format (e.g. "Jan 2026", "2026").
 */
export function formatDisplayDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  const trimmed = dateStr.trim();
  if (/^[A-Za-z]{3,}\s+\d{4}$/.test(trimmed) || /^\d{4}$/.test(trimmed)) {
    return trimmed;
  }
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthNum = parseInt(isoMatch[2], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (monthNum >= 1 && monthNum <= 12) {
      return `${months[monthNum - 1]} ${year}`;
    }
    return year;
  }
  return trimmed;
}

/**
 * Normalizes an achievement/certification item for clean bullet rendering without cluttering or all-bold text.
 * - Credentials with issuers: bold credential name + normal weight issuer + cleanly formatted date.
 * - Statements with colon: bold prefix + normal weight statement.
 * - Full sentences / action verbs: normal weight statement across the entire bullet.
 * - Short credential titles: bold title.
 */
export function formatAchievementItem(ach: ResumeAchievementItem): FormattedAchievement {
  const rawTitle = (ach.title || '').trim();
  let cleanIssuer = (ach.issuer || '').trim();
  const formattedDate = formatDisplayDate(ach.date);

  // If issuer has trailing date like ", Jan 2026", remove it to prevent duplicate dates
  if (cleanIssuer) {
    cleanIssuer = cleanIssuer
      .replace(
        /,?\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?\d{4}\s*$/i,
        ''
      )
      .trim();
  }

  // Case 1: Credential with an issuer (e.g. Course/Certification — Organization)
  if (cleanIssuer) {
    return {
      boldPrefix: rawTitle,
      normalText: `— ${cleanIssuer}`,
      formattedDate,
    };
  }

  // Case 2: Contains a colon delimiter (e.g. "Category/Title: Detailed achievement description")
  const colonIdx = rawTitle.indexOf(':');
  if (colonIdx > 0 && colonIdx < 40) {
    return {
      boldPrefix: rawTitle.slice(0, colonIdx + 1).trim(),
      normalText: rawTitle.slice(colonIdx + 1).trim(),
      formattedDate,
    };
  }

  // Case 3: Action verb or long sentence (> 35 chars) — achievement bullet should NOT be bold!
  if (ACTION_VERB_STARTS.test(rawTitle) || rawTitle.length > 35) {
    return {
      boldPrefix: undefined,
      normalText: rawTitle,
      formattedDate,
    };
  }

  // Case 4: Short award or certification name without issuer (e.g. "AWS Certified Developer")
  return {
    boldPrefix: rawTitle,
    normalText: '',
    formattedDate,
  };
}

