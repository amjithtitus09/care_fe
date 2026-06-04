import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { SlugInput } from '../components/SlugInput';
import { useSpecimenDefinition } from '../hooks/useSpecimenDefinition';

const specimenDefinitionSchema = z.object({
  slug: z.string().regex(/^[a-zA-Z0-9-]+$/, 'Slug must be alphanumeric and can include hyphens.'),
  name: z.string().min(1, 'Name is required'),
});

const SpecimenDefinitionEdit: React.FC = () => {
  const { t } = useTranslation();
  const methods = useForm({
    resolver: zodResolver(specimenDefinitionSchema),
    defaultValues: { slug: '', name: '' },
  });

  const { updateSpecimenDefinition } = useSpecimenDefinition();

  const onSubmit = async (data: { slug: string; name: string }) => {
    await updateSpecimenDefinition(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <SlugInput name="slug" />
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            {t('name')}
          </label>
          <input
            id="name"
            type="text"
            {...methods.register('name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            data-testid="name-input"
          />
          {methods.formState.errors.name && (
            <p className="mt-2 text-sm text-red-600" data-testid="name-error">
              {t(methods.formState.errors.name.message || 'Invalid name')}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          data-testid="submit-button"
        >
          {t('save')}
        </button>
      </form>
    </FormProvider>
  );
};

export default SpecimenDefinitionEdit;