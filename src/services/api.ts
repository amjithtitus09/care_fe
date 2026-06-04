import { validateSlug } from '../utils/validation';

export const updateSpecimenDefinitionAPI = async (data: { name: string; slug: string }) => {
  if (!validateSlug(data.slug)) {
    return { ok: false, error: 'Invalid slug format' };
  }

  try {
    const response = await fetch('/api/specimen-definition', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update specimen definition');
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};