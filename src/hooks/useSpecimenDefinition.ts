import { useMutation } from '@tanstack/react-query';
import { updateSpecimenDefinitionAPI } from '../services/api';

export const useSpecimenDefinition = () => {
  const mutation = useMutation(updateSpecimenDefinitionAPI);

  const updateSpecimenDefinition = async (data: { name: string; slug: string }) => {
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      throw new Error('Failed to update specimen definition');
    }
  };

  return { updateSpecimenDefinition };
};