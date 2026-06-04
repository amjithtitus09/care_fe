// Updated EditSpecimenDefinition page to handle slug updates
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSpecimenDefinition } from '../services/api/specimenDefinitions';
import { FormValues } from '../types';
import { useTranslation } from 'react-i18next';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  slug: z.string().min(1, 'Slug is required')
});

const EditSpecimenDefinition: React.FC<{ id: string }> = ({ id }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const mutation = useMutation(
    (data: FormValues) => updateSpecimenDefinition(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['specimenDefinitions']);
      }
    }
  );

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="edit-specimen-form">
      <div>
        <label htmlFor="name">{t('Name')}</label>
        <input
          id="name"
          {...register('name')}
          data-testid="name-input"
        />
        {errors.name && <span data-testid="name-error">{errors.name.message}</span>}
      </div>
      <div>
        <label htmlFor="description">{t('Description')}</label>
        <textarea
          id="description"
          {...register('description')}
          data-testid="description-input"
        />
        {errors.description && <span data-testid="description-error">{errors.description.message}</span>}
      </div>
      <div>
        <label htmlFor="slug">{t('Slug')}</label>
        <input
          id="slug"
          {...register('slug')}
          data-testid="slug-input"
        />
        {errors.slug && <span data-testid="slug-error">{errors.slug.message}</span>}
      </div>
      <button type="submit" data-testid="submit-button">{t('Save')}</button>
    </form>
  );
};

export default EditSpecimenDefinition;
