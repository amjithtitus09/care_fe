import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { SlugInput } from '../components/SlugInput';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

test('renders SlugInput and validates input', () => {
  render(
    <Wrapper>
      <SlugInput name="slug" label="Slug" />
    </Wrapper>
  );

  const input = screen.getByTestId('slug-input');
  fireEvent.change(input, { target: { value: 'valid-slug' } });
  expect(input).toHaveValue('valid-slug');

  fireEvent.change(input, { target: { value: 'invalid slug!' } });
  fireEvent.blur(input);
  expect(screen.getByTestId('slug-error')).toBeInTheDocument();
});