import { Schema, model, Document, Types } from "mongoose";

export interface IConversationLastMessage {
  content: string;
  senderId: string;
  senderRole: "recruiter" | "candidate" | "system";
  sentAt: Date;
}

export interface IConversation extends Document {
  _id: Types.ObjectId;
  applicationId: Types.ObjectId;
  jobId: Types.ObjectId;
  companyId: Types.ObjectId;
  candidateId: string;
  recruiterId: string;
  lastMessage?: IConversationLastMessage | null;
  unreadCountCandidate: number;
  unreadCountRecruiter: number;
  status: "active" | "archived" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const lastMessageSchema = new Schema<IConversationLastMessage>(
  {
    content: { type: String, required: true },
    senderId: { type: String, required: true },
    senderRole: {
      type: String,
      enum: ["recruiter", "candidate", "system"],
      required: true,
    },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversationSchema = new Schema<IConversation>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    candidateId: {
      type: String,
      required: true,
      index: true,
    },
    recruiterId: {
      type: String,
      required: true,
      index: true,
    },
    lastMessage: {
      type: lastMessageSchema,
      default: null,
    },
    unreadCountCandidate: {
      type: Number,
      default: 0,
      min: 0,
    },
    unreadCountRecruiter: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "archived", "closed"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ candidateId: 1, updatedAt: -1 });
conversationSchema.index({ companyId: 1, updatedAt: -1 });
conversationSchema.index({ recruiterId: 1, updatedAt: -1 });

export const ConversationModel = model<IConversation>(
  "Conversation",
  conversationSchema
);
