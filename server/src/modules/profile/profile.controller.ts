import { Request, Response } from "express";
import { ProfileService } from "./profile.service";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class ProfileController {
  private readonly profileService: ProfileService;

  constructor(profileService?: ProfileService) {
    this.profileService = profileService || new ProfileService();
  }

  createProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const profile = await this.profileService.createProfile(userId, req.body);
    res.status(HTTP_STATUS.CREATED).json(successResponse(profile));
  };

  getMyProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const profile = await this.profileService.getMyProfile(userId);
    res.status(HTTP_STATUS.OK).json(successResponse(profile));
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const profile = await this.profileService.updateProfile(userId, req.body);
    res.status(HTTP_STATUS.OK).json(successResponse(profile));
  };

  updateSkills = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const profile = await this.profileService.updateSkills(userId, req.body);
    res.status(HTTP_STATUS.OK).json(successResponse(profile));
  };

  updateEducation = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const profile = await this.profileService.updateEducation(userId, req.body);
    res.status(HTTP_STATUS.OK).json(successResponse(profile));
  };

  updateExperience = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const profile = await this.profileService.updateExperience(userId, req.body);
    res.status(HTTP_STATUS.OK).json(successResponse(profile));
  };

  updateLinks = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const profile = await this.profileService.updateLinks(userId, req.body);
    res.status(HTTP_STATUS.OK).json(successResponse(profile));
  };

  updateTargetRole = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const profile = await this.profileService.updateTargetRole(userId, req.body);
    res.status(HTTP_STATUS.OK).json(successResponse(profile));
  };
}
