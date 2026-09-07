'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  BrainCircuit,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { AssessmentCard } from '@/components/dashboard/verification/AssessmentCard';
import { AssessmentModal } from '@/components/dashboard/verification/AssessmentModal';
import { CertificateModal } from '@/components/dashboard/verification/CertificateModal';
import { verificationService } from '@/services/verification.service';
import {
  AssessmentCatalogItem,
  AssessmentQuiz,
  AssessmentResult,
} from '@/types/verification';
import { toast } from 'sonner';

export default function AssessmentsPage() {
  const [catalog, setCatalog] = useState<AssessmentCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Quiz Modal State
  const [selectedQuiz, setSelectedQuiz] = useState<AssessmentQuiz | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  // Certificate Modal State
  const [certificateData, setCertificateData] = useState<{
    skillName: string;
    category?: string;
    candidateName?: string;
    score: number;
    proficiency?: string;
    credentialHash: string;
    issueDate?: string;
  } | null>(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const data = await verificationService.getCatalog();
      setCatalog(data);
    } catch {
      toast.error('Could not load assessment tracks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleStartAssessment = async (track: AssessmentCatalogItem) => {
    try {
      setQuizLoading(true);
      const quiz = await verificationService.getAssessment(track.id);
      setSelectedQuiz(quiz);
      setIsQuizModalOpen(true);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to initialize assessment quiz');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleAssessmentCompleted = (result: AssessmentResult) => {
    fetchCatalog();
  };

  const handleViewCertificate = (cert: {
    skillName: string;
    category?: string;
    candidateName?: string;
    score: number;
    proficiency?: string;
    credentialHash: string;
    issueDate?: string;
  }) => {
    setCertificateData(cert);
    setIsCertificateModalOpen(true);
  };

  const filteredCatalog = catalog.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(search.toLowerCase()) ||
      track.skillName.toLowerCase().includes(search.toLowerCase()) ||
      track.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || track.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const completedCount = catalog.filter((c) => c.completed).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Skill Assessments Engine"
          description="Interactive technical evaluations with real-time grading, cryptographic verification badges, and automated profile synchronization."
          badge="AI Evaluator v4.2"
        />

        {/* Quick Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3D5AFE]/10 flex items-center justify-center text-[#3D5AFE]">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  Available Tracks
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {catalog.length || 5} Tracks
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  Verified Earned
                </span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {completedCount} of {catalog.length || 5}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  Passing Standard
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  ≥ 70% Score
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  Estimated Duration
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  15 Mins / Test
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search assessment tracks (e.g. React, Python, Cloud)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {['all', 'Frontend', 'Backend', 'Cloud & DevOps', 'Programming'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#3D5AFE] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All Tracks' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Assessments Track Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800/40 animate-pulse border border-slate-200 dark:border-slate-800"
              />
            ))}
          </div>
        ) : filteredCatalog.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <Award className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No assessment tracks match your search
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or category filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCatalog.map((track) => (
              <AssessmentCard
                key={track.id}
                track={track}
                onStartAssessment={handleStartAssessment}
                onViewCertificate={handleViewCertificate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Interactive Quiz Assessment Modal */}
      <AssessmentModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        quiz={selectedQuiz}
        onAssessmentCompleted={handleAssessmentCompleted}
        onViewCertificate={(cert) => {
          setIsQuizModalOpen(false);
          handleViewCertificate(cert);
        }}
      />

      {/* Verifiable Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        certificate={certificateData}
      />
    </DashboardLayout>
  );
}
