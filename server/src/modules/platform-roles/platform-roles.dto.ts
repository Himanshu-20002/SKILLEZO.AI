import { z } from "zod";

export const CreatePlatformRoleSchema = z.object({
  name: z.string().min(2, "Role name is required"),
  slug: z.string().min(2).optional(),
  category: z.string().min(2).default("Engineering"),
  description: z.string().optional().default(""),
  defaultSkills: z.array(z.string()).default([]),
  icon: z.string().default("Briefcase"),
  order: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const UpdatePlatformRoleSchema = CreatePlatformRoleSchema.partial();

export type CreatePlatformRoleDTO = z.infer<typeof CreatePlatformRoleSchema>;
export type UpdatePlatformRoleDTO = z.infer<typeof UpdatePlatformRoleSchema>;

