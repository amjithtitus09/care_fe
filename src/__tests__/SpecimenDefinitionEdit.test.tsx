import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SpecimenDefinitionEdit } from '../pages/SpecimenDefinitionEdit';
import { useSpecimenDefinition } from '../hooks/useSpecimenDefinition';
import { useAuditLogger } from '../hooks/useAuditLogger';

jest.mock('../hooks/useSpecimenDefinition');
jest.mock('../hooks/useAuditLogger');

describe('SpecimenDefinitionEdit', () => {
  const mockUpdateSpecimenDefinition = jest.fn();
  const mockLogAudit = jest.fn();

  beforeEach(() => {
    (useSpecimenDefinition as jest.Mock).mockReturnValue({
      updateSpecimenDefinition: mockUpdateSpecimenDefinition,
    });
    (useAuditLogger as jest.Mock).mockReturnValue(mockLogAudit);
  });

  it('renders the form', () => {
    render(<SpecimenDefinitionEdit />);
    expect(screen.getByTestId('specimen-definition-form')).toBeInTheDocument();
  });

  it('submits valid data', async () => {
    render(<SpecimenDefinitionEdit />);

    const input = screen.getByTestId('slug-input');
    const button = screen.getByTestId('submit-button');

    fireEvent.change(input, { target: { value: 'valid-slug' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockUpdateSpecimenDefinition).toHaveBeenCalledWith({ slug: 'valid-slug', name: '' });
      expect(mockLogAudit).toHaveBeenCalledWith('Slug updated to: valid-slug');
    });
  });

  it('handles API errors gracefully', async () => {
    mockUpdateSpecimenDefinition.mockRejectedValueOnce(new Error('API error'));

    render(<SpecimenDefinitionEdit />);

    const input = screen.getByTestId('slug-input');
    const button = screen.getByTestId('submit-button');

    fireEvent.change(input, { target: { value: 'valid-slug' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('slug-error')).toHaveTextContent('Failed to update slug');
      expect(mockLogAudit).toHaveBeenCalledWith('Failed to update slug: valid-slug');
    });
  });
});
