import { Request, Response } from "express";
import { CompanyMemberService } from "./company-member.service";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class CompanyMemberController {
  private readonly companyMemberService: CompanyMemberService;

  constructor(companyMemberService?: CompanyMemberService) {
    this.companyMemberService =
      companyMemberService || new CompanyMemberService();
  }

  getMyMemberships = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const memberships = await this.companyMemberService.getMyMemberships(userId);
    res.status(HTTP_STATUS.OK).json(successResponse(memberships));
  };

  getCompanyMembers = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const companyId = req.params.companyId as string;
    const members = await this.companyMemberService.getCompanyMembers(
      userId,
      companyId
    );
    res.status(HTTP_STATUS.OK).json(successResponse(members));
  };

  getCompanyMemberById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.id;
    const companyId = req.params.companyId as string;
    const memberId = req.params.memberId as string;
    const member = await this.companyMemberService.getCompanyMemberById(
      userId,
      companyId,
      memberId
    );
    res.status(HTTP_STATUS.OK).json(successResponse(member));
  };

  addMember = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const companyId = req.params.companyId as string;
    const member = await this.companyMemberService.addMember(
      userId,
      companyId,
      req.body
    );
    res.status(HTTP_STATUS.CREATED).json(successResponse(member));
  };

  updateMemberRole = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const companyId = req.params.companyId as string;
    const memberId = req.params.memberId as string;
    const member = await this.companyMemberService.updateMemberRole(
      userId,
      companyId,
      memberId,
      req.body
    );
    res.status(HTTP_STATUS.OK).json(successResponse(member));
  };

  updateMemberStatus = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const companyId = req.params.companyId as string;
    const memberId = req.params.memberId as string;
    const member = await this.companyMemberService.updateMemberStatus(
      userId,
      companyId,
      memberId,
      req.body
    );
    res.status(HTTP_STATUS.OK).json(successResponse(member));
  };

  removeMember = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const companyId = req.params.companyId as string;
    const memberId = req.params.memberId as string;
    const result = await this.companyMemberService.removeMember(
      userId,
      companyId,
      memberId
    );
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  };
}
