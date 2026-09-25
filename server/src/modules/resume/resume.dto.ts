export interface UploadResumeDTO {
  title?: string;
  isDefault?: boolean;
}

export interface CreateVariantDTO {
  displayName: string;
  targetJobTitle?: string | null;
  targetCompany?: string | null;
  targetJobId?: string | null;
}

export interface UpdateResumeDTO {
  title?: string;
  displayName?: string;
  isDefault?: boolean;
  targetJobTitle?: string | null;
  targetCompany?: string | null;
}

export interface ResumePortfolioItemDTO {
  id: string;
  displayName: string;
  variantType: "MASTER" | "TAILORED";
  targetJobTitle?: string | null;
  targetCompany?: string | null;
  parentResumeId?: string | null;
  updatedAt: string;
  createdAt: string;
  sourceProfileVersion?: number | null;
  isMasterStale?: boolean;
  isDefault: boolean;
  isUploaded?: boolean;
}

export interface ResumePortfolioResponseDTO {
  master: ResumePortfolioItemDTO;
  variants: ResumePortfolioItemDTO[];
}

export interface ResumeResponseDTO {
  _id: string;
  userId: string;
  title: string;
  originalFileName: string;
  fileName: string;
  storageKey: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  isDefault: boolean;
  status: string;
  version: number;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeAtsResponseDTO {
  resumeId: string;
  resumeVersion: number;
  fileName: string;
  overallScore: number;
  atsScore: number;
  matchScore?: number;
  contentScore?: number;
  impactScore: number;
  brevityScore: number;
  level: string;
  breakdown: {
    keywordMatch: number;
    structure: number;
    brevity: number;
    impact: number;
    readability: number;
  };
  categories: Record<string, any>;
  auditPillars?: any;
  atsCompatibility: any[];
  keywords: any[];
  missingKeywords: any[];
  missingSkills?: any[];
  recommendations: any[];
  topAction?: any;
  recommendationSummary?: any;
  contentResult?: any;
  skillsProfile?: any;
  roleProfile?: any;
}
