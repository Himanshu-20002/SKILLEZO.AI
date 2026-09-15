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
});
