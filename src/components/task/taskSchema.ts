import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120, 'Title is too long'),
  status: z.enum(['backlog', 'today', 'in_progress', 'done']),
  category: z.enum(['health', 'career', 'learning', 'personal']),
  priority: z.enum(['low', 'medium', 'high']),
})

export type TaskFormValues = z.infer<typeof taskSchema>
