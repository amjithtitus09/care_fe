import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SpecimenDefinitionUpdatePayload } from '../types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  slug: z.string().min(1, 'Slug is required')
});

type FormData = z.infer<typeof schema>;

interface SpecimenDefinitionFormProps {
  defaultValues: SpecimenDefinitionUpdatePayload;
  onSubmit: (data: FormData) => void;
}

const SpecimenDefinitionForm: React.FC<SpecimenDefinitionFormProps> = ({ defaultValues, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues,
    resolver: zodResolver(schema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="specimen-definition-form">
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" {...register('name')} data-testid="name-input" />
        {errors.name && <span data-testid="name-error">{errors.name.message}</span>}
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea id="description" {...register('description')} data-testid="description-input" />
      </div>
      <div>
        <label htmlFor="slug">Slug</label>
        <input id="slug" {...register('slug')} data-testid="slug-input" />
        {errors.slug && <span data-testid="slug-error">{errors.slug.message}</span>}
      </div>
      <button type="submit" data-testid="submit-button">Submit</button>
    </form>
  );
};

export default SpecimenDefinitionForm;