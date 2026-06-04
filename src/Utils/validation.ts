import { z } from 'zod';

export const validateSlug = (slug: string): boolean => {
  const slugSchema = z.string().regex(/^[a-zA-Z0-9-]+$/, 'Slug must be alphanumeric and can include hyphens.');
  return slugSchema.safeParse(slug).success;
};