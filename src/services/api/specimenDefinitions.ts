// Updated API service to support slug updates
import axios from 'axios';
import { SpecimenDefinition } from '../../types';

export const updateSpecimenDefinition = async (
  id: string,
  data: Partial<SpecimenDefinition>
): Promise<SpecimenDefinition> => {
  const response = await axios.patch(`/api/specimen-definitions/${id}`, data);
  return response.data;
};
