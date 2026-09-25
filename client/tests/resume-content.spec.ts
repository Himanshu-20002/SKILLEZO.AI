import { describe, it, expect } from 'vitest';
import {
  cleanBulletText,
  splitBullets,
  cleanProjectContent,
  CATEGORY_LABELS,
  groupAndFormatSkills,
  formatAchievementItem,
  formatDisplayDate,
} from '../components/resume-studio/utils/resume-content.util';
import { ResumeProjectItem, ResumeSkillItem, ResumeAchievementItem } from '../types/resume-document';

describe('Resume Content Normalizer & Deduplication', () => {
  describe('cleanBulletText', () => {
    it('strips leading bullets and symbols', () => {
      expect(cleanBulletText('• Built a role-based platform')).toBe('Built a role-based platform');
      expect(cleanBulletText('- Implemented OAuth2')).toBe('Implemented OAuth2');
      expect(cleanBulletText('* Designed Postgres schema')).toBe('Designed Postgres schema');
      expect(cleanBulletText('· Created API')).toBe('Created API');
      expect(cleanBulletText('   •   Double spaced item')).toBe('Double spaced item');
    });

    it('handles empty strings gracefully', () => {
      expect(cleanBulletText('')).toBe('');
    });
  });

  describe('splitBullets', () => {
    it('splits concatenated bullet lines into clean items', () => {
      const text = '• Item 1 • Item 2 • Item 3';
      const items = splitBullets(text);
      expect(items).toEqual(['Item 1', 'Item 2', 'Item 3']);
    });
  });

  describe('cleanProjectContent', () => {
    it('eliminates duplicated description and bullets (exact user bug case)', () => {
      const rawText =
        '• Built a role-based PPE Workforce Safety Platform for admin and supervisor operations. • Implemented role-based authentication, PPE violation tracking, and automated alert escalation. • Designed a PostgreSQL database using Drizzle ORM with worker dataset import and optimized queries. • Created a simulated IoT camera webhook API and CSV reporting for PPE compliance management.';

      const project: ResumeProjectItem = {
        id: 'proj-1',
        title: 'GuardOps',
        description: rawText,
        bullets: [rawText],
        technologies: ['Next.js', 'PostgreSQL'],
      };

      const { cleanSummary, cleanBullets } = cleanProjectContent(project);

      // Summary must be null because description is entirely a duplicate of the bullets!
      expect(cleanSummary).toBeNull();
      // Bullets must be split into 4 distinct clean items without leading bullet glyphs
      expect(cleanBullets).toHaveLength(4);
      expect(cleanBullets[0]).toBe(
        'Built a role-based PPE Workforce Safety Platform for admin and supervisor operations.'
      );
      expect(cleanBullets[1]).toBe(
        'Implemented role-based authentication, PPE violation tracking, and automated alert escalation.'
      );
      expect(cleanBullets[2]).toBe(
        'Designed a PostgreSQL database using Drizzle ORM with worker dataset import and optimized queries.'
      );
      expect(cleanBullets[3]).toBe(
        'Created a simulated IoT camera webhook API and CSV reporting for PPE compliance management.'
      );
    });

    it('preserves genuine summaries that do not duplicate bullets', () => {
      const project: ResumeProjectItem = {
        id: 'proj-2',
        title: 'Portfolio Website',
        description: 'A personal portfolio website showcasing full stack projects and blogs.',
        bullets: [
          'Built responsive UI with Next.js and Tailwind CSS',
          'Achieved 100 Lighthouse performance score',
        ],
        technologies: ['Next.js', 'Tailwind CSS'],
      };

      const { cleanSummary, cleanBullets } = cleanProjectContent(project);

      expect(cleanSummary).toBe(
        'A personal portfolio website showcasing full stack projects and blogs.'
      );
      expect(cleanBullets).toEqual([
        'Built responsive UI with Next.js and Tailwind CSS',
        'Achieved 100 Lighthouse performance score',
      ]);
    });
  });

  describe('CATEGORY_LABELS', () => {
    it('maps enum keys to concise human-friendly display titles', () => {
      expect(CATEGORY_LABELS.LANGUAGE).toBe('Languages');
      expect(CATEGORY_LABELS.FRONTEND).toBe('Frontend');
      expect(CATEGORY_LABELS.BACKEND).toBe('Backend');
      expect(CATEGORY_LABELS.DATABASE).toBe('Databases');
      expect(CATEGORY_LABELS.CLOUD).toBe('Cloud & DevOps');
      expect(CATEGORY_LABELS.DEVOPS).toBe('Cloud & DevOps');
      expect(CATEGORY_LABELS.AI_ML).toBe('AI & Tools');
      expect(CATEGORY_LABELS.TOOLS).toBe('AI & Tools');
    });
  });

  describe('groupAndFormatSkills', () => {
    it('deduplicates, strips soft skills, and limits to strict 1-line view', () => {
      const skills: ResumeSkillItem[] = [
        { id: '1', name: 'TypeScript', category: 'LANGUAGE', evidenceIds: [] },
        { id: '2', name: 'typescript', category: 'LANGUAGE', evidenceIds: [] }, // duplicate
        { id: '3', name: 'JavaScript', category: 'LANGUAGE', evidenceIds: [] },
        { id: '4', name: 'HTML/CSS', category: 'LANGUAGE', evidenceIds: [] },
        { id: '5', name: 'React', category: 'FRONTEND', evidenceIds: [] },
        { id: '6', name: 'Next.js', category: 'FRONTEND', evidenceIds: [] },
        { id: '7', name: 'Problem Solving', category: 'FRONTEND', evidenceIds: [] }, // soft skill to exclude
        { id: '8', name: 'Tailwind CSS', category: 'FRONTEND', evidenceIds: [] },
        { id: '9', name: 'Teamwork', category: 'OTHER', evidenceIds: [] }, // soft skill to exclude
        { id: '10', name: 'Docker', category: 'CLOUD', evidenceIds: [] },
        { id: '11', name: 'Git', category: 'DEVOPS', evidenceIds: [] },
      ];

      const groups = groupAndFormatSkills(skills);

      // Expected categories in canonical order
      const labels = groups.map((g) => g.label);
      expect(labels).toContain('Languages');
      expect(labels).toContain('Frontend');
      expect(labels).toContain('Cloud & DevOps');

      // Check Languages: deduplicated typescript
      const langGroup = groups.find((g) => g.label === 'Languages');
      expect(langGroup?.skills).toEqual(['TypeScript', 'JavaScript', 'HTML/CSS']);
      expect(langGroup?.formattedLine).toBe('TypeScript · JavaScript · HTML/CSS');

      // Check Frontend: Problem Solving is omitted
      const frontendGroup = groups.find((g) => g.label === 'Frontend');
      expect(frontendGroup?.skills).toEqual(['React', 'Next.js', 'Tailwind CSS']);
      expect(frontendGroup?.skills).not.toContain('Problem Solving');

      // Check Cloud & DevOps: merged CLOUD + DEVOPS
      const cloudGroup = groups.find((g) => g.label === 'Cloud & DevOps');
      expect(cloudGroup?.skills).toEqual(['Docker', 'Git']);

      // Check Soft skills: Teamwork is excluded completely
      const otherGroup = groups.find((g) => g.label === 'Other Skills');
      expect(otherGroup).toBeUndefined();
    });

    it('enforces character budget per line so it never wraps', () => {
      const skills: ResumeSkillItem[] = [
        { id: '1', name: 'Very Long Technology Name Number One', category: 'FRONTEND', evidenceIds: [] },
        { id: '2', name: 'Another Very Long Technology Name Number Two', category: 'FRONTEND', evidenceIds: [] },
        { id: '3', name: 'Third Long Technology Name Number Three', category: 'FRONTEND', evidenceIds: [] },
      ];

      const groups = groupAndFormatSkills(skills, { maxCharsPerLine: 50 });
      const frontendGroup = groups.find((g) => g.label === 'Frontend');
      // Should cap before exceeding 50 characters
      expect(frontendGroup?.skills.length).toBeLessThan(3);
      expect(frontendGroup?.formattedLine.length).toBeLessThanOrEqual(50);
    });
  });

  describe('formatAchievementItem & formatDisplayDate', () => {
    it('formats ISO dates into clean human resume dates', () => {
      expect(formatDisplayDate('2026-01-01')).toBe('Jan 2026');
      expect(formatDisplayDate('2026-01')).toBe('Jan 2026');
      expect(formatDisplayDate('2026')).toBe('2026');
      expect(formatDisplayDate('Jan 2026')).toBe('Jan 2026');
      expect(formatDisplayDate(undefined)).toBeUndefined();
    });

    it('formats credential with issuer: bold title, normal issuer, human date without duplication', () => {
      const item: ResumeAchievementItem = {
        id: 'ach-1',
        title: 'Introduction to Software Engineering Job Simulation',
        issuer: 'Commonwealth Bank (Forage), Jan 2026',
        date: '2026-01-01',
      };

      const result = formatAchievementItem(item);
      expect(result.boldPrefix).toBe('Introduction to Software Engineering Job Simulation');
      expect(result.normalText).toBe('— Commonwealth Bank (Forage)');
      expect(result.formattedDate).toBe('Jan 2026');
    });

    it('formats full achievement sentence without issuer: 0 bold text, 100% normal weight text', () => {
      const item: ResumeAchievementItem = {
        id: 'ach-2',
        title: 'Recognized among top performers in Automation and CNC training at the Siemens Centre of Excellence',
      };

      const result = formatAchievementItem(item);
      // boldPrefix MUST be undefined so the bullet sentence is NOT all bold!
      expect(result.boldPrefix).toBeUndefined();
      expect(result.normalText).toBe(
        'Recognized among top performers in Automation and CNC training at the Siemens Centre of Excellence'
      );
      expect(result.formattedDate).toBeUndefined();
    });

    it('formats action-verb led achievement bullets as normal weight text', () => {
      const item1: ResumeAchievementItem = {
        id: 'ach-3',
        title: 'Led team to Top 10 in Code4Cause, MSIT 2023 Hackathon by presenting a MedTech solution for rural and BPL sectors',
      };
      const result1 = formatAchievementItem(item1);
      expect(result1.boldPrefix).toBeUndefined();
      expect(result1.normalText).toContain('Led team to Top 10');

      const item2: ResumeAchievementItem = {
        id: 'ach-4',
        title: 'Served as Vice President and Treasurer, Dance Club, leading and representing the team in 25+ Delhi Dance Circuit competitions',
      };
      const result2 = formatAchievementItem(item2);
      expect(result2.boldPrefix).toBeUndefined();
      expect(result2.normalText).toContain('Served as Vice President');
    });

    it('formats achievement with colon delimiter: bold prefix and normal description', () => {
      const item: ResumeAchievementItem = {
        id: 'ach-5',
        title: 'Hackathon Finalist: Developed a MedTech solution for rural sectors',
      };

      const result = formatAchievementItem(item);
      expect(result.boldPrefix).toBe('Hackathon Finalist:');
      expect(result.normalText).toBe('Developed a MedTech solution for rural sectors');
    });

    it('formats short standalone credential name as bold', () => {
      const item: ResumeAchievementItem = {
        id: 'ach-6',
        title: 'AWS Certified Developer',
      };

      const result = formatAchievementItem(item);
      expect(result.boldPrefix).toBe('AWS Certified Developer');
      expect(result.normalText).toBe('');
    });
  });
});
