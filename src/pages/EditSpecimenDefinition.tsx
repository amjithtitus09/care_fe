import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SpecimenDefinitionForm from '../components/SpecimenDefinitionForm';
import { getSpecimenDefinition, updateSpecimenDefinition } from '../services/api/specimenDefinitions';

const EditSpecimenDefinition: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: specimenDefinition, isLoading } = useQuery(['specimenDefinition', id], () => getSpecimenDefinition(id!));

  const mutation = useMutation(
    (payload) => updateSpecimenDefinition(id!, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['specimenDefinition', id]);
      }
    }
  );

  if (isLoading) return <div data-testid="loading">Loading...</div>;

  const handleSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <div data-testid="edit-specimen-definition-page">
      <h1>Edit Specimen Definition</h1>
      {specimenDefinition && (
        <SpecimenDefinitionForm
          defaultValues={specimenDefinition}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default EditSpecimenDefinition;