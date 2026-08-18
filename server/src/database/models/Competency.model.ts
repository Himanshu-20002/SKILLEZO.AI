import { Schema, model, Document, Types } from "mongoose";
import { CompetencyImportance } from "@/core/constants/enums";

export interface ICompetency extends Document {
  _id: Types.ObjectId;
  roleId: Types.ObjectId;
  skillName: string;
  requiredLevel: number;
  importance: CompetencyImportance;
  createdAt: Date;
  updatedAt: Date;
}

const competencySchema = new Schema<ICompetency>(
  {
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      index: true,
    },
    skillName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    requiredLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    importance: {
      type: String,
      enum: Object.values(CompetencyImportance),
      required: true,
      default: CompetencyImportance.MEDIUM,
    },
  },
  {
    timestamps: true,
    collection: "competencies",
  }
);

competencySchema.index({ roleId: 1, skillName: 1 }, { unique: true });

export const CompetencyModel = model<ICompetency>("Competency", competencySchema);
