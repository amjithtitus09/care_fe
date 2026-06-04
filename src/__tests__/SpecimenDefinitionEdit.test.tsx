import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpecimenDefinitionEdit } from '../pages/SpecimenDefinitionEdit';
import { useSpecimenDefinition } from '../hooks/useSpecimenDefinition';
import { useAuditLogger } from '../hooks/useAuditLogger';

jest.mock('../hooks/useSpecimenDefinition');
jest.mock('../hooks/useAuditLogger');

const mockUpdateSpecimenDefinition = jest.fn();
const mockLogAudit = jest.fn();

(useSpecimenDefinition as jest.Mock).mockReturnValue({
  updateSpecimenDefinition: mockUpdateSpecimenDefinition
});

(useAuditLogger as jest.Mock).mockReturnValue({
  logAudit: mockLogAudit
});

test('handles slug updates correctly', async () => {
  render(<SpecimenDefinitionEdit />);

  const slugInput = screen.getByTestId('slug-input');
  const submitButton = screen.getByTestId('submit-button');

  fireEvent.change(slugInput, { target: { value: 'valid-slug' } });
  fireEvent.click(submitButton);

  expect(mockUpdateSpecimenDefinition).toHaveBeenCalledWith({ slug: 'valid-slug' });
  expect(mockLogAudit).toHaveBeenCalledWith('Slug update attempt successful', { slug: 'valid-slug' });

  mockUpdateSpecimenDefinition.mockRejectedValueOnce(new Error('Failed to update slug'));

  fireEvent.click(submitButton);

  expect(mockLogAudit).toHaveBeenCalledWith('Slug update attempt failed', expect.any(Object));
  expect(screen.getByTestId('slug-error')).toBeInTheDocument();
});