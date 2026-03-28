import { z } from "zod";

export const pingResponseSchema = z.object({
  message: z.string()
});
