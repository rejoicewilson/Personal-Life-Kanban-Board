import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120, 'Title is too long'),
  description: z.string().trim().max(500, 'Description is too long').optional().or(z.literal('')),
  status: z.enum(['backlog', 'this_week', 'today', 'in_progress', 'done']),
  category: z.enum(['health', 'career', 'learning', 'finance', 'family', 'spiritual', 'personal']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional().or(z.literal('')),
})

export type TaskFormValues = z.infer<typeof taskSchema>
