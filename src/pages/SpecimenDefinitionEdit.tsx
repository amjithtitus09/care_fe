import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { SlugInput } from '../components/SlugInput';
import { useSpecimenDefinition } from '../hooks/useSpecimenDefinition';
import { useAuditLogger } from '../hooks/useAuditLogger';

const specimenDefinitionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().regex(/^[a-zA-Z0-9-]+$/, 'Slug must be alphanumeric and can include hyphens only.')
});

export const SpecimenDefinitionEdit: React.FC = () => {
  const { t } = useTranslation();
  const methods = useForm({
    resolver: zodResolver(specimenDefinitionSchema)
  });
  const { updateSpecimenDefinition } = useSpecimenDefinition();
  const { logAudit } = useAuditLogger();

  const onSubmit = async (data: any) => {
    try {
      await updateSpecimenDefinition(data);
      logAudit('Slug update attempt successful', data);
    } catch (error) {
      logAudit('Slug update attempt failed', { error, data });
      methods.setError('slug', { message: t('Failed to update slug') });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <SlugInput name="slug" label={t('Slug')} />
          <button
            type="submit"
            className="btn-primary"
            data-testid="submit-button"
          >
            {t('Save')}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};