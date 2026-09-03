export interface UploadResumeDTO {
  title?: string;
  isDefault?: boolean;
}

export interface UpdateResumeDTO {
  title?: string;
  isDefault?: boolean;
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
  atsCompatibility: any[];
  keywords: any[];
  missingKeywords: any[];
  recommendations: any[];
}
