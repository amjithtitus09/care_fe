// Updated type definitions to include slug field
export interface SpecimenDefinition {
  id: string;
  name: string;
  description: string;
  slug: string;
}

export interface FormValues {
  name: string;
  description: string;
  slug: string;
}
