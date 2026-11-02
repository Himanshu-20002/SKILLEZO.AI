import { apiFetch } from '@/lib/api';
import { PlatformRole, CreatePlatformRoleInput, UpdatePlatformRoleInput } from '@/types/platform-role';

export const DEFAULT_FALLBACK_ROLES: PlatformRole[] = [
  {
    _id: 'default_role_1',
    name: 'Full-Stack Engineer',
    slug: 'full-stack-engineer',
    category: 'Engineering',
    description: 'End-to-end web architecture, frontend interfaces, and scalable backend services.',
    defaultSkills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    icon: 'Layers',
    order: 1,
    isFeatured: true,
    status: 'active',
  },
  {
    _id: 'default_role_2',
    name: 'Frontend Engineer',
    slug: 'frontend-engineer',
    category: 'Engineering',
    description: 'Modern UI engineering, React 19, Server Components, client state, and responsive web design.',
    defaultSkills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'JavaScript', 'HTML/CSS'],
    icon: 'Code',
    order: 2,
    isFeatured: true,
    status: 'active',
  },
  {
    _id: 'default_role_3',
    name: 'Backend Engineer',
    slug: 'backend-engineer',
    category: 'Engineering',
    description: 'Distributed REST/gRPC services, microservices, database tuning, and high-concurrency event loops.',
    defaultSkills: ['Node.js', 'Express', 'TypeScript', 'PostgreSQL', 'MongoDB', 'Redis'],
    icon: 'Server',
    order: 3,
    isFeatured: true,
    status: 'active',
  },
  {
    _id: 'default_role_4',
    name: 'AI/ML Specialist',
    slug: 'ai-ml-specialist',
    category: 'Data & AI',
    description: 'Data pipelines, predictive modeling, machine learning algorithms, and Generative AI orchestration.',
    defaultSkills: ['Python', 'Machine Learning', 'PyTorch', 'TensorFlow', 'Generative AI', 'Pandas'],
    icon: 'Cpu',
    order: 4,
    isFeatured: true,
    status: 'active',
  },
  {
    _id: 'default_role_5',
    name: 'DevOps & Cloud Engineer',
    slug: 'devops-cloud-engineer',
    category: 'Cloud & DevOps',
    description: 'Containerization, cloud infrastructure (AWS/GCP), CI/CD release automation, and Kubernetes orchestration.',
    defaultSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'GitHub Actions', 'Terraform'],
    icon: 'Box',
    order: 5,
    isFeatured: true,
    status: 'active',
  },
  {
    _id: 'default_role_6',
    name: 'Mobile App Developer',
    slug: 'mobile-app-developer',
    category: 'Engineering',
    description: 'Cross-platform and native mobile applications with React Native, Flutter, and performant client caching.',
    defaultSkills: ['React Native', 'Flutter', 'TypeScript', 'iOS', 'Android'],
    icon: 'Smartphone',
    order: 6,
    isFeatured: true,
    status: 'active',
  },
];

export const platformRolesService = {
  /**
   * Public: Get all active platform roles
   */
  async getActiveRoles(): Promise<PlatformRole[]> {
    try {
      const res = await apiFetch<{
        success: boolean;
        data: PlatformRole[];
      }>('/api/roles');

      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return DEFAULT_FALLBACK_ROLES;
    } catch (err) {
      console.warn('[platformRolesService] Failed to fetch active roles, using fallback:', err);
      return DEFAULT_FALLBACK_ROLES;
    }
  },

  /**
   * Admin: List all roles
   */
  async adminListRoles(): Promise<PlatformRole[]> {
    try {
      const res = await apiFetch<{
        success: boolean;
        data: PlatformRole[];
      }>('/api/admin/roles');

      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return DEFAULT_FALLBACK_ROLES;
    } catch (err) {
      console.error('[platformRolesService] Failed to list admin roles:', err);
      return DEFAULT_FALLBACK_ROLES;
    }
  },

  /**
   * Admin: Create role
   */
  async adminCreateRole(data: CreatePlatformRoleInput): Promise<PlatformRole> {
    const res = await apiFetch<{
      success: boolean;
      data: PlatformRole;
    }>('/api/admin/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Admin: Update role
   */
  async adminUpdateRole(id: string, data: UpdatePlatformRoleInput): Promise<PlatformRole> {
    const res = await apiFetch<{
      success: boolean;
      data: PlatformRole;
    }>(`/api/admin/roles/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Admin: Delete role
   */
  async adminDeleteRole(id: string): Promise<boolean> {
    const res = await apiFetch<{
      success: boolean;
      data: { deleted: boolean };
    }>(`/api/admin/roles/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.data?.deleted ?? false;
  },

  /**
   * Admin: Toggle role active status
   */
  async adminToggleStatus(id: string): Promise<PlatformRole> {
    const res = await apiFetch<{
      success: boolean;
      data: PlatformRole;
    }>(`/api/admin/roles/${encodeURIComponent(id)}/toggle-status`, {
      method: 'PATCH',
    });
    return res.data;
  },
};

