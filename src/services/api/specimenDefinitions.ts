import axios from 'axios';
import { SpecimenDefinitionUpdatePayload } from '../../types';

export const updateSpecimenDefinition = async (id: string, payload: SpecimenDefinitionUpdatePayload) => {
  const response = await axios.put(`/api/specimen-definitions/${id}`, payload);
  return response.data;
};