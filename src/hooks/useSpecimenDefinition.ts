import { useMutation } from '@tanstack/react-query';
import { updateSpecimenDefinitionAPI } from '../services/api';

export const useSpecimenDefinition = () => {
  const updateSpecimenDefinition = useMutation(
    async (data: any) => {
      const response = await updateSpecimenDefinitionAPI(data);
      if (!response.ok) {
        throw new Error(response.error || 'Failed to update specimen definition');
      }
      return response;
    }
  );

  return {
    updateSpecimenDefinition: updateSpecimenDefinition.mutateAsync
  };
};