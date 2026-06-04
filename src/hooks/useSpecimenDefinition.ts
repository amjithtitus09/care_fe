import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSpecimenDefinitionAPI } from '../services/api';

export const useSpecimenDefinition = () => {
  const queryClient = useQueryClient();

  const updateSpecimenDefinition = useMutation(
    async (data: { slug: string; name: string }) => {
      return await updateSpecimenDefinitionAPI(data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['specimenDefinitions']);
      },
      onError: (error) => {
        console.error('Failed to update specimen definition:', error);
      },
    }
  );

  return {
    updateSpecimenDefinition: updateSpecimenDefinition.mutateAsync,
  };
};
