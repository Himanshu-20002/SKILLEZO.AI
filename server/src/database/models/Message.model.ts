import { Schema, model, Document, Types } from "mongoose";

export type MessageType = "text" | "interview_invite" | "offer_letter" | "status_change" | "system";

export interface IInterviewDetails {
  roundTitle: string;
  scheduledAt: Date;
  durationMinutes: number;
  timezone?: string;
  meetingPlatform: "google_meet" | "zoom" | "teams" | "phone" | "other";
  meetingLink: string;
  interviewerName: string;
  instructions?: string;
  status: "scheduled" | "completed" | "rescheduled" | "cancelled";
}

import { IOfferDetails } from "./Application.model";

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: string;
  senderRole: "recruiter" | "candidate" | "system";
  type: MessageType;
  content: string;
  interviewDetails?: IInterviewDetails | null;
  offerDetails?: IOfferDetails | null;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const interviewDetailsSchema = new Schema<IInterviewDetails>(
  {
    roundTitle: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 45 },
    timezone: { type: String, default: "Asia/Kolkata (IST)" },
    meetingPlatform: {
      type: String,
      enum: ["google_meet", "zoom", "teams", "phone", "other"],
      default: "google_meet",
    },
    meetingLink: { type: String, required: true, trim: true },
    interviewerName: { type: String, required: true, trim: true },
    instructions: { type: String, trim: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "rescheduled", "cancelled"],
      default: "scheduled",
    },
  },
  { _id: false }
);

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["recruiter", "candidate", "system"],
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "interview_invite", "offer_letter", "status_change", "system"],
      default: "text",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    interviewDetails: {
      type: interviewDetailsSchema,
      default: null,
    },
    offerDetails: {
      type: Schema.Types.Mixed,
      default: null,
    },
    readBy: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const MessageModel = model<IMessage>("Message", messageSchema);
