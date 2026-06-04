import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { SlugInput } from '../components/SlugInput';

const Wrapper: React.FC = ({ children }) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

test('renders SlugInput and validates input', () => {
  render(
    <Wrapper>
      <SlugInput name="slug" />
    </Wrapper>
  );

  const input = screen.getByTestId('slug-input');
  expect(input).toBeInTheDocument();

  input.value = 'invalid slug!';
  expect(screen.queryByTestId('slug-error')).toBeInTheDocument();

  input.value = 'valid-slug';
  expect(screen.queryByTestId('slug-error')).not.toBeInTheDocument();
});