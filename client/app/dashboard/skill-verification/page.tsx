'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  ShieldCheck,
  Search,
  LayoutGrid,
  ListFilter,
  X,
  ArrowDown,
  Clock,
  TrendingUp,
  BrainCircuit,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { VerificationSearch } from '@/components/dashboard/verification/VerificationSearch';
import { VerificationFilters } from '@/components/dashboard/verification/VerificationFilters';
import { VerificationTable } from '@/components/dashboard/verification/VerificationTable';
import { VerificationCard } from '@/components/dashboard/verification/VerificationCard';
import { AssessmentCard } from '@/components/dashboard/verification/AssessmentCard';
import { AssessmentModal } from '@/components/dashboard/verification/AssessmentModal';
import { CertificateModal } from '@/components/dashboard/verification/CertificateModal';
import { Pagination } from '@/components/dashboard/common/Pagination';
import { EmptyState } from '@/components/dashboard/common/EmptyState';
import { VerificationStatusBadge } from '@/components/dashboard/verification/VerificationStatusBadge';
import {
  SkillVerificationRecord,
  AssessmentCatalogItem,
  AssessmentQuiz,
  AssessmentResult,
} from '@/types/verification';
import { verificationService } from '@/services/verification.service';
import { toast } from 'sonner';

export default function SkillVerificationPage() {
  // Verification Records State
  const [records, setRecords] = useState<SkillVerificationRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordSearch, setRecordSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [recordCategoryFilter, setRecordCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<SkillVerificationRecord | null>(null);

  // Assessment Catalog State
  const [catalog, setCatalog] = useState<AssessmentCatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('all');

  // Quiz Modal State
  const [selectedQuiz, setSelectedQuiz] = useState<AssessmentQuiz | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

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

  // Fetch both User Verification Records and Assessment Tracks
  const loadData = async () => {
    try {
      setRecordsLoading(true);
      setCatalogLoading(true);
      const [liveRecords, catalogData] = await Promise.all([
        verificationService.getUserRecords().catch(() => []),
        verificationService.getCatalog().catch(() => []),
      ]);
      setRecords(liveRecords || []);
      setCatalog(catalogData || []);
    } catch (err) {
      console.error('Failed to load verification hub data:', err);
    } finally {
      setRecordsLoading(false);
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Check for hash on mount to scroll smoothly if navigated via #assessments
    if (typeof window !== 'undefined' && window.location.hash === '#assessments') {
      setTimeout(() => {
        const el = document.getElementById('assessments-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, []);

  const handleScrollToAssessments = () => {
    const el = document.getElementById('assessments-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Assessment Quiz Start Handler
  const handleStartAssessment = async (track: AssessmentCatalogItem) => {
    try {
      const quiz = await verificationService.getAssessment(track.id);
      setSelectedQuiz(quiz);
      setIsQuizModalOpen(true);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to initialize assessment quiz');
    }
  };

  // Assessment Quiz Completed Handler
  const handleAssessmentCompleted = (_result: AssessmentResult) => {
    loadData();
    toast.success('Assessment complete! Your verification credentials have updated.');
  };

  // Certificate Modal Opener
  const handleOpenCertificate = (record: SkillVerificationRecord) => {
    if (record.credentialHash) {
      setCertificateData({
        skillName: record.skillName,
        category: record.category,
        candidateName: record.applicantName || 'Candidate',
        score: record.score,
        proficiency:
          record.proficiency ||
          (record.score >= 90 ? 'Expert' : record.score >= 75 ? 'Advanced' : 'Intermediate'),
        credentialHash: record.credentialHash,
        issueDate: record.verifiedDate,
      });
      setIsCertificateModalOpen(true);
    } else {
      setSelectedRecord(record);
    }
  };

  const handleViewCatalogCertificate = (cert: {
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

  // Filtering for Verification Records
  const itemsPerPage = 5;
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.skillName.toLowerCase().includes(recordSearch.toLowerCase()) ||
      record.category.toLowerCase().includes(recordSearch.toLowerCase()) ||
      (record.credentialHash &&
        record.credentialHash.toLowerCase().includes(recordSearch.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesCategory =
      recordCategoryFilter === 'all' || record.category === recordCategoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filtering for Assessment Catalog
  const filteredCatalog = catalog.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      track.skillName.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      track.description.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCategory =
      catalogCategoryFilter === 'all' || track.category === catalogCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // KPI Calculations
  const verifiedCount = records.filter((r) => r.status === 'verified').length;
  const completedCatalogCount = catalog.filter((c) => c.completed).length;

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Page Header */}
        <PageHeader
          title="Skill Verification & Assessments"
          description="Interactive evaluations, cryptographic verifiable credentials, and tamper-proof telemetry audit logs."
          actions={
            <button
              onClick={handleScrollToAssessments}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#3D5AFE]/20 hover:opacity-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Take Assessment</span>
              <ArrowDown className="w-4 h-4" />
            </button>
          }
        />

        {/* Quick Stats KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                  {verifiedCount} Credentials
                </span>
              </div>
            </div>
          </div>

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
                  ~15 Mins / Test
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: VERIFIED CREDENTIALS & AUDIT LOGS */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Verified Credentials & Audit History
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View your earned skill badges, cryptographic verification proofs, and inspection logs.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 self-start sm:self-auto">
              {records.length} {records.length === 1 ? 'Record' : 'Records'} Total
            </span>
          </div>

          {/* Filter Controls Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="flex-1 max-w-md">
              <VerificationSearch value={recordSearch} onChange={setRecordSearch} />
            </div>

            <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
              <VerificationFilters
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                categoryFilter={recordCategoryFilter}
                onCategoryChange={setRecordCategoryFilter}
              />

              {/* View Mode Toggle Switch */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg text-xs transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-[#3D5AFE] text-white shadow'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title="Table View"
                >
                  <ListFilter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg text-xs transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-[#3D5AFE] text-white shadow'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Records Display Area */}
          {recordsLoading ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
              <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
              <div className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
            </div>
          ) : records.length === 0 ? (
            <EmptyState
              title="No Skill Verifications Yet"
              description="You haven't completed any assessments or earned verified credentials yet. Choose a track below to take an assessment and earn your first badge."
              actionLabel="Explore Assessment Tracks"
              onAction={handleScrollToAssessments}
              icon={<Award className="w-7 h-7 text-[#3D5AFE]" />}
            />
          ) : filteredRecords.length === 0 ? (
            <EmptyState
              title="No Verifications Match Criteria"
              description="Try adjusting your search terms or filters to locate skill audit records."
              actionLabel="Reset Filters"
              onAction={() => {
                setRecordSearch('');
                setStatusFilter('all');
                setRecordCategoryFilter('all');
              }}
            />
          ) : viewMode === 'table' ? (
            <div className="space-y-4">
              <VerificationTable
                records={paginatedRecords}
                onSelectRecord={handleOpenCertificate}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedRecords.map((record) => (
                  <VerificationCard
                    key={record.id}
                    record={record}
                    onSelect={handleOpenCertificate}
                  />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </section>

        {/* SECTION 2: AVAILABLE ASSESSMENT TRACKS */}
        <section id="assessments-section" className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#3D5AFE]" />
                Available Assessment Tracks
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interactive technical evaluations with real-time grading, cryptographic verification badges, and automated profile synchronization.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#3D5AFE]/10 text-[#3D5AFE] self-start sm:self-auto">
              {completedCatalogCount} of {catalog.length || 5} Completed
            </span>
          </div>

          {/* Assessment Search & Category Filter Pills */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search assessment tracks (e.g. React, Python, Cloud)..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {['all', 'Frontend', 'Backend', 'Cloud & DevOps', 'Programming'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCatalogCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    catalogCategoryFilter === cat
                      ? 'bg-[#3D5AFE] text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'All Tracks' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Assessment Track Grid */}
          {catalogLoading ? (
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
                  onViewCertificate={handleViewCatalogCertificate}
                />
              ))}
            </div>
          )}
        </section>

        {/* Detail Modal Overlay for pending/failed items without full certificate */}
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#3D5AFE]">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {selectedRecord.skillName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedRecord.category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Status</span>
                  <VerificationStatusBadge status={selectedRecord.status} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Assessor Engine</span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                    {selectedRecord.assessor}
                  </span>
                </div>

                {selectedRecord.score > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Overall Audit Score
                    </span>
                    <span
                      className={`text-base font-bold ${
                        selectedRecord.score >= 75
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {selectedRecord.score} / {selectedRecord.maxScore}
                    </span>
                  </div>
                )}

                {selectedRecord.credentialHash && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Cryptographic Credential Hash
                    </span>
                    <p className="font-mono text-xs text-[#00897B] dark:text-[#00D9C0] break-all">
                      {selectedRecord.credentialHash}
                    </p>
                  </div>
                )}

                {selectedRecord.details && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Audit Notes & Diagnostics
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedRecord.details}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Close Detail View
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Quiz Assessment Modal */}
        <AssessmentModal
          isOpen={isQuizModalOpen}
          onClose={() => setIsQuizModalOpen(false)}
          quiz={selectedQuiz}
          onAssessmentCompleted={handleAssessmentCompleted}
          onViewCertificate={(cert) => {
            setIsQuizModalOpen(false);
            handleViewCatalogCertificate(cert);
          }}
        />

        {/* Verifiable Certificate Modal */}
        <CertificateModal
          isOpen={isCertificateModalOpen}
          onClose={() => setIsCertificateModalOpen(false)}
          certificate={certificateData}
        />
      </div>
    </DashboardLayout>
  );
}
