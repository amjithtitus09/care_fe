import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

const slugSchema = z.string().regex(/^[a-zA-Z0-9-]+$/, 'Slug must be alphanumeric and can include hyphens.');

interface SlugInputProps {
  name: string;
}

export const SlugInput: React.FC<SlugInputProps> = ({ name }) => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {t('slug')}
      </label>
      <input
        id={name}
        type="text"
        {...register(name, { required: true, validate: (value) => slugSchema.safeParse(value).success })}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        data-testid="slug-input"
      />
      {errors[name] && (
        <p className="mt-2 text-sm text-red-600" data-testid="slug-error">
          {t(errors[name]?.message || 'Invalid slug')}
        </p>
      )}
    </div>
  );
};