'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Trash2,
  Eye,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Clock,
  BookOpen,
  ArrowRight,
  Shield,
  HelpCircle,
  Check,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { learningHubService } from '@/services/learning-hub.service';
import { PdfDocumentItem, ConvertedQuizResult } from '@/types/learning-hub';
import { PdfPreviewModal } from '../pdf-vault/PdfPreviewModal';
import { PdfQuizConverterModal } from '../pdf-vault/PdfQuizConverterModal';

const CATEGORIES = [
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'System Design',
  'Mobile',
  'AI & Data',
  'General',
];

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

export const AdminPdfUploadPanel: React.FC = () => {
  // Vault state
  const [pdfs, setPdfs] = useState<PdfDocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Frontend');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [skillsInput, setSkillsInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>('');

  // Modals state
  const [previewPdf, setPreviewPdf] = useState<PdfDocumentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [quizPdf, setQuizPdf] = useState<PdfDocumentItem | null>(null);
  const [quizResult, setQuizResult] = useState<ConvertedQuizResult | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load PDFs from database
  const loadVaultPdfs = async () => {
    setLoading(true);
    try {
      const data = await learningHubService.listPdfs();
      setPdfs(data);
    } catch (err: any) {
      toast.error('Failed to load PDF documents from vault');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVaultPdfs();
  }, []);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF documents are supported (.pdf)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('PDF file exceeds the 15MB size limit');
      return;
    }

    setSelectedFile(file);

    // Auto-populate Title if empty
    if (!title.trim()) {
      const cleanName = file.name
        .replace(/\.pdf$/i, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setTitle(cleanName);
    }
  };

  // Clear selected file
  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select or drag a PDF file to upload');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a document title');
      return;
    }

    setIsUploading(true);
    setUploadStep('Reading and transmitting binary payload...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('difficulty', difficulty);

      const skills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (skills.length > 0) {
        skills.forEach((skill) => formData.append('skills', skill));
      } else {
        formData.append('skills', category);
      }

      setUploadStep('Parsing text & running Gemini question extraction...');

      const result = await learningHubService.uploadAdminPdf(formData);

      toast.success(
        `Successfully ingested "${title}". Extracted ${result?.questionsCount || 0} questions!`
      );

      // Reset form
      handleClearFile();
      setTitle('');
      setSkillsInput('');
      setCategory('Frontend');
      setDifficulty('intermediate');

      // Refresh table
      loadVaultPdfs();
    } catch (err: any) {
      console.error('PDF upload error:', err);
      toast.error(err.message || 'Failed to upload and index PDF document');
    } finally {
      setIsUploading(false);
      setUploadStep('');
    }
  };

  // Handle Delete
  const handleDeletePdf = async (id: string, pdfTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${pdfTitle}" from the Learning Vault?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await learningHubService.deleteAdminPdf(id);
      toast.success(`Removed "${pdfTitle}" from the vault`);
      setPdfs((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete PDF');
    } finally {
      setDeletingId(null);
    }
  };

  // Convert or view quiz
  const handleConvertToQuiz = async (pdf: PdfDocumentItem) => {
    setQuizPdf(pdf);
    setIsConverting(true);
    setIsQuizModalOpen(true);
    setQuizResult(null);

    try {
      const result = await learningHubService.convertPdfToQuiz(pdf.id);
      if (result && result.questions && result.questions.length > 0) {
        setQuizResult(result);
        toast.success(`Generated ${result.questionsCount} questions from ${pdf.title}`);
        loadVaultPdfs();
      } else {
        toast.error('No questions could be extracted from this document');
        setIsQuizModalOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'AI Quiz conversion failed');
      setIsQuizModalOpen(false);
    } finally {
      setIsConverting(false);
    }
  };

  // Filtered PDFs
  const filteredPdfs = pdfs.filter((pdf) => {
    const matchesSearch =
      pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdf.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      categoryFilter === 'All' || pdf.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const totalQuestionsExtracted = pdfs.reduce(
    (acc, p) => acc + (p.questionsCount || 0),
    0
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Telemetry / Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1130] border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Ingested Guides
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {pdfs.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Available in Candidate Vault
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1130] border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              AI Question Bank
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalQuestionsExtracted}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Gemini structured MCQs extracted
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1130] border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Domains
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {new Set(pdfs.map((p) => p.category)).size || 0}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Technical subject tracks covered
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1130] border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Ingestion Engine
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase">
              Gemini + pdf-parse
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            A4 Compilation & In-Memory Parsing
          </div>
        </div>
      </div>

      {/* Main Upload Card */}
      <div className="bg-white dark:bg-[#0B1130] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-[#3D5AFE]" />
              Ingest Engineering Guides & Cheat-Sheets
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Upload technical PDFs to automatically extract multiple-choice question banks and expand the Learning Vault.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 self-start sm:self-auto">
            Max 15MB • PDF Only
          </span>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-6">
          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-[#3D5AFE] bg-[#3D5AFE]/5 scale-[0.99]'
                : selectedFile
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-300 dark:border-slate-700 hover:border-[#3D5AFE] dark:hover:border-[#3D5AFE]/70 bg-slate-50/50 dark:bg-slate-900/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="application/pdf"
              className="hidden"
            />

            {!selectedFile ? (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#3D5AFE]/10 text-[#3D5AFE] mx-auto flex items-center justify-center shadow-inner">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Click to browse or drag and drop your technical PDF here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    System Architecture docs, Interview Cheat-sheets, React/Go/Python manuals
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-emerald-500/30 text-left max-w-lg mx-auto shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI Ingestion
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFile();
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Metadata Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Title */}
            <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Document Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Modern React 19 Architecture Guide"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#3D5AFE] text-slate-900 dark:text-white font-medium"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Subject Domain
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#3D5AFE] text-slate-900 dark:text-white font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg capitalize transition-all ${
                      difficulty === d
                        ? 'bg-[#3D5AFE] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills / Tags */}
            <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#3D5AFE]" />
                Target Skills (Comma Separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g. React 19, Server Components, Hydration, Optimistic UI"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#3D5AFE] text-slate-900 dark:text-white"
              />
              <p className="text-[10px] text-slate-400">
                These skills will automatically link to Candidate Skill Gap recommendations.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Gemini AI will automatically parse the PDF and extract 5 to 10 exam-grade MCQs.
              </span>
            </div>

            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-[#3D5AFE]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{uploadStep || 'Processing Ingestion...'}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload & Index Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Vault Inventory Table */}
      <div className="space-y-4">
        {/* Table Filters & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0B1130] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Vault Inventory ({filteredPdfs.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search title or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#3D5AFE]"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Refresh */}
            <button
              onClick={loadVaultPdfs}
              disabled={loading}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              title="Refresh inventory"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white dark:bg-[#0B1130] rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#3D5AFE] mx-auto" />
              <p className="text-xs text-slate-500">Loading Vault documents...</p>
            </div>
          ) : filteredPdfs.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No PDF documents match your search
              </p>
              <p className="text-[11px] text-slate-400">
                Upload a new PDF guide above or clear search filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Document Details</th>
                    <th className="px-4 py-3.5">Category & Level</th>
                    <th className="px-4 py-3.5">Pages & Time</th>
                    <th className="px-4 py-3.5">AI Question Bank</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredPdfs.map((pdf) => (
                    <tr
                      key={pdf.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Document Details */}
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#3D5AFE]/10 text-[#3D5AFE] flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {pdf.title}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {pdf.skills.slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                >
                                  {skill}
                                </span>
                              ))}
                              {pdf.skills.length > 3 && (
                                <span className="text-[9px] text-slate-400 font-medium">
                                  +{pdf.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Level */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3D5AFE]/10 text-[#3D5AFE]">
                            {pdf.category}
                          </span>
                          <p className="text-[10px] text-slate-400 capitalize">
                            {pdf.difficulty}
                          </p>
                        </div>
                      </td>

                      {/* Pages & Time */}
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          <span>{pdf.pdfPageCount} pgs</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{pdf.estimatedMinutes} mins</span>
                        </div>
                      </td>

                      {/* AI Question Bank */}
                      <td className="px-4 py-4">
                        {pdf.hasExtractedQuiz || (pdf.questionsCount && pdf.questionsCount > 0) ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            <Sparkles className="w-3 h-3 text-emerald-500" />
                            <span>{pdf.questionsCount || 10} MCQs Live</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleConvertToQuiz(pdf)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-purple-500" />
                            <span>Extract Quiz Now</span>
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Modal Button */}
                          <button
                            onClick={() => {
                              setPreviewPdf(pdf);
                              setIsPreviewOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Preview Guide"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Direct PDF Download */}
                          <a
                            href={`/api/learning-hub/vault/pdfs/${encodeURIComponent(pdf.id)}/preview?download=true`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>

                          {/* Delete Document */}
                          <button
                            onClick={() => handleDeletePdf(pdf.id, pdf.title)}
                            disabled={deletingId === pdf.id}
                            className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            title="Delete PDF"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reusable PDF Preview Modal */}
      <PdfPreviewModal
        pdf={previewPdf}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewPdf(null);
        }}
        onConvertToQuiz={(pdf) => {
          setIsPreviewOpen(false);
          handleConvertToQuiz(pdf);
        }}
        isConverting={isConverting}
      />

      {/* Reusable PDF Quiz Converter Modal */}
      <PdfQuizConverterModal
        isOpen={isQuizModalOpen}
        isLoading={isConverting}
        quiz={quizResult}
        onClose={() => {
          setIsQuizModalOpen(false);
          setQuizPdf(null);
          setQuizResult(null);
        }}
      />
    </div>
  );
};
