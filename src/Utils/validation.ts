import { z } from 'zod';

export const slugSchema = z.string().regex(/^[a-zA-Z0-9-]+$/, 'Slug must be alphanumeric and can include hyphens.');

export const validateSlug = (slug: string): boolean => {
  return slugSchema.safeParse(slug).success;
};
