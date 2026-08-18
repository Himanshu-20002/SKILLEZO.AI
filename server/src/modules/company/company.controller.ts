import { Request, Response } from "express";
import { CompanyService } from "./company.service";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class CompanyController {
  private readonly companyService: CompanyService;

  constructor(companyService?: CompanyService) {
    this.companyService = companyService || new CompanyService();
  }

  createCompany = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const company = await this.companyService.createCompany(userId, req.body);
    res.status(HTTP_STATUS.CREATED).json(successResponse(company));
  };

  getCompany = async (req: Request, res: Response): Promise<void> => {
    const companyId = req.params.companyId as string;
    const company = await this.companyService.getCompany(companyId);
    res.status(HTTP_STATUS.OK).json(successResponse(company));
  };

  getMyCompanies = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const companies = await this.companyService.getMyCompanies(userId);
    res.status(HTTP_STATUS.OK).json(successResponse(companies));
  };

  updateCompany = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const companyId = req.params.companyId as string;
    const company = await this.companyService.updateCompany(userId, companyId, req.body);
    res.status(HTTP_STATUS.OK).json(successResponse(company));
  };

}
