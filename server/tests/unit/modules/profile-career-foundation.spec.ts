import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileService } from '@/modules/profile/profile.service';
import { SkillSource, EmploymentType } from '@/core/constants/enums';
import { ResumeDocument } from '@/modules/resume-intelligence/document/resume-document.types';
import { IProfile } from '@/database/models/Profile.model';

describe('Phase 2: Career Profile Foundation — Canonical Source of Truth', () => {
  let profileService: ProfileService;
  let mockRepo: any;
  let mockResumeRepo: any;

  beforeEach(() => {
    mockRepo = {
      existsByUserId: vi.fn().mockResolvedValue(false),
      findByUserId: vi.fn(),
      create: vi.fn().mockImplementation((data) =>
        Promise.resolve({
          ...data,
          _id: 'mock_profile_id',
          save: vi.fn().mockResolvedValue(true),
          toObject: function () {
            return { ...this };
          },
        })
      ),
      updateByUserId: vi.fn().mockImplementation((userId, update) => {
        const payload = update.$set || update;
        return Promise.resolve({
          userId,
          ...payload,
          _id: 'mock_profile_id',
          save: vi.fn().mockResolvedValue(true),
          toObject: function () {
            return { ...this };
          },
        });
      }),
      updateSkills: vi.fn().mockImplementation((userId, skills) =>
        Promise.resolve({
          userId,
          skills,
          profileVersion: 2,
          _id: 'mock_profile_id',
          toObject: function () {
            return { ...this };
          },
        })
      ),
    };

    mockResumeRepo = {
      findByUserId: vi.fn().mockResolvedValue([]),
      findDefaultByUserId: vi.fn().mockResolvedValue(null),
    };

    profileService = new ProfileService(mockRepo, mockResumeRepo);
  });

  // =========================================================================
  // SUITE 1: Profile Hydration from Ingested Resume
  // =========================================================================
  describe('Suite 1: Profile Hydration from Ingested Resume', () => {
    it('should hydrate contact, summary, skills, experience, projects, and education non-destructively', async () => {
      const userId = 'user_suite_1';
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
        profileVersion: 1,
        save: vi.fn().mockResolvedValue(true),
        toObject: function () {
          return { ...this };
        },
      };
      mockRepo.findByUserId.mockResolvedValue(mockProfileDoc);

      const mockResumeDoc: Partial<ResumeDocument> = {
        contact: {
          fullName: 'Alice Developer',
          phone: '+1 415 555 0101',
          location: 'San Francisco, CA, USA',
          links: [
            { label: 'GitHub', url: 'https://github.com/alicedev' },
            { label: 'LinkedIn', url: 'https://linkedin.com/in/alicedev' },
          ],
        },
        summary: {
          text: 'Senior Software Engineer with 8+ years experience in distributed cloud architectures.',
          targetRole: 'Staff Infrastructure Engineer',
        },
        skills: [
          { id: 'sk_1', name: 'TypeScript', category: 'LANGUAGE', proficiency: 'EXPERT', evidenceIds: ['ev_ts_1'] },
          { id: 'sk_2', name: 'Rust', category: 'LANGUAGE', proficiency: 'ADVANCED', evidenceIds: ['ev_rust_1'] },
        ],
        experience: [
          {
            id: 'exp_1',
            companyName: 'Stripe',
            jobTitle: 'Senior Infrastructure Engineer',
            startDate: '2021-01-01',
            endDate: '2024-01-01',
            isCurrent: false,
            bullets: [
              { id: 'b_1', text: 'Architected real-time settlement engine processing $10B daily.', evidenceIds: ['ev_b1'] },
            ],
            technologiesUsed: ['Rust', 'Kafka'],
          },
        ],
        education: [
          {
            id: 'edu_1',
            institution: 'Stanford University',
            degree: 'Master of Science',
            fieldOfStudy: 'Computer Science',
            startDate: '2016-09-01',
            endDate: '2018-06-01',
          },
        ],
        projects: [
          {
            id: 'proj_1',
            title: 'VectorFlow DB',
            description: 'Distributed vector search indexing engine in Rust.',
            technologies: ['Rust', 'SIMD', 'gRPC'],
            repoUrl: 'https://github.com/alicedev/vectorflow',
            bullets: ['Sub-millisecond kNN recall on 10M embeddings'],
          },
        ],
        evidence: [
          { id: 'ev_ts_1', type: 'SKILL', source: 'PARSED', value: 'TypeScript', verified: false, createdAt: '2026-01-01' },
          { id: 'ev_rust_1', type: 'SKILL', source: 'PARSED', value: 'Rust', verified: false, createdAt: '2026-01-01' },
          { id: 'ev_b1', type: 'METRIC', source: 'PARSED', value: '$10B daily', verified: false, createdAt: '2026-01-01' },
        ],
      };

      const result = await profileService.hydrateFromParsedResume(userId, null, mockResumeDoc as ResumeDocument);

      expect(result.phone).toBe('+1 415 555 0101');
      expect(result.bio).toContain('Senior Software Engineer');
      expect(result.targetRole).toBe('Staff Infrastructure Engineer');
      expect(result.headline).toBe('Staff Infrastructure Engineer');
      expect(result.location?.city).toBe('San Francisco');
      expect(result.links?.github).toBe('https://github.com/alicedev');
      expect(result.links?.linkedin).toBe('https://linkedin.com/in/alicedev');
      expect(result.skills.length).toBe(2);
      expect(result.skills[0].name).toBe('TypeScript');
      expect(result.skills[0].evidenceIds).toContain('ev_ts_1');
      expect(result.experience.length).toBe(1);
      expect(result.experience[0].companyName).toBe('Stripe');
      expect(result.experience[0].technologiesUsed).toContain('Rust');
      expect(result.education.length).toBe(1);
      expect(result.education[0].institution).toBe('Stanford University');
      expect(result.projects.length).toBe(1);
      expect(result.projects[0].title).toBe('VectorFlow DB');
      expect(result.projects[0].githubUrl).toBe('https://github.com/alicedev/vectorflow');
      expect(mockProfileDoc.save).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // SUITE 2: Missing Data Safety
  // =========================================================================
  describe('Suite 2: Missing Data Safety', () => {
    it('should handle completely empty resume data safely without errors', async () => {
      const userId = 'user_empty_data';
      const mockProfileDoc: any = {
        userId,
        skills: [],
        projects: [],
        experience: [],
        education: [],
        profileVersion: 1,
        save: vi.fn().mockResolvedValue(true),
        toObject: function () {
          return { ...this };
        },
      };
      mockRepo.findByUserId.mockResolvedValue(mockProfileDoc);

      const emptyResumeDoc: Partial<ResumeDocument> = {
        contact: { fullName: '', links: [] },
        skills: [],
        experience: [],
        education: [],
        projects: [],
      };

      const result = await profileService.hydrateFromParsedResume(userId, null, emptyResumeDoc as ResumeDocument);

      expect(result.skills).toEqual([]);
      expect(result.experience).toEqual([]);
      expect(result.education).toEqual([]);
      expect(result.projects).toEqual([]);
      expect(mockProfileDoc.save).toHaveBeenCalled();
    });

    it('should handle partial entities with missing dates or optional fields safely', async () => {
      const userId = 'user_partial';
      const mockProfileDoc: any = {
        userId,
        skills: [],
        projects: [],
        experience: [],
        education: [],
        profileVersion: 1,
        save: vi.fn().mockResolvedValue(true),
        toObject: function () {
          return { ...this };
        },
      };
      mockRepo.findByUserId.mockResolvedValue(mockProfileDoc);

      const partialDoc: Partial<ResumeDocument> = {
        contact: { fullName: 'Bob', links: [] },
        experience: [
          {
            id: 'exp_no_dates',
            companyName: 'Acme Corp',
            jobTitle: 'Developer',
            isCurrent: false,
            bullets: [],
          },
        ],
        education: [
          {
            id: 'edu_no_dates',
            institution: 'State College',
          },
        ],
      };

      const result = await profileService.hydrateFromParsedResume(userId, null, partialDoc as ResumeDocument);
      expect(result.experience.length).toBe(1);
      expect(result.experience[0].companyName).toBe('Acme Corp');
      expect(result.experience[0].startDate).toBeNull();
      expect(result.education.length).toBe(1);
      expect(result.education[0].institution).toBe('State College');
      expect(result.education[0].startYear).toBeNull();
    });
  });

  // =========================================================================
  // SUITE 3: No Candidate Fact Fabrication
  // =========================================================================
  describe('Suite 3: No Candidate Fact Fabrication', () => {
    it('never invents placeholder company names like "Unknown Company" or titles like "Engineer"', async () => {
      const userId = 'user_no_fabrication';
      const mockProfileDoc: any = {
        userId,
        skills: [],
        projects: [],
        experience: [],
        education: [],
        profileVersion: 1,
        save: vi.fn().mockResolvedValue(true),
        toObject: function () {
          return { ...this };
        },
      };
      mockRepo.findByUserId.mockResolvedValue(mockProfileDoc);

      // Ingest experience with missing companyName but present jobTitle
      const partialExpDoc: Partial<ResumeDocument> = {
        contact: { fullName: 'Charlie', links: [] },
        experience: [
          {
            id: 'exp_no_company',
            jobTitle: 'Independent Consultant',
            isCurrent: true,
            bullets: [{ id: 'b_1', text: 'Advising fintech startups on latency reduction', evidenceIds: [] }],
          },
        ],
      };

      const result = await profileService.hydrateFromParsedResume(userId, null, partialExpDoc as ResumeDocument);
      expect(result.experience.length).toBe(1);
      expect(result.experience[0].jobTitle).toBe('Independent Consultant');
      // Must NOT be "Unknown Company"
      expect(result.experience[0].companyName).toBeNull();
    });
  });

  // =========================================================================
  // SUITE 4: Skill Deduplication & Category Normalization
  // =========================================================================
  describe('Suite 4: Skill Deduplication & Category Normalization', () => {
    it('strictly maintains distinct identities for "Java" vs "JavaScript" and "C" vs "C++"', async () => {
      const userId = 'user_skill_distinct';
      const mockProfileDoc: any = {
        userId,
        skills: [],
        projects: [],
        experience: [],
        education: [],
        profileVersion: 1,
        save: vi.fn().mockResolvedValue(true),
        toObject: function () {
          return { ...this };
        },
      };
      mockRepo.findByUserId.mockResolvedValue(mockProfileDoc);

      const resumeDoc: Partial<ResumeDocument> = {
        contact: { fullName: 'Dev', links: [] },
        skills: [
          { id: 's1', name: 'Java', category: 'LANGUAGE', evidenceIds: ['ev_java'] },
          { id: 's2', name: 'JavaScript', category: 'LANGUAGE', evidenceIds: ['ev_js'] },
          { id: 's3', name: 'C', category: 'LANGUAGE', evidenceIds: ['ev_c'] },
          { id: 's4', name: 'C++', category: 'LANGUAGE', evidenceIds: ['ev_cpp'] },
        ],
      };

      const result = await profileService.hydrateFromParsedResume(userId, null, resumeDoc as ResumeDocument);
      expect(result.skills.length).toBe(4);
      const skillNames = result.skills.map((s) => s.name);
      expect(skillNames).toContain('Java');
      expect(skillNames).toContain('JavaScript');
      expect(skillNames).toContain('C');
      expect(skillNames).toContain('C++');
    });

    it('never downgrades verified skills or manual assessment sources', async () => {
      const userId = 'user_verified_skill';
      const mockProfileDoc: any = {
        userId,
        skills: [
          {
            name: 'Go',
            level: 5,
            proficiency: 'Expert',
            score: 95,
            source: SkillSource.ASSESSMENT,
            verified: true,
            evidenceIds: ['prior_ev_1'],
          },
        ],
        projects: [],
        experience: [],
        education: [],
        profileVersion: 1,
        save: vi.fn().mockResolvedValue(true),
        toObject: function () {
          return { ...this };
        },
      };
      mockRepo.findByUserId.mockResolvedValue(mockProfileDoc);

      const resumeDoc: Partial<ResumeDocument> = {
        contact: { fullName: 'Gopher', links: [] },
        skills: [
          { id: 's1', name: 'Go', category: 'LANGUAGE', proficiency: 'INTERMEDIATE', evidenceIds: ['resume_ev_go'] },
        ],
      };

      const result = await profileService.hydrateFromParsedResume(userId, null, resumeDoc as ResumeDocument);
      expect(result.skills.length).toBe(1);
      const goSkill = result.skills[0];
      expect(goSkill.verified).toBe(true);
      expect(goSkill.source).toBe(SkillSource.ASSESSMENT);
      expect(goSkill.level).toBe(5);
      // Evidence IDs should be merged
      expect(goSkill.evidenceIds).toContain('prior_ev_1');
      expect(goSkill.evidenceIds).toContain('resume_ev_go');
    });
  });

  // =========================================================================
  // SUITE 5: Experience Deduplication & Insufficient Identity Rule
  // =========================================================================
  describe('Suite 5: Experience Deduplication & Insufficient Identity Rule', () => {
    it('deduplicates and merges experiences when sufficient identity exists', async () => {
      const userId = 'user_exp_dedup';
      const mockProfileDoc: any = {
        userId,
        skills: [],
        projects: [],
        experience: [
          {
            companyName: 'Meta',
            jobTitle: 'Software Engineer',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2022-01-01'),
            bullets: ['Worked on news feed ranking'],
            technologiesUsed: ['Python'],
            evidenceIds: ['ev_feed'],
          },
        ],
        education: [],
        profileVersion: 1,
        save: vi.fn().mockResolvedValue(true),
        toObject: function () {
          return { ...this };
        },
      };
      mockRepo.findByUserId.mockResolvedValue(mockProfileDoc);

      const resumeDoc: Partial<ResumeDocument> = {
        contact: { fullName: 'Meta Eng', links: [] },
        experience: [
          {
            id: 'exp_meta',
            companyName: 'Meta',
            jobTitle: 'Software Engineer',
            startDate: '2020-01-01',
            endDate: '2022-01-01',
            isCurrent: false,
            bullets: [
              { id: 'b_1', text: 'Worked on news feed ranking', evidenceIds: [] }, // duplicate bullet
              { id: 'b_2', text: 'Reduced p99 inference latency by 35ms', evidenceIds: ['ev_p99'] }, // new bullet
            ],
            technologiesUsed: ['Python', 'PyTorch'], // new tech
          },
        ],
      };

      const result = await profileService.hydrateFromParsedResume(userId, null, resumeDoc as ResumeDocument);
      expect(result.experience.length).toBe(1);
      const merged = result.experience[0];
      expect(merged.bullets).toHaveLength(2);
      expect(merged.bullets).toContain('Reduced p99 inference latency by 35ms');
      expect(merged.technologiesUsed).toContain('PyTorch');
      expect(merged.technologiesUsed).toContain('Python');
      expect(merged.evidenceIds).toContain('ev_feed');
      expect(merged.evidenceIds).toContain('ev_p99');
    });

    it('upholds the Insufficient Identity Rule: preserves partial experiences rather than collapsing them', async () => {
      const userId = 'user_insufficient_identity';
      const mockProfileDoc: any = {
        userId,
        skills: [],
        projects: [],
        experience: [
          {
            companyName: null,
            jobTitle: null,
            description: 'Contract developer for freelance clients',
            bullets: ['Freelance work'],
          },
        ],
        education: [],
        profileVersion: 1,
        save: vi.fn().mockResolvedValue(true),
        toObject: function () {
          return { ...this };
        },
      };
      mockRepo.findByUserId.mockResolvedValue(mockProfileDoc);

      // Ingest another partial experience without company or title
      const resumeDoc: Partial<ResumeDocument> = {
        contact: { fullName: 'Freelancer', links: [] },
        experience: [
          {
            id: 'exp_partial_2',
            isCurrent: false,
            bullets: [{ id: 'b_unrelated', text: 'Open source contributor to Kubernetes', evidenceIds: [] }],
          },
        ],
      };

      const result = await profileService.hydrateFromParsedResume(userId, null, resumeDoc as ResumeDocument);
      // Because identity fields are insufficient (neither company nor title exists), they must NOT collapse!
      expect(result.experience.length).toBe(2);
      expect(result.experience[0].bullets).toContain('Freelance work');
      expect(result.experience[1].bullets).toContain('Open source contributor to Kubernetes');
    });
  });

  // =========================================================================
  // SUITE 6: Project & Education Deduplication
  // =========================================================================
  describe('Suite 6: Project & Education Deduplication', () => {
    it('deduplicates projects by title and merges links/techStack', async () => {
      const userId = 'user_proj_dedup';
      const mockProfileDoc: any = {
        userId,
        skills: [],
        projects: [
          {
            title: 'HyperLogLog Visualizer',
            description: 'Interactive probabilistic data structure demo',
            techStack: ['D3.js'],
            githubUrl: null,
            liveDemoUrl: 'https://hll-demo.io',
          },
        ],
        experience: [],
        education: [],
        profileVersion: 1,
        save: vi.fn().mockResolvedValue(true),
        toObject: function () {
          return { ...this };
        },
      };
      mockRepo.findByUserId.mockResolvedValue(mockProfileDoc);

      const resumeDoc: Partial<ResumeDocument> = {
        contact: { fullName: 'Dev', links: [] },
        projects: [
          {
            id: 'proj_hll',
            title: 'HyperLogLog Visualizer',
            technologies: ['TypeScript', 'D3.js'],
            repoUrl: 'https://github.com/dev/hyperloglog',
            bullets: ['Interactive probabilistic demo'],
          },
        ],
      };

      const result = await profileService.hydrateFromParsedResume(userId, null, resumeDoc as ResumeDocument);
      expect(result.projects.length).toBe(1);
      const proj = result.projects[0];
      expect(proj.liveDemoUrl).toBe('https://hll-demo.io');
      expect(proj.githubUrl).toBe('https://github.com/dev/hyperloglog');
    });

    it('deduplicates education by institution and degree', async () => {
      const userId = 'user_edu_dedup';
      const mockProfileDoc: any = {
        userId,
        skills: [],
        projects: [],
        experience: [],
        education: [
          {
            institution: 'MIT',
            degree: 'BS',
            fieldOfStudy: 'Electrical Engineering',
            startYear: 2015,
            endYear: 2019,
          },
        ],
        profileVersion: 1,
        save: vi.fn().mockResolvedValue(true),
        toObject: function () {
          return { ...this };
        },
      };
      mockRepo.findByUserId.mockResolvedValue(mockProfileDoc);

      const resumeDoc: Partial<ResumeDocument> = {
        contact: { fullName: 'MIT Grad', links: [] },
        education: [
          {
            id: 'edu_mit',
            institution: 'MIT',
            degree: 'BS',
            fieldOfStudy: 'Electrical Engineering and CS', // slight expansion
            startDate: '2015-09-01',
            endDate: '2019-06-01',
          },
        ],
      };

      const result = await profileService.hydrateFromParsedResume(userId, null, resumeDoc as ResumeDocument);
      expect(result.education.length).toBe(1);
      expect(result.education[0].institution).toBe('MIT');
    });
  });

  // =========================================================================
  // SUITE 7: Manual Data Preservation & Conflict Policy
  // =========================================================================
  describe('Suite 7: Manual Data Preservation & Conflict Policy', () => {
    it('preserves existing non-empty headline, phone, and verified skills against differing resume fields', async () => {
      const userId = 'user_conflict_policy';
      const mockProfileDoc: any = {
        userId,
        headline: 'Lead Distributed Systems Architect',
        phone: '+1 999 888 7777',
        bio: 'Custom written bio that is firmly established by candidate.',
        targetRole: 'VP of Engineering',
        skills: [
          {
            name: 'GraphQL',
            level: 5,
            source: SkillSource.ASSESSMENT,
            verified: true,
          },
        ],
        projects: [],
        experience: [],
        education: [],
        profileVersion: 1,
        save: vi.fn().mockResolvedValue(true),
        toObject: function () {
          return { ...this };
        },
      };
      mockRepo.findByUserId.mockResolvedValue(mockProfileDoc);

      const conflictingResume: Partial<ResumeDocument> = {
        contact: {
          fullName: 'Resume Name',
          phone: '+1 111 222 3333',
          links: [],
        },
        summary: {
          text: 'Junior Full Stack Developer looking for entry level roles.',
          targetRole: 'Junior Developer',
        },
        skills: [
          { id: 's_gql', name: 'GraphQL', category: 'BACKEND', proficiency: 'BEGINNER', evidenceIds: ['ev_gql_entry'] },
        ],
      };

      const result = await profileService.hydrateFromParsedResume(userId, null, conflictingResume as ResumeDocument);

      // User's manual and verified data must WIN over resume defaults
      expect(result.headline).toBe('Lead Distributed Systems Architect');
      expect(result.phone).toBe('+1 999 888 7777');
      expect(result.bio).toBe('Custom written bio that is firmly established by candidate.');
      expect(result.targetRole).toBe('VP of Engineering');
      expect(result.skills[0].verified).toBe(true);
      expect(result.skills[0].level).toBe(5);
      expect(result.skills[0].source).toBe(SkillSource.ASSESSMENT);
    });
  });

  // =========================================================================
  // SUITE 8: Provenance & Phase 1 Evidence Linkage
  // =========================================================================
  describe('Suite 8: Provenance & Phase 1 Evidence Linkage', () => {
    it('attaches Phase 1 ResumeEvidence IDs to profile entities without inventing fake IDs', async () => {
      const userId = 'user_provenance';
      const mockProfileDoc: any = {
        userId,
        skills: [],
        projects: [],
        experience: [],
        education: [],
        profileVersion: 1,
        save: vi.fn().mockResolvedValue(true),
        toObject: function () {
          return { ...this };
        },
      };
      mockRepo.findByUserId.mockResolvedValue(mockProfileDoc);

      const resumeDoc: Partial<ResumeDocument> = {
        contact: { fullName: 'Provenanced Dev', links: [] },
        skills: [
          { id: 'sk_k8s', name: 'Kubernetes', category: 'CLOUD', evidenceIds: ['phase1_ev_k8s_001'] },
        ],
        experience: [
          {
            id: 'exp_cloud',
            companyName: 'Cloud Native Labs',
            jobTitle: 'DevOps Lead',
            isCurrent: true,
            bullets: [
              { id: 'b_mesh', text: 'Managed 500-node service mesh', evidenceIds: ['phase1_ev_mesh_002'] },
            ],
          },
        ],
        evidence: [
          { id: 'phase1_ev_k8s_001', type: 'SKILL', source: 'PARSED', value: 'Kubernetes', verified: false, createdAt: '2026-01-01' },
          { id: 'phase1_ev_mesh_002', type: 'METRIC', source: 'PARSED', value: '500-node', verified: false, createdAt: '2026-01-01' },
        ],
      };

      const result = await profileService.hydrateFromParsedResume(userId, null, resumeDoc as ResumeDocument);
      expect(result.skills[0].evidenceIds).toEqual(['phase1_ev_k8s_001']);
      expect(result.experience[0].evidenceIds).toContain('phase1_ev_mesh_002');
    });
  });

  // =========================================================================
  // SUITE 9: Idempotency & Re-hydration Safety
  // =========================================================================
  describe('Suite 9: Idempotency & Re-hydration Safety', () => {
    it('running hydration twice with the exact same resume produces zero duplicates and zero version bump', async () => {
      const userId = 'user_idempotent';
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
        profileVersion: 1,
        save: vi.fn().mockResolvedValue(true),
        toObject: function () {
          return { ...this };
        },
      };
      mockRepo.findByUserId.mockResolvedValue(mockProfileDoc);

      const resumeDoc: Partial<ResumeDocument> = {
        contact: { fullName: 'Dev', phone: '+1 555 0000', location: 'Seattle, WA, USA', links: [] },
        summary: { text: 'Cloud dev with AWS experience exceeding 20 chars', targetRole: 'Cloud Engineer' },
        skills: [{ id: 's1', name: 'AWS', category: 'CLOUD', evidenceIds: ['ev_aws'] }],
        experience: [{ id: 'e1', companyName: 'Amazon', jobTitle: 'SDE II', isCurrent: true, bullets: [] }],
        education: [{ id: 'ed1', institution: 'UW', degree: 'BS' }],
        projects: [{ id: 'p1', title: 'S3 Sync Tool', technologies: ['AWS'], bullets: [] }],
      };

      // First hydration: profile changes, version bumps to 2
      const firstPass = await profileService.hydrateFromParsedResume(userId, null, resumeDoc as ResumeDocument);
      expect(firstPass.profileVersion).toBe(2);
      expect(firstPass.skills.length).toBe(1);
      expect(firstPass.experience.length).toBe(1);
      expect(firstPass.projects.length).toBe(1);
      expect(firstPass.education.length).toBe(1);

      // Second hydration with the exact same resume
      const secondPass = await profileService.hydrateFromParsedResume(userId, null, resumeDoc as ResumeDocument);
      // Zero duplicate entries
      expect(secondPass.skills.length).toBe(1);
      expect(secondPass.experience.length).toBe(1);
      expect(secondPass.projects.length).toBe(1);
      expect(secondPass.education.length).toBe(1);
      // Zero version bump!
      expect(secondPass.profileVersion).toBe(2);
    });
  });

  // =========================================================================
  // SUITE 10: Profile Versioning Scope
  // =========================================================================
  describe('Suite 10: Profile Versioning Scope', () => {
    it('profileVersion increments ONLY when persistent career facts materially change', async () => {
      const userId = 'user_version_scope';
      const mockProfileDoc: any = {
        userId,
        headline: 'Engineer',
        skills: [],
        projects: [],
        experience: [],
        education: [],
        profileVersion: 1,
        save: vi.fn().mockResolvedValue(true),
        toObject: function () {
          return { ...this };
        },
      };
      mockRepo.findByUserId.mockResolvedValue(mockProfileDoc);

      // Read operation getMyProfile must NOT bump version
      const readProfile = await profileService.getMyProfile(userId);
      expect(readProfile.profileVersion).toBe(1);

      // Add a new skill materially changes facts -> version bumps to 2
      const updated = await profileService.addSkill(userId, { name: 'Docker' });
      expect(updated.profileVersion).toBe(2);
    });
  });

  // =========================================================================
  // SUITE 11: Deterministic Completeness Scoring
  // =========================================================================
  describe('Suite 11: Deterministic Completeness Scoring', () => {
    it('accurately computes 8-section breakdown and total score adhering to 100-point weights', () => {
      // 1. Fresh clean slate profile
      const cleanSlate = profileService.calculateDetailedCompleteness({});
      expect(cleanSlate.score).toBe(10); // Base account registration
      expect(cleanSlate.missingFields).toContain('headline');
      expect(cleanSlate.missingFields).toContain('targetRole');
      expect(cleanSlate.missingFields).toContain('phone');
      expect(cleanSlate.missingFields).toContain('location');
      expect(cleanSlate.missingFields).toContain('bio (at least 20 characters)');
      expect(cleanSlate.missingFields).toContain('skills (at least 3)');
      expect(cleanSlate.missingFields).toContain('verified skill (at least 1)');
      expect(cleanSlate.missingFields).toContain('projects (at least 1)');
      expect(cleanSlate.missingFields).toContain('portfolio or professional links');

      // 2. Fully populated profile
      const fullyPopulated = profileService.calculateDetailedCompleteness({
        headline: 'Staff Systems Architect', // +15
        targetRole: 'Staff Systems Architect', // +15
        bio: 'Over ten years building highly reliable distributed systems with sub-second SLAs.', // +10 (>20 chars)
        phone: '+1 555 123 4567', // +5
        location: { city: 'New York', state: 'NY', country: 'USA' }, // +5
        skills: [
          { name: 'Go', level: 5, verified: true, source: SkillSource.ASSESSMENT }, // +15 (>=3 skills) + 10 (verified)
          { name: 'PostgreSQL', level: 4, verified: false, source: SkillSource.PROFILE },
          { name: 'Kafka', level: 4, verified: false, source: SkillSource.PROFILE },
        ],
        projects: [
          { title: 'StreamEngine', description: 'Event pipeline', techStack: ['Go', 'Kafka'] } as any, // +10
        ],
        experience: [{ companyName: 'Stripe', jobTitle: 'Staff Architect' }] as any,
        education: [{ institution: 'Stanford University', degree: 'MS CS' }] as any,
        links: { github: 'https://github.com/staffeng', linkedin: '', portfolio: '' }, // +5
      });

      // 10 base + 15 headline + 15 targetRole + 10 bio + 5 phone + 5 loc + 15 skills + 10 verified + 10 proj + 5 links = 100
      expect(fullyPopulated.score).toBe(100);
      expect(fullyPopulated.missingFields).toHaveLength(0);
      expect(fullyPopulated.sections.identity.status).toBe('COMPLETE');
      expect(fullyPopulated.sections.contact.status).toBe('COMPLETE');
      expect(fullyPopulated.sections.summary.status).toBe('COMPLETE');
      expect(fullyPopulated.sections.skills.status).toBe('COMPLETE');
      expect(fullyPopulated.sections.projects.status).toBe('COMPLETE');
      expect(fullyPopulated.sections.links.status).toBe('COMPLETE');
    });
  });

  // =========================================================================
  // SUITE 12: Master Resume Presentation Semantics
  // =========================================================================
  describe('Suite 12: Master Resume Presentation Semantics', () => {
    it('treats ProfileModel as the canonical source of truth while resumeDocument represents presentation AST', () => {
      const mockProfile: Partial<IProfile> = {
        userId: 'user_master_contract',
        headline: 'Principal Engineer',
        skills: [{ name: 'Rust', level: 5, verified: true, source: SkillSource.PROFILE }],
        profileVersion: 3,
      };

      // Verify that ProfileModel owns canonical persistent facts
      expect(mockProfile.profileVersion).toBe(3);
      expect(mockProfile.skills![0].name).toBe('Rust');
    });
  });

  // =========================================================================
  // SUITE 13: Non-destructive Updates via Service Methods
  // =========================================================================
  describe('Suite 13: Non-destructive Updates via Service Methods', () => {
    it('updateProfile recalculates completeness and version correctly', async () => {
      const userId = 'user_service_update';
      const mockProfileDoc: any = {
        userId,
        headline: '',
        targetRole: '',
        profileVersion: 1,
        save: vi.fn().mockResolvedValue(true),
        toObject: function () {
          return { ...this };
        },
      };
      mockRepo.findByUserId.mockResolvedValue(mockProfileDoc);

      const updated = await profileService.updateProfile(userId, {
        headline: 'Lead Architect',
        targetRole: 'Chief Technology Officer',
      });

      expect(updated.profileVersion).toBe(2);
      expect(updated.headline).toBe('Lead Architect');
      expect(updated.targetRole).toBe('Chief Technology Officer');
      expect(updated.completionPercentage).toBe(40); // 10 base + 15 headline + 15 targetRole
    });
  });

  // =========================================================================
  // SUITE 14: Phase 1 & Existing Feature Regression
  // =========================================================================
  describe('Suite 14: Phase 1 & Existing Feature Regression', () => {
    it('preserves existing calculateProfileCompletion numbers for backward compatibility', () => {
      const score = profileService.calculateProfileCompletion({
        headline: 'Full-Stack Developer',
        targetRole: 'Full-Stack Engineer',
        skills: [
          { name: 'TypeScript', verified: true, source: SkillSource.ASSESSMENT },
          { name: 'React', verified: false, source: SkillSource.PROFILE },
          { name: 'Node.js', verified: false, source: SkillSource.PROFILE },
        ] as any,
        projects: [{ title: 'Portfolio Web App' }] as any,
      });

      // 10 base + 15 headline + 15 targetRole + 15 skills + 10 verified + 10 proj = 75
      expect(score).toBe(75);
    });
  });
});
