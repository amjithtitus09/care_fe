import axios from 'axios';

export const updateSpecimenDefinitionAPI = async (data: { name: string; slug: string }) => {
  try {
    const response = await axios.put('/api/specimen-definition', data);
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('An unexpected error occurred');
  }
};