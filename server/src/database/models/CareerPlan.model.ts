import { Schema, model, Document, Types } from "mongoose";
import { CareerPlanStatus, CompetencyImportance, GapPriority } from "@/core/constants/enums";

export interface IMatchedSkill {
  skillName: string;
  candidateLevel: number;
  requiredLevel: number;
  importance: CompetencyImportance;
}

export interface IMissingSkill {
  skillName: string;
  requiredLevel: number;
  importance: CompetencyImportance;
  priority: GapPriority;
}

export interface IImprovementSkill {
  skillName: string;
  candidateLevel: number;
  requiredLevel: number;
  gap: number;
  importance: CompetencyImportance;
  priority: GapPriority;
}

export interface IStrengthSkill {
  skillName: string;
  candidateLevel: number;
  requiredLevel: number;
}

export interface IGapsSummary {
  totalRequiredSkills: number;
  matchedSkillsCount: number;
  missingSkillsCount: number;
  improvementSkillsCount: number;
}

export interface ICareerPlanGapsData {
  matchedSkills: IMatchedSkill[];
  missingSkills: IMissingSkill[];
  improvementSkills: IImprovementSkill[];
  strengths: IStrengthSkill[];
  summary: IGapsSummary;
  generatedAt?: Date;
  engineVersion?: string;
}

export interface ICareerPlan extends Document {
  _id: Types.ObjectId;
  userId: string;
  roleId: Types.ObjectId;
  sourceResumeId?: Types.ObjectId | null;
  readinessScore: number;
  gapsData: ICareerPlanGapsData;
  status: CareerPlanStatus;
  createdAt: Date;
  updatedAt: Date;
}

const matchedSkillSchema = new Schema<IMatchedSkill>(
  {
    skillName: { type: String, required: true, trim: true },
    candidateLevel: { type: Number, required: true, min: 1, max: 5 },
    requiredLevel: { type: Number, required: true, min: 1, max: 5 },
    importance: {
      type: String,
      enum: Object.values(CompetencyImportance),
      required: true,
    },
  },
  { _id: false }
);

const missingSkillSchema = new Schema<IMissingSkill>(
  {
    skillName: { type: String, required: true, trim: true },
    requiredLevel: { type: Number, required: true, min: 1, max: 5 },
    importance: {
      type: String,
      enum: Object.values(CompetencyImportance),
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(GapPriority),
      required: true,
    },
  },
  { _id: false }
);

const improvementSkillSchema = new Schema<IImprovementSkill>(
  {
    skillName: { type: String, required: true, trim: true },
    candidateLevel: { type: Number, required: true, min: 1, max: 5 },
    requiredLevel: { type: Number, required: true, min: 1, max: 5 },
    gap: { type: Number, required: true, min: 1 },
    importance: {
      type: String,
      enum: Object.values(CompetencyImportance),
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(GapPriority),
      required: true,
    },
  },
  { _id: false }
);

const strengthSkillSchema = new Schema<IStrengthSkill>(
  {
    skillName: { type: String, required: true, trim: true },
    candidateLevel: { type: Number, required: true, min: 1, max: 5 },
    requiredLevel: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false }
);

const gapsSummarySchema = new Schema<IGapsSummary>(
  {
    totalRequiredSkills: { type: Number, required: true, min: 0 },
    matchedSkillsCount: { type: Number, required: true, min: 0 },
    missingSkillsCount: { type: Number, required: true, min: 0 },
    improvementSkillsCount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const gapsDataSchema = new Schema<ICareerPlanGapsData>(
  {
    matchedSkills: [matchedSkillSchema],
    missingSkills: [missingSkillSchema],
    improvementSkills: [improvementSkillSchema],
    strengths: [strengthSkillSchema],
    summary: { type: gapsSummarySchema, required: true },
    generatedAt: { type: Date, default: Date.now },
    engineVersion: { type: String, default: "1.0", trim: true },
  },
  { _id: false }
);

const careerPlanSchema = new Schema<ICareerPlan>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      index: true,
    },
    sourceResumeId: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
    readinessScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    gapsData: { type: gapsDataSchema, required: true },
    status: {
      type: String,
      enum: Object.values(CareerPlanStatus),
      required: true,
      default: CareerPlanStatus.ACTIVE,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "career_plans",
  }
);

careerPlanSchema.index({ userId: 1, roleId: 1, createdAt: -1 });
careerPlanSchema.index({ userId: 1, status: 1 });

export const CareerPlanModel = model<ICareerPlan>("CareerPlan", careerPlanSchema);
