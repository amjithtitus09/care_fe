import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

const slugSchema = z.string().regex(/^[a-zA-Z0-9-]+$/, 'Slug must be alphanumeric and can include hyphens only.');

interface SlugInputProps {
  name: string;
  label: string;
}

export const SlugInput: React.FC<SlugInputProps> = ({ name, label }) => {
  const { register, formState: { errors } } = useFormContext();
  const { t } = useTranslation();

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        type="text"
        {...register(name, { validate: (value) => slugSchema.safeParse(value).success || t('Slug must be alphanumeric and can include hyphens only.') })}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors[name] ? 'border-red-500' : ''}`}
        data-testid="slug-input"
      />
      {errors[name] && (
        <p className="mt-2 text-sm text-red-600" data-testid="slug-error">
          {errors[name].message}
        </p>
      )}
    </div>
  );
};