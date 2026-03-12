import { z } from 'zod';
import { companyContextSchema, aiOutputSchema, architectures } from './schema';

export const api = {
  architecture: {
    generate: {
      method: 'POST' as const,
      path: '/api/generate' as const,
      input: companyContextSchema,
      responses: {
        200: aiOutputSchema, 
        400: z.object({ message: z.string() }),
        500: z.object({ message: z.string() }),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/architectures' as const,
      responses: {
        200: z.array(z.custom<typeof architectures.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/architectures/:id' as const,
      responses: {
        200: z.custom<typeof architectures.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    }
  },
};

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};
