import { Schema, model, Document, Types } from "mongoose";

export interface IMonetizationPricingTier {
  amountInRupees: number;
  amountInPaise: number;
  isActive: boolean;
  name: string;
  description: string;
}

export interface IInterviewQuotas {
  freeMonthlySessions: number;
  freeMaxQuestionsPerSession: number;
  freeMaxAnswerSeconds: number;
  lockModelAnswersForFree: boolean;
  enableVoiceForFree: boolean;
  enableVideoForFree: boolean;
}

export interface IResumeQuotas {
  freeMaxResumes: number;
  freeMonthlyAtsScans: number;
  lockDocxExportForFree: boolean;
  lockCoverLetterAiForFree: boolean;
  lockMultiJobTailoringForFree: boolean;
}

export interface IGlobalSettings {
  promoBannerActive: boolean;
  promoBannerText: string;
  updatedByAdminEmail?: string;
}

export interface IMonetizationConfig extends Document {
  _id: Types.ObjectId;
  isSingleton: boolean;
  pricing: {
    sprintPass7Day: IMonetizationPricingTier;
    proMonthly: IMonetizationPricingTier;
    proYearly: IMonetizationPricingTier;
  };
  interviewQuotas: IInterviewQuotas;
  resumeQuotas: IResumeQuotas;
  globalSettings: IGlobalSettings;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_MONETIZATION_CONFIG = {
  isSingleton: true,
  pricing: {
    sprintPass7Day: {
      amountInRupees: 199,
      amountInPaise: 19900,
      isActive: true,
      name: "7-Day Sprint Pass",
      description: "Full unlimited access for 7 days before interviews with Senior Model Answers.",
    },
    proMonthly: {
      amountInRupees: 499,
      amountInPaise: 49900,
      isActive: true,
      name: "SKILLEZO Pro Monthly",
      description: "Continuous unlimited practice, ATS keyword scoring, and priority AI latency.",
    },
    proYearly: {
      amountInRupees: 3999,
      amountInPaise: 399900,
      isActive: true,
      name: "SKILLEZO Pro Annual",
      description: "12 months access with 33% discount for ambitious career builders.",
    },
  },
  interviewQuotas: {
    freeMonthlySessions: 1,
    freeMaxQuestionsPerSession: 5,
    freeMaxAnswerSeconds: 180,
    lockModelAnswersForFree: true,
    enableVoiceForFree: true,
    enableVideoForFree: true,
  },
  resumeQuotas: {
    freeMaxResumes: 1,
    freeMonthlyAtsScans: 1,
    lockDocxExportForFree: true,
    lockCoverLetterAiForFree: true,
    lockMultiJobTailoringForFree: true,
  },
  globalSettings: {
    promoBannerActive: false,
    promoBannerText: "Placement Season Sprint: Unlock 7-Day Pro for just ₹199!",
    updatedByAdminEmail: "admin@skillezo.ai",
  },
};

const pricingTierSchema = new Schema<IMonetizationPricingTier>(
  {
    amountInRupees: { type: Number, required: true, min: 0 },
    amountInPaise: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const monetizationConfigSchema = new Schema<IMonetizationConfig>(
  {
    isSingleton: {
      type: Boolean,
      default: true,
      unique: true,
      index: true,
      required: true,
    },
    pricing: {
      sprintPass7Day: { type: pricingTierSchema, required: true },
      proMonthly: { type: pricingTierSchema, required: true },
      proYearly: { type: pricingTierSchema, required: true },
    },
    interviewQuotas: {
      freeMonthlySessions: { type: Number, default: 1, min: 0 },
      freeMaxQuestionsPerSession: { type: Number, default: 5, min: 1, max: 20 },
      freeMaxAnswerSeconds: { type: Number, default: 180, min: 30, max: 600 },
      lockModelAnswersForFree: { type: Boolean, default: true },
      enableVoiceForFree: { type: Boolean, default: true },
      enableVideoForFree: { type: Boolean, default: true },
    },
    resumeQuotas: {
      freeMaxResumes: { type: Number, default: 1, min: 0 },
      freeMonthlyAtsScans: { type: Number, default: 1, min: 0 },
      lockDocxExportForFree: { type: Boolean, default: true },
      lockCoverLetterAiForFree: { type: Boolean, default: true },
      lockMultiJobTailoringForFree: { type: Boolean, default: true },
    },
    globalSettings: {
      promoBannerActive: { type: Boolean, default: false },
      promoBannerText: { type: String, default: "Placement Season Sprint: Unlock 7-Day Pro for just ₹199!" },
      updatedByAdminEmail: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

export const MonetizationConfigModel = model<IMonetizationConfig>(
  "MonetizationConfig",
  monetizationConfigSchema
);

// In-Memory Cache for fast reading without DB bottleneck
let cachedConfig: IMonetizationConfig | null = null;
let cacheExpiryTime: number = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function invalidateMonetizationCache(): void {
  cachedConfig = null;
  cacheExpiryTime = 0;
}

export async function getMonetizationConfig(): Promise<IMonetizationConfig> {
  const now = Date.now();
  if (cachedConfig && now < cacheExpiryTime) {
    return cachedConfig;
  }

  try {
    let doc = await MonetizationConfigModel.findOne({ isSingleton: true });
    if (!doc) {
      try {
        doc = await MonetizationConfigModel.create({
          ...DEFAULT_MONETIZATION_CONFIG,
          isSingleton: true,
        });
      } catch (err: any) {
        if (err.code === 11000) {
          doc = await MonetizationConfigModel.findOne({ isSingleton: true });
        } else {
          throw err;
        }
      }
    }

    if (doc) {
      cachedConfig = doc;
      cacheExpiryTime = now + CACHE_TTL_MS;
      return doc;
    }
  } catch (error) {
    console.warn(
      "[MonetizationConfig] Database access fallback, using default configuration:",
      error
    );
  }

  // Safe fallback if database isn't reachable
  return DEFAULT_MONETIZATION_CONFIG as unknown as IMonetizationConfig;
}
