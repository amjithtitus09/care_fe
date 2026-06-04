import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { SlugInput } from '../components/SlugInput';
import { specimenDefinitionSchema } from '../schemas/specimenDefinitionSchema';
import { useSpecimenDefinition } from '../hooks/useSpecimenDefinition';
import { useAuditLogger } from '../hooks/useAuditLogger';

export const SpecimenDefinitionEdit: React.FC = () => {
  const { t } = useTranslation();
  const methods = useForm({
    resolver: zodResolver(specimenDefinitionSchema),
    defaultValues: {
      slug: '',
      name: '',
    },
  });

  const { updateSpecimenDefinition } = useSpecimenDefinition();
  const logAudit = useAuditLogger();

  const onSubmit = async (data: any) => {
    try {
      await updateSpecimenDefinition(data);
      logAudit(`Slug updated to: ${data.slug}`);
    } catch (error) {
      logAudit(`Failed to update slug: ${data.slug}`);
      methods.setError('slug', { type: 'manual', message: t('Failed to update slug') });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} data-testid="specimen-definition-form">
        <SlugInput name="slug" label={t('Slug')} />
        <button
          type="submit"
          className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          data-testid="submit-button"
        >
          {t('Save')}
        </button>
      </form>
    </FormProvider>
  );
};
