import { z } from "zod";

export const CreateTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().optional(),
  projectId: z.string().cuid("Invalid Project ID"),
  assigneeId: z.string().cuid().optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).default("TODO"),
  order: z.number().nonnegative(),
  dueDate: z.coerce.date().optional()
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  id: z.string().cuid("Invalid Task ID").optional()
});
