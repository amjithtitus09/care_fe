import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SpecimenDefinitionEdit from '../pages/SpecimenDefinitionEdit';

describe('SpecimenDefinitionEdit', () => {
  it('renders the form correctly', () => {
    render(<SpecimenDefinitionEdit />);

    expect(screen.getByTestId('slug-input')).toBeInTheDocument();
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    render(<SpecimenDefinitionEdit />);

    fireEvent.change(screen.getByTestId('slug-input'), { target: { value: 'valid-slug' } });
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Valid Name' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    expect(screen.queryByTestId('slug-error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();
  });
});