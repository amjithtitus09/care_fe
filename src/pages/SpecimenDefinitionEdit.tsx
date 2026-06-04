import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SlugInput } from '../components/SlugInput';
import { useSpecimenDefinition } from '../hooks/useSpecimenDefinition';
import { useAuditLogger } from '../hooks/useAuditLogger';

const specimenDefinitionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().regex(/^[a-zA-Z0-9-]+$/, 'Slug must be alphanumeric and can include hyphens only.')
});

export const SpecimenDefinitionEdit: React.FC = () => {
  const methods = useForm({ resolver: zodResolver(specimenDefinitionSchema) });
  const { updateSpecimenDefinition } = useSpecimenDefinition();
  const { logAudit } = useAuditLogger();

  const onSubmit = async (data: any) => {
    try {
      await updateSpecimenDefinition(data);
      logAudit(`Updated specimen definition slug to: ${data.slug}`);
    } catch (error) {
      console.error('Error updating specimen definition:', error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            {...methods.register('name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            data-testid="name-input"
          />
          {methods.formState.errors.name && (
            <p className="mt-2 text-sm text-red-600" data-testid="name-error">
              {methods.formState.errors.name.message}
            </p>
          )}
        </div>

        <SlugInput name="slug" />

        <button
          type="submit"
          className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          data-testid="submit-button"
        >
          Save
        </button>
      </form>
    </FormProvider>
  );
};