import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { SlugInput } from '../components/SlugInput';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('SlugInput', () => {
  it('renders without crashing', () => {
    render(
      <Wrapper>
        <SlugInput name="slug" label="Slug" />
      </Wrapper>
    );
    expect(screen.getByTestId('slug-input')).toBeInTheDocument();
  });

  it('shows an error for invalid input', async () => {
    render(
      <Wrapper>
        <SlugInput name="slug" label="Slug" />
      </Wrapper>
    );

    const input = screen.getByTestId('slug-input');
    fireEvent.change(input, { target: { value: 'invalid slug!' } });
    fireEvent.blur(input);

    expect(await screen.findByTestId('slug-error')).toHaveTextContent('Slug must be alphanumeric and can include hyphens.');
  });
});
