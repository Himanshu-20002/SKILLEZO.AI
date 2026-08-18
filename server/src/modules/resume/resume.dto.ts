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
