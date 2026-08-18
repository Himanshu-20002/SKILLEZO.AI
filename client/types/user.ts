export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  headline?: string;
  location?: string;
  joinedDate: string;
  status: 'active' | 'suspended' | 'pending';
}
