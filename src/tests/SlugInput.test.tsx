import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { SlugInput } from '../components/SlugInput';

const Wrapper: React.FC = ({ children }) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('SlugInput', () => {
  it('renders correctly', () => {
    render(
      <Wrapper>
        <SlugInput name="slug" />
      </Wrapper>
    );

    expect(screen.getByTestId('slug-input')).toBeInTheDocument();
  });

  it('shows error message for invalid slug', async () => {
    render(
      <Wrapper>
        <SlugInput name="slug" />
      </Wrapper>
    );

    const input = screen.getByTestId('slug-input');
    input.value = 'invalid slug!';
    input.dispatchEvent(new Event('input'));

    expect(screen.getByTestId('slug-error')).toBeInTheDocument();
  });
});