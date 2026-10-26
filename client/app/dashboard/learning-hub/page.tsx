'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  FileText,
  Zap,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  LearningHubHeader,
  SkillGapRecommendationBanner,
  TrackFilterBar,
  TrackCard,
  TrackSyllabusModal,
  PdfCard,
  PdfPreviewModal,
  PdfQuizConverterModal,
} from '@/components/dashboard/learning-hub';
import { EmptyState } from '@/components/dashboard/common/EmptyState';
import {
  TrackCatalogItem,
  PersonalizedRecommendations,
  UserLearningStats,
  PdfDocumentItem,
  ConvertedQuizResult,
} from '@/types/learning-hub';
import { learningHubService } from '@/services/learning-hub.service';
import { toast } from 'sonner';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';

export default function LearningHubPage() {
  const [tracks, setTracks] = useState<TrackCatalogItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<UserLearningStats>({
    enrolledTracksCount: 0,
    completedResourcesCount: 0,
    totalLearningMinutes: 0,
    inProgressTrack: null,
  });
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendations>({
    targetRole: 'Full-Stack Engineer',
    missingSkillsCovered: [],
    recommendedTracks: [],
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tracks' | 'pdf_vault' | 'practice'>('tracks');
  const [activeCategory, setActiveCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<TrackCatalogItem | null>(null);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [enrollingTrackId, setEnrollingTrackId] = useState<string | null>(null);

  // PDF Vault State (Phase 2)
  const [pdfs, setPdfs] = useState<PdfDocumentItem[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState(false);
  const [pdfCategory, setPdfCategory] = useState('All');
  const [pdfSearchQuery, setPdfSearchQuery] = useState('');
  const [selectedPdfForPreview, setSelectedPdfForPreview] = useState<PdfDocumentItem | null>(null);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [selectedQuizResult, setSelectedQuizResult] = useState<ConvertedQuizResult | null>(null);
  const [isQuizConverterOpen, setIsQuizConverterOpen] = useState(false);
  const [isConvertingPdfId, setIsConvertingPdfId] = useState<string | null>(null);
  const [isConvertingQuiz, setIsConvertingQuiz] = useState(false);

  // Fetch all initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [catalogRes, recsRes, statsRes] = await Promise.all([
        learningHubService.getCatalog({
          category: activeCategory,
          difficulty: difficulty !== 'all' ? difficulty : undefined,
          search: searchQuery.trim() || undefined,
        }),
        learningHubService.getPersonalizedRecommendations(),
        learningHubService.getUserStats(),
      ]);

      setTracks(catalogRes.tracks || []);
      setCategories(catalogRes.categories || []);
      setRecommendations(recsRes);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to load learning hub data:', err);
      toast.error('Failed to load learning hub data');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, difficulty, searchQuery]);

  // Fetch PDF vault data
  const loadPdfs = useCallback(async () => {
    try {
      setLoadingPdfs(true);
      const items = await learningHubService.listPdfs({
        category: pdfCategory !== 'All' ? pdfCategory : undefined,
        search: pdfSearchQuery.trim() || undefined,
      });
      setPdfs(items);
    } catch (err) {
      console.error('Failed to load PDFs:', err);
      toast.error('Failed to load PDF documents');
    } finally {
      setLoadingPdfs(false);
    }
  }, [pdfCategory, pdfSearchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab === 'pdf_vault') {
      loadPdfs();
    }
  }, [activeTab, loadPdfs]);

  // Handle Track Enrollment
  const handleEnroll = async (track: TrackCatalogItem) => {
    setEnrollingTrackId(track.id);
    try {
      const success = await learningHubService.enrollTrack(track.id);
      if (success) {
        toast.success(`Enrolled in: ${track.title}`);
        // Optimistically update enrolled status in list
        setTracks((prev) =>
          prev.map((t) => (t.id === track.id ? { ...t, enrolled: true } : t))
        );
        // Refresh stats
        const updatedStats = await learningHubService.getUserStats();
        setStats(updatedStats);
      } else {
        toast.error('Enrollment failed. Please try again.');
      }
    } catch {
      toast.error('Failed to enroll in track');
    } finally {
      setEnrollingTrackId(null);
    }
  };

  const handleOpenSyllabus = (track: TrackCatalogItem) => {
    setSelectedTrack(track);
    setIsSyllabusOpen(true);
  };

  const handleResourceToggle = async () => {
    // Refresh stats and catalog to reflect newly checked lessons
    const updatedStats = await learningHubService.getUserStats();
    setStats(updatedStats);
    const catalogRes = await learningHubService.getCatalog({
      category: activeCategory,
      difficulty: difficulty !== 'all' ? difficulty : undefined,
      search: searchQuery.trim() || undefined,
    });
    setTracks(catalogRes.tracks || []);
  };

  const handleResetFilters = () => {
    setActiveCategory('All');
    setDifficulty('all');
    setSearchQuery('');
  };

  // PDF Vault Handlers (Phase 2)
  const handlePreviewPdf = (pdf: PdfDocumentItem) => {
    setSelectedPdfForPreview(pdf);
    setIsPdfPreviewOpen(true);
  };

  const handleConvertToQuiz = async (pdf: PdfDocumentItem) => {
    setIsConvertingPdfId(pdf.id);
    setIsConvertingQuiz(true);
    setIsQuizConverterOpen(true);
    setSelectedQuizResult(null);

    try {
      const result = await learningHubService.convertPdfToQuiz(pdf.id);
      if (result && result.questions && result.questions.length > 0) {
        setSelectedQuizResult(result);
        toast.success(`Extracted ${result.questionsCount} questions from ${pdf.title}`);
        // Reload PDFs to reflect extracted quiz badge
        loadPdfs();
      } else {
        toast.error('Failed to extract questions from PDF');
        setIsQuizConverterOpen(false);
      }
    } catch (err) {
      console.error('Quiz conversion error:', err);
      toast.error('AI Quiz conversion failed');
      setIsQuizConverterOpen(false);
    } finally {
      setIsConvertingPdfId(null);
      setIsConvertingQuiz(false);
    }
  };

  const handleResetPdfFilters = () => {
    setPdfCategory('All');
    setPdfSearchQuery('');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-12">
        {/* Hero & Progress Header */}
        <LearningHubHeader
          stats={stats}
          onExploreClick={() => setActiveTab('tracks')}
        />

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-8 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('tracks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'tracks'
                ? 'bg-[#3D5AFE] text-white shadow-md shadow-[#3D5AFE]/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Learning Tracks & Catalog</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-semibold">
              {tracks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pdf_vault')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'pdf_vault'
                ? 'bg-[#3D5AFE] text-white shadow-md shadow-[#3D5AFE]/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>PDF Question Bank</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                activeTab === 'pdf_vault'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {pdfs.length > 0 ? `${pdfs.length} Guides` : 'Live'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'practice'
                ? 'bg-[#3D5AFE] text-white shadow-md shadow-[#3D5AFE]/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Practice & Quiz Blitz</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/30">
              Phase 3 Preview
            </span>
          </button>
        </div>

        {/* Tab 1: Tracks Catalog */}
        {activeTab === 'tracks' && (
          <div>
            {/* Skill Gap Personalized Recommendation Banner */}
            <SkillGapRecommendationBanner
              targetRole={recommendations.targetRole}
              missingSkillsCovered={recommendations.missingSkillsCovered}
              recommendedTracks={recommendations.recommendedTracks}
              onSelectTrack={handleOpenSyllabus}
            />

            {/* Filter Bar */}
            <TrackFilterBar
              categories={categories.length > 0 ? categories : ['All', 'Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'System Design', 'AI/ML']}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              difficulty={difficulty}
              onSelectDifficulty={setDifficulty}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onReset={handleResetFilters}
            />

            {/* Tracks Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-800"
                  />
                ))}
              </div>
            ) : tracks.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title="No learning tracks found"
                  description="Try adjusting your category pills, difficulty level, or search keyword."
                  actionLabel="Clear Filters"
                  onAction={handleResetFilters}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    onViewSyllabus={handleOpenSyllabus}
                    onEnroll={handleEnroll}
                    enrolling={enrollingTrackId === track.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: PDF Vault (Hydrated Phase 2) */}
        {activeTab === 'pdf_vault' && (
          <div className="space-y-6">
            {/* Header & Filter Controls Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D5AFE]/10 text-[#3D5AFE] uppercase tracking-wider">
                      Technical PDF Vault
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Zero-Disk Streaming & Gemini Extraction
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Curated Technical Interview Cheat-Sheets
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    High-signal engineering PDFs indexed with instant in-browser readers and 1-click AI practice quizzes.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search guides, cheat-sheets, skills..."
                    value={pdfSearchQuery}
                    onChange={(e) => setPdfSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#3D5AFE] transition-colors placeholder:text-slate-400"
                  />
                  {pdfSearchQuery && (
                    <button
                      onClick={() => setPdfSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2 border-t border-slate-100 dark:border-slate-800/80">
                {['All', 'Frontend', 'Backend', 'Database', 'DevOps', 'System Design'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPdfCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      pdfCategory === cat
                        ? 'bg-[#3D5AFE] text-white shadow-sm shadow-[#3D5AFE]/25'
                        : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* PDF Cards Grid */}
            {loadingPdfs ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 mx-auto border-2 border-[#3D5AFE] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500">Loading indexed technical cheat-sheets...</p>
              </div>
            ) : pdfs.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-7 h-7 text-slate-400" />}
                title="No technical guides match your filters"
                description="Try refining your search terms or selecting 'All' categories."
                actionLabel="Clear Filters"
                onAction={handleResetPdfFilters}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pdfs.map((pdf) => (
                  <PdfCard
                    key={pdf.id}
                    pdf={pdf}
                    onPreview={handlePreviewPdf}
                    onConvertToQuiz={handleConvertToQuiz}
                    isConverting={isConvertingPdfId === pdf.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Practice Arena (Phase 3 Preview) */}
        {activeTab === 'practice' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
              <Zap className="w-7 h-7" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-3 inline-block">
              Scheduled for Phase 3 Implementation
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Practice Drills & AI Quiz Arena
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Rapid-fire, 5-question code blitzes mapped to your missing skills with real-time syntax-highlighted
              code evaluations and Gemini-powered explanations for every answer.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  ⏱️ Timed Question Stepper
                </div>
                <div className="text-[11px] text-slate-400">
                  Real interview pressure drills with instantaneous answer rationale.
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  🛡️ Verification Bridge
                </div>
                <div className="text-[11px] text-slate-400">
                  Scoring ≥70% mints cryptographic SHA-256 certificate hashes into your profile.
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('tracks')}
              className="py-2.5 px-5 rounded-xl text-xs font-semibold bg-[#3D5AFE] text-white hover:bg-[#324bdf] transition-colors inline-flex items-center gap-1.5"
            >
              <span>Explore Active Phase 1 Tracks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Track Syllabus Modal */}
        <TrackSyllabusModal
          track={selectedTrack}
          isOpen={isSyllabusOpen}
          onClose={() => {
            setIsSyllabusOpen(false);
            setSelectedTrack(null);
          }}
          onResourceToggle={handleResourceToggle}
        />

        {/* PDF Preview Modal */}
        <PdfPreviewModal
          pdf={selectedPdfForPreview}
          isOpen={isPdfPreviewOpen}
          onClose={() => {
            setIsPdfPreviewOpen(false);
            setSelectedPdfForPreview(null);
          }}
          onConvertToQuiz={handleConvertToQuiz}
          isConverting={isConvertingPdfId === selectedPdfForPreview?.id}
        />

        {/* PDF AI Quiz Converter Modal */}
        <PdfQuizConverterModal
          quiz={selectedQuizResult}
          isOpen={isQuizConverterOpen}
          isLoading={isConvertingQuiz}
          onClose={() => {
            setIsQuizConverterOpen(false);
            setSelectedQuizResult(null);
          }}
          onStartPractice={() => {
            setIsQuizConverterOpen(false);
            setActiveTab('practice');
          }}
        />
      </div>

    </DashboardLayout>
  );
}
