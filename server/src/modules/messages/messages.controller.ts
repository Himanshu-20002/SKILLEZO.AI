import { Request, Response } from "express";
import { messagesService } from "./messages.service";
import {
  sendMessageValidator,
  scheduleInterviewValidator,
  sendOfferValidator,
  respondOfferValidator,
  getConversationsQueryValidator,
  getMessagesQueryValidator,
} from "./messages.dto";
import { HTTP_STATUS } from "@/core/constants";

export class MessagesController {
  static async getConversations(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const query = getConversationsQueryValidator.parse(req.query);

    const result = await messagesService.getUserConversations(userId, query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  }

  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const result = await messagesService.getUnreadCount(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  }

  static async getConversationMessages(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const conversationId = String(req.params.id);
    const query = getMessagesQueryValidator.parse(req.query);

    const result = await messagesService.getConversationMessages(conversationId, userId, query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  }

  static async sendMessage(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const conversationId = String(req.params.id);
    const body = sendMessageValidator.parse(req.body);

    const result = await messagesService.sendMessage(conversationId, userId, body);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: result,
    });
  }

  static async scheduleInterview(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const applicationId = String(req.params.id);
    const body = scheduleInterviewValidator.parse(req.body);

    const result = await messagesService.scheduleInterview(applicationId, userId, body);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Interview scheduled successfully",
      data: result,
    });
  }

  static async sendOffer(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const applicationId = String(req.params.id);
    const body = sendOfferValidator.parse(req.body);

    const result = await messagesService.sendOffer(applicationId, userId, body);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Job offer extended successfully",
      data: result,
    });
  }

  static async respondOffer(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const applicationId = String(req.params.id);
    const body = respondOfferValidator.parse(req.body);

    const result = await messagesService.respondOffer(applicationId, userId, body);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: body.action === "accept" ? "Job offer accepted successfully" : "Job offer declined",
      data: result,
    });
  }
}
