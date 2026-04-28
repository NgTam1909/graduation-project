import { z } from "zod";
import { ProjectRole } from "@/models/project.model";

export const updateMemberRoleSchema = z.object({
    memberId: z.string().min(1, "Thiếu memberId"),
    role: z.nativeEnum(ProjectRole),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
