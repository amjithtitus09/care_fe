import axios from 'axios';

export const updateSpecimenDefinitionAPI = async (data: { slug: string; name: string }) => {
  try {
    const response = await axios.put(`/api/specimen-definitions/${data.slug}`, data);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update specimen definition');
    }
    throw new Error('Network error');
  }
};
