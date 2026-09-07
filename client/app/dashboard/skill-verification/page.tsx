'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, Plus, LayoutGrid, ListFilter, X, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { VerificationSearch } from '@/components/dashboard/verification/VerificationSearch';
import { VerificationFilters } from '@/components/dashboard/verification/VerificationFilters';
import { VerificationTable } from '@/components/dashboard/verification/VerificationTable';
import { VerificationCard } from '@/components/dashboard/verification/VerificationCard';
import { CertificateModal } from '@/components/dashboard/verification/CertificateModal';
import { Pagination } from '@/components/dashboard/common/Pagination';
import { EmptyState } from '@/components/dashboard/common/EmptyState';
import { mockVerificationRecords } from '@/mock/verification';
import { SkillVerificationRecord } from '@/types/verification';
import { VerificationStatusBadge } from '@/components/dashboard/verification/VerificationStatusBadge';
import { verificationService } from '@/services/verification.service';
import { toast } from 'sonner';

export default function SkillVerificationPage() {
  const [records, setRecords] = useState<SkillVerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<SkillVerificationRecord | null>(null);

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

  useEffect(() => {
    async function loadRecords() {
      try {
        setLoading(true);
        const liveRecords = await verificationService.getUserRecords();
        if (liveRecords && liveRecords.length > 0) {
          // Merge with mock records avoiding duplicates by skillName
          const liveSkillNames = new Set(liveRecords.map((r) => r.skillName.toLowerCase()));
          const remainingMock = mockVerificationRecords.filter(
            (m) => !liveSkillNames.has(m.skillName.toLowerCase())
          );
          setRecords([...liveRecords, ...remainingMock]);
        } else {
          setRecords(mockVerificationRecords);
        }
      } catch {
        setRecords(mockVerificationRecords);
      } finally {
        setLoading(false);
      }
    }
    loadRecords();
  }, []);

  const itemsPerPage = 5;

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.skillName.toLowerCase().includes(search.toLowerCase()) ||
      record.category.toLowerCase().includes(search.toLowerCase()) ||
      (record.credentialHash && record.credentialHash.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || record.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenCertificate = (record: SkillVerificationRecord) => {
    if (record.credentialHash) {
      setCertificateData({
        skillName: record.skillName,
        category: record.category,
        candidateName: record.applicantName || 'Candidate',
        score: record.score,
        proficiency: record.proficiency || (record.score >= 90 ? 'Expert' : record.score >= 75 ? 'Advanced' : 'Intermediate'),
        credentialHash: record.credentialHash,
        issueDate: record.verifiedDate,
      });
      setIsCertificateModalOpen(true);
    } else {
      setSelectedRecord(record);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Skill Verification Engine"
          description="Cryptographic & AI-powered skill audit credentials, verifiable certificates, and real-time assessments."
          badge="AI v4.2"
          actions={
            <Link
              href="/dashboard/assessments"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#3D5AFE]/20 hover:opacity-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Take Skill Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm dark:shadow-md">
          <div className="flex-1 max-w-md">
            <VerificationSearch value={search} onChange={setSearch} />
          </div>

          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <VerificationFilters
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
            />

            {/* View Mode Toggle Switch */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-[#3D5AFE] text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Table View"
              >
                <ListFilter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[#3D5AFE] text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Records Display Area */}
        {filteredRecords.length === 0 ? (
          <EmptyState
            title="No Verifications Match Criteria"
            description="Try adjusting your search terms or filters to locate skill audit records."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearch('');
              setStatusFilter('all');
              setCategoryFilter('all');
            }}
          />
        ) : viewMode === 'table' ? (
          <div className="space-y-4">
            <VerificationTable records={paginatedRecords} onSelectRecord={handleOpenCertificate} />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedRecords.map((record) => (
                <VerificationCard key={record.id} record={record} onSelect={handleOpenCertificate} />
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}

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
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedRecord.skillName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedRecord.category}</p>
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
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">{selectedRecord.assessor}</span>
                </div>

                {selectedRecord.score > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Overall Audit Score</span>
                    <span className={`text-base font-bold ${selectedRecord.score >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {selectedRecord.score} / {selectedRecord.maxScore}
                    </span>
                  </div>
                )}

                {selectedRecord.credentialHash && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Cryptographic Credential Hash</span>
                    <p className="font-mono text-xs text-[#00897B] dark:text-[#00D9C0] break-all">{selectedRecord.credentialHash}</p>
                  </div>
                )}

                {selectedRecord.details && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Audit Notes & Diagnostics</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{selectedRecord.details}</p>
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
