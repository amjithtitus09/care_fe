import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpecimenDefinitionEdit } from '../pages/SpecimenDefinitionEdit';

jest.mock('../hooks/useSpecimenDefinition', () => ({
  useSpecimenDefinition: () => ({
    updateSpecimenDefinition: jest.fn()
  })
}));

jest.mock('../hooks/useAuditLogger', () => ({
  useAuditLogger: () => ({
    logAudit: jest.fn()
  })
}));

test('renders SpecimenDefinitionEdit and handles slug updates', async () => {
  render(<SpecimenDefinitionEdit />);

  const nameInput = screen.getByTestId('name-input');
  const slugInput = screen.getByTestId('slug-input');
  const submitButton = screen.getByTestId('submit-button');

  fireEvent.change(nameInput, { target: { value: 'Valid Name' } });
  fireEvent.change(slugInput, { target: { value: 'valid-slug' } });
  fireEvent.click(submitButton);

  expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();
  expect(screen.queryByTestId('slug-error')).not.toBeInTheDocument();
});