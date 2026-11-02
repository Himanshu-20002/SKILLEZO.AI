export interface PlatformRole {
  _id: string;
  name: string;
  slug: string;
  category: string;
  description?: string | null;
  defaultSkills: string[];
  icon: string;
  order: number;
  isFeatured: boolean;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePlatformRoleInput {
  name: string;
  slug?: string;
  category: string;
  description?: string;
  defaultSkills: string[];
  icon?: string;
  order?: number;
  isFeatured?: boolean;
  status?: 'active' | 'inactive';
}

export interface UpdatePlatformRoleInput extends Partial<CreatePlatformRoleInput> {}

