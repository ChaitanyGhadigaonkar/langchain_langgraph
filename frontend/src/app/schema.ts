import z from "zod";

export const sendMessageSchema = z.object({
  message: z.string().trim().min(1),
});

export type SendMessageFormData = z.infer<typeof sendMessageSchema>;
