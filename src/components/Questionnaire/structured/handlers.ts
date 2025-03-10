import {
  DataTypeFor,
  RequestTypeFor,
} from "@/components/Questionnaire/structured/types";

import { StructuredQuestionType } from "@/types/questionnaire/question";

interface StructuredHandlerContext {
  patientId: string;
  encounterId: string;
  facilityId?: string;
}

type StructuredHandler<T extends StructuredQuestionType> = {
  getRequests: (
    data: DataTypeFor<T>[],
    context: StructuredHandlerContext,
  ) => Array<{
    url: string;
    method: string;
    body: RequestTypeFor<T>;
    reference_id: string;
  }>;
};

const handlers: {
  [K in StructuredQuestionType]: StructuredHandler<K>;
} = {
  allergy_intolerance: {
    getRequests: (allergies, { patientId, encounterId }) =>
      allergies.map((allergy) => {
        // Ensure all required fields have default values
        const body: RequestTypeFor<"allergy_intolerance"> = {
          clinical_status: allergy.clinical_status ?? "active",
          verification_status: allergy.verification_status ?? "unconfirmed",
          category: allergy.category ?? "medication",
          criticality: allergy.criticality ?? "low",
          code: allergy.code,
          last_occurrence: allergy.last_occurrence,
          note: allergy.note,
          encounter: encounterId,
        };

        return {
          url: `/api/v1/patient/${patientId}/allergy_intolerance/`,
          method: "POST",
          body,
          reference_id: "allergy_intolerance",
        };
      }),
  },
  medication_request: {
    getRequests: (medications, { patientId, encounterId }) => {
      return [
        {
          url: `/api/v1/patient/${patientId}/medication/request/upsert/`,
          method: "POST",
          body: {
            datapoints: medications.map((medication) => ({
              ...medication,
              encounter: encounterId,
              patient: patientId,
            })),
          },
          reference_id: "medication_request",
        },
      ];
    },
  },
  medication_statement: {
    getRequests: (medications, { patientId, encounterId }) => {
      return [
        {
          url: `/api/v1/patient/${patientId}/medication/statement/upsert/`,
          method: "POST",
          body: {
            datapoints: medications.map((medication) => ({
              ...medication,
              encounter: encounterId,
              patient: patientId,
            })),
          },
          reference_id: "medication_statement",
        },
      ];
    },
  },
  symptom: {
    getRequests: (symptoms, { patientId, encounterId }) =>
      symptoms.map((symptom) => {
        const body: RequestTypeFor<"symptom"> = {
          clinical_status: symptom.clinical_status,
          verification_status: symptom.verification_status,
          code: symptom.code,
          severity: symptom.severity,
          onset: symptom.onset,
          recorded_date: symptom.recorded_date,
          note: symptom.note,
          encounter: encounterId,
        };

        return {
          url: `/api/v1/patient/${patientId}/symptom/`,
          method: "POST",
          body,
          reference_id: "symptom",
        };
      }),
  },
  diagnosis: {
    getRequests: (diagnoses, { patientId, encounterId }) =>
      diagnoses.map((diagnosis) => {
        const body: RequestTypeFor<"diagnosis"> = {
          clinical_status: diagnosis.clinical_status,
          verification_status: diagnosis.verification_status,
          code: diagnosis.code,
          onset: diagnosis.onset,
          recorded_date: diagnosis.recorded_date,
          note: diagnosis.note,
          encounter: encounterId,
        };

        return {
          url: `/api/v1/patient/${patientId}/diagnosis/`,
          method: "POST",
          body,
          reference_id: "diagnosis",
        };
      }),
  },
  encounter: {
    getRequests: (encounters, { patientId, facilityId, encounterId }) => {
      if (!encounterId) return [];
      console.log("Encounters", encounters, facilityId);
      return encounters.map((encounter) => {
        const body: RequestTypeFor<"encounter"> = {
          organizations: [],
          patient: patientId,
          status: encounter.status,
          encounter_class: encounter.encounter_class,
          period: encounter.period,
          hospitalization: encounter.hospitalization,
          priority: encounter.priority,
          external_identifier: encounter.external_identifier,
          facility: encounter.facility.id,
        };

        return {
          url: `/api/v1/encounter/${encounterId}/`,
          method: "PUT",
          body,
          reference_id: "encounter",
        };
      });
    },
  },
};

export const getStructuredRequests = <T extends StructuredQuestionType>(
  type: T,
  data: DataTypeFor<T>[],
  context: StructuredHandlerContext,
) => handlers[type].getRequests(data, context);
