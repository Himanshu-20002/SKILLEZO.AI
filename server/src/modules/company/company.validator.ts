import { z } from "zod";
import { objectIdSchema } from "@/core/validators/common.validators";
import { CompanySize } from "@/core/constants/enums";

export const companyLocationSchema = z.object({
  city: z.string().trim().nullable().optional(),
  state: z.string().trim().nullable().optional(),
  country: z.string().trim().nullable().optional(),
});

export const createCompanyValidator = z.object({
  name: z.string().trim().min(1, "Company name is required").max(150, "Company name cannot exceed 150 characters"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug cannot exceed 100 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase alphanumeric characters and hyphens")
    .optional(),
  description: z.string().trim().max(3000, "Description cannot exceed 3000 characters").nullable().optional(),
  industry: z.string().trim().max(100, "Industry cannot exceed 100 characters").nullable().optional(),
  website: z.string().trim().url("Invalid website URL").nullable().optional().or(z.literal("")),
  logoUrl: z.string().trim().url("Invalid logo URL").nullable().optional().or(z.literal("")),
  location: companyLocationSchema.nullable().optional(),
  companySize: z.nativeEnum(CompanySize).nullable().optional(),
});



export const updateCompanyValidator = createCompanyValidator
  .omit({ slug: true })
  .partial();

export const companyIdParamsSchema = z.object({
  companyId: objectIdSchema,
});
