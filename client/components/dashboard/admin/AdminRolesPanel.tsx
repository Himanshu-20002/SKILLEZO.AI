'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Layers,
  Code,
  Server,
  Cpu,
  Box,
  Smartphone,
  Shield,
  Database,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  X,
  Sparkles,
  ArrowUpDown,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { platformRolesService } from '@/services/platform-roles.service';
import { PlatformRole, CreatePlatformRoleInput } from '@/types/platform-role';

const ROLE_CATEGORIES = [
  'Engineering',
  'Data & AI',
  'Cloud & DevOps',
  'Security',
  'Product & Design',
  'Quality Assurance',
];

const AVAILABLE_ICONS = [
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Layers', icon: Layers },
  { name: 'Code', icon: Code },
  { name: 'Server', icon: Server },
  { name: 'Cpu', icon: Cpu },
  { name: 'Box', icon: Box },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Shield', icon: Shield },
  { name: 'Database', icon: Database },
];

function getRoleIcon(iconName?: string) {
  const match = AVAILABLE_ICONS.find((i) => i.name.toLowerCase() === (iconName || '').toLowerCase());
  const IconComponent = match ? match.icon : Briefcase;
  return <IconComponent className="w-4 h-4" />;
}

export const AdminRolesPanel: React.FC = () => {
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<PlatformRole | null>(null);
  const [formData, setFormData] = useState<CreatePlatformRoleInput>({
    name: '',
    category: 'Engineering',
    description: '',
    defaultSkills: [],
    icon: 'Briefcase',
    order: 0,
    isFeatured: true,
    status: 'active',
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await platformRolesService.adminListRoles();
      setRoles(data);
    } catch {
      toast.error('Failed to load platform roles');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      category: 'Engineering',
      description: '',
      defaultSkills: [],
      icon: 'Briefcase',
      order: roles.length + 1,
      isFeatured: true,
      status: 'active',
    });
    setSkillsInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: PlatformRole) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      category: role.category,
      description: role.description || '',
      defaultSkills: role.defaultSkills || [],
      icon: role.icon || 'Briefcase',
      order: role.order || 0,
      isFeatured: role.isFeatured ?? true,
      status: role.status,
    });
    setSkillsInput(role.defaultSkills?.join(', ') || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    const skillsArray = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      const payload: CreatePlatformRoleInput = {
        ...formData,
        defaultSkills: skillsArray,
      };

      if (editingRole) {
        await platformRolesService.adminUpdateRole(editingRole._id, payload);
        toast.success(`Role '${formData.name}' updated successfully`);
      } else {
        await platformRolesService.adminCreateRole(payload);
        toast.success(`Role '${formData.name}' created and added to platform`);
      }

      setIsModalOpen(false);
      await loadRoles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (role: PlatformRole) => {
    try {
      const updated = await platformRolesService.adminToggleStatus(role._id);
      toast.success(
        `Role '${role.name}' is now ${updated.status === 'active' ? 'Active' : 'Inactive'}`
      );
      setRoles((prev) =>
        prev.map((r) => (r._id === role._id ? { ...r, status: updated.status } : r))
      );
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (role: PlatformRole) => {
    if (!confirm(`Are you sure you want to delete role '${role.name}'?`)) return;
    try {
      await platformRolesService.adminDeleteRole(role._id);
      toast.success(`Role '${role.name}' deleted`);
      setRoles((prev) => prev.filter((r) => r._id !== role._id));
    } catch {
      toast.error('Failed to delete role');
    }
  };

  const filteredRoles = roles.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.defaultSkills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'All' || r.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const activeCount = roles.filter((r) => r.status === 'active').length;
  const categoriesCount = new Set(roles.map((r) => r.category)).size;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#3D5AFE]/30 text-[#61DAFB] border border-[#3D5AFE]/40">
                Career Taxonomy Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Dynamic Roles Configurator
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Platform Target Job Roles
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Configure and curate target job roles dynamically across Career GPS, Skill Gap Analysis, Onboarding, and Learning Hub recommendations.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-102 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Job Role</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div>
            <span className="text-[11px] text-slate-400 block">Total Configured Roles</span>
            <span className="text-lg font-bold text-white">{roles.length}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Active in Platform</span>
            <span className="text-lg font-bold text-emerald-400">{activeCount}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Draft / Inactive</span>
            <span className="text-lg font-bold text-amber-400">{roles.length - activeCount}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Domain Categories</span>
            <span className="text-lg font-bold text-[#61DAFB]">{categoriesCount}</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0B1130] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search roles by name or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#3D5AFE]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#3D5AFE] text-slate-700 dark:text-slate-200"
          >
            <option value="All">All Categories</option>
            {ROLE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500">
          Showing {filteredRoles.length} of {roles.length} roles
        </span>
      </div>

      {/* Roles Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#3D5AFE] border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500">Loading platform job roles...</p>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-[#0B1130] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No roles found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No platform roles match your current search or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.map((role) => {
            const isActive = role.status === 'active';
            return (
              <div
                key={role._id}
                className={`bg-white dark:bg-[#0B1130] border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-slate-200 dark:border-slate-800/80 hover:border-[#3D5AFE]/40'
                    : 'border-slate-200/50 dark:border-slate-800/40 opacity-70 bg-slate-50/50 dark:bg-slate-950/20'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                        {getRoleIcon(role.icon)}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {role.category}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(role)}
                      title={`Click to ${isActive ? 'deactivate' : 'activate'} role`}
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {role.name}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">
                      /{role.slug}
                    </p>
                  </div>

                  {role.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {role.description}
                    </p>
                  )}

                  {/* Skills Tags */}
                  {role.defaultSkills && role.defaultSkills.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-medium text-slate-400 block">
                        Core Competencies:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {role.defaultSkills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Order #{role.order || 0}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(role)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(role)}
                      title="Delete role"
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT ROLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <Briefcase className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingRole ? 'Edit Platform Job Role' : 'Add New Platform Job Role'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cybersecurity Specialist"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    {ROLE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Overview of core competencies, daily responsibilities, and architectural scope..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Core Skills (comma separated) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Network Security, Penetration Testing, OWASP, Linux, SIEM"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  These skills will be benchmarked automatically in Career GPS and Skill Gap Analysis.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    {AVAILABLE_ICONS.map((i) => (
                      <option key={i.name} value={i.name}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.status === 'active'}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })
                    }
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Active in Platform
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Featured in Onboarding
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#3D5AFE] text-white font-semibold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

