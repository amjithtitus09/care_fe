import { useMutation } from '@tanstack/react-query';
import { useAuditLogger } from './useAuditLogger';
import { updateSpecimenDefinitionAPI } from '../services/api';

export const useSpecimenDefinition = () => {
  const auditLogger = useAuditLogger();

  const updateSpecimenDefinition = useMutation(
    async (data: { slug: string; name: string }) => {
      try {
        const response = await updateSpecimenDefinitionAPI(data);
        auditLogger.log('Slug update attempt', { slug: data.slug, success: true });
        return response;
      } catch (error: any) {
        auditLogger.log('Slug update attempt', { slug: data.slug, success: false, error: error.message });
        throw error;
      }
    }
  );

  return { updateSpecimenDefinition };
};