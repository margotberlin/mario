import { z } from 'zod';
import { pingResponseSchema } from './schema';

export const errorSchemas = {
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  health: {
    ping: {
      method: 'GET' as const,
      path: '/api/ping' as const,
      responses: {
        200: pingResponseSchema,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
