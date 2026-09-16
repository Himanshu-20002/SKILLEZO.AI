import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileService } from '@/modules/profile/profile.service';
import { SkillSource } from '@/core/constants/enums';

describe('ProfileService — Clean Slate Onboarding & Real Profile Completion', () => {
  let profileService: ProfileService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      existsByUserId: vi.fn().mockResolvedValue(false),
      findByUserId: vi.fn(),
      create: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, _id: 'mock_profile_id' })),
      updateByUserId: vi.fn(),
    };
    profileService = new ProfileService(mockRepo);
  });

  it('should initialize a clean slate profile with empty arrays and no fake data', async () => {
    const userId = 'user_new_123';
    const profile = await profileService.createProfile(userId, {});

    expect(profile.userId).toBe(userId);
    expect(profile.skills).toEqual([]);
    expect(profile.projects).toEqual([]);
    expect(profile.education).toEqual([]);
    expect(profile.experience).toEqual([]);
    expect(profile.headline).toBe('');
    expect(profile.targetRole).toBe('');
    expect(profile.bio).toBe('');
    expect(profile.phone).toBe('');
  });

  it('should compute 10% base completion for a freshly registered candidate', () => {
    const score = profileService.calculateProfileCompletion({
      skills: [],
      projects: [],
      education: [],
      experience: [],
      headline: '',
      targetRole: '',
    });

    expect(score).toBe(10);
  });

  it('should dynamically increase score as candidate completes onboarding steps', () => {
    // Step 1: Set Target Role and Headline (+30)
    let score = profileService.calculateProfileCompletion({
      headline: 'Full-Stack Developer',
      targetRole: 'Full-Stack Engineer',
      skills: [],
    });
    expect(score).toBe(40); // 10 base + 15 headline + 15 targetRole

    // Step 2: Add 3 technical skills (+15)
    score = profileService.calculateProfileCompletion({
      headline: 'Full-Stack Developer',
      targetRole: 'Full-Stack Engineer',
      skills: [
        { name: 'TypeScript', verified: false, source: SkillSource.PROFILE },
        { name: 'React', verified: false, source: SkillSource.PROFILE },
        { name: 'Node.js', verified: false, source: SkillSource.PROFILE },
      ] as any,
    });
    expect(score).toBe(55);

    // Step 3: Verify at least 1 skill (+10)
    score = profileService.calculateProfileCompletion({
      headline: 'Full-Stack Developer',
      targetRole: 'Full-Stack Engineer',
      skills: [
        { name: 'TypeScript', verified: true, source: SkillSource.ASSESSMENT },
        { name: 'React', verified: false, source: SkillSource.PROFILE },
        { name: 'Node.js', verified: false, source: SkillSource.PROFILE },
      ] as any,
    });
    expect(score).toBe(65);

    // Step 4: Add a project (+10)
    score = profileService.calculateProfileCompletion({
      headline: 'Full-Stack Developer',
      targetRole: 'Full-Stack Engineer',
      skills: [
        { name: 'TypeScript', verified: true, source: SkillSource.ASSESSMENT },
        { name: 'React', verified: false, source: SkillSource.PROFILE },
        { name: 'Node.js', verified: false, source: SkillSource.PROFILE },
      ] as any,
      projects: [{ title: 'Portfolio Web App' }] as any,
    });
    expect(score).toBe(75);
  });

  it('should hydrate empty profile from parsed resume data non-destructively', async () => {
    const userId = 'user_hydrate_test';
    const mockProfileDoc: any = {
      userId,
      headline: '',
      targetRole: '',
      bio: '',
      phone: '',
      location: { city: '', state: '', country: '' },
      links: { github: '', linkedin: '', portfolio: '' },
      skills: [],
      projects: [],
      experience: [],
      education: [],
      save: vi.fn().mockResolvedValue(true),
      toObject: function () {
        return { ...this };
      },
    };

    mockRepo.findByUserId.mockResolvedValue(mockProfileDoc);

    const mockExtractedData: any = {
      personalInfo: {
        phone: '+1 555 123 4567',
        location: 'Seattle, WA, USA',
      },
      summary: 'Experienced Cloud Architect specialized in microservices.',
      skills: [
        { name: 'Go', category: 'Backend' },
        { name: 'Kubernetes', category: 'Cloud' },
      ],
      experience: [
        { companyName: 'CloudCorp', jobTitle: 'Senior Cloud Engineer', isCurrent: true },
      ],
      education: [
        { institution: 'UW', degree: 'BS Computer Science' },
      ],
    };

    const mockResumeDoc: any = {
      summary: {
        targetRole: 'Cloud Solutions Architect',
      },
      contact: {
        links: [
          { label: 'GitHub', url: 'https://github.com/clouduser' },
          { label: 'LinkedIn', url: 'https://linkedin.com/in/clouduser' },
        ],
      },
    };

    const hydrated = await profileService.hydrateFromParsedResume(
      userId,
      mockExtractedData,
      mockResumeDoc
    );

    expect(hydrated.phone).toBe('+1 555 123 4567');
    expect(hydrated.bio).toBe('Experienced Cloud Architect specialized in microservices.');
    expect(hydrated.targetRole).toBe('Cloud Solutions Architect');
    expect(hydrated.links?.github).toBe('https://github.com/clouduser');
    expect(hydrated.links?.linkedin).toBe('https://linkedin.com/in/clouduser');
    expect(hydrated.location?.city).toBe('Seattle');
    expect(hydrated.skills.length).toBe(2);
    expect(hydrated.skills[0].name).toBe('Go');
    expect(hydrated.skills[0].source).toBe(SkillSource.RESUME);
    expect(hydrated.experience.length).toBe(1);
    expect(hydrated.experience[0].companyName).toBe('CloudCorp');
    expect(hydrated.education.length).toBe(1);
    expect(hydrated.education[0].institution).toBe('UW');
    expect(mockProfileDoc.save).toHaveBeenCalled();
  });

  it('should preserve existing user modifications during resume hydration', async () => {
    const userId = 'user_preserve_test';
    const mockProfileDoc: any = {
      userId,
      headline: 'My Custom Headline',
      targetRole: 'Principal Architect',
      bio: 'User written custom bio that exceeds twenty characters.',
      phone: '+1 999 888 7777',
      location: { city: 'Austin', state: 'TX', country: 'USA' },
      links: { github: 'https://github.com/existing', linkedin: '', portfolio: '' },
      skills: [{ name: 'Rust', level: 5, verified: true, source: SkillSource.PROFILE }],
      projects: [],
      experience: [],
      education: [],
      save: vi.fn().mockResolvedValue(true),
      toObject: function () {
        return { ...this };
      },
    };

    mockRepo.findByUserId.mockResolvedValue(mockProfileDoc);

    const mockExtractedData: any = {
      personalInfo: { phone: '+1 111 222 3333' },
      summary: 'Resume summary text.',
      skills: [{ name: 'Rust' }, { name: 'Python' }],
    };

    const hydrated = await profileService.hydrateFromParsedResume(
      userId,
      mockExtractedData,
      null
    );

    // Existing fields remain untouched
    expect(hydrated.phone).toBe('+1 999 888 7777');
    expect(hydrated.targetRole).toBe('Principal Architect');
    expect(hydrated.bio).toBe('User written custom bio that exceeds twenty characters.');
    expect(hydrated.links?.github).toBe('https://github.com/existing');
    // Existing skill is preserved, new skill is added
    expect(hydrated.skills.length).toBe(2);
    expect(hydrated.skills.find((s) => s.name === 'Rust')?.verified).toBe(true);
    expect(hydrated.skills.find((s) => s.name === 'Python')?.source).toBe(SkillSource.RESUME);
  });
});
