import {
  CommentModel,
  FacilityModel,
  FacilityRequest,
  IUserFacilityRequest,
  PatientConsentModel,
} from "@/components/Facility/models";
import { Prescription } from "@/components/Medicine/models";
import { PNconfigData } from "@/components/Notifications/models";
import {
  CreateFileRequest,
  CreateFileResponse,
  FileUploadModel,
} from "@/components/Patient/models";
import {
  Appointment,
  AppointmentCreate,
  SlotAvailability,
} from "@/components/Schedule/types";
import {
  SkillModel,
  UpdatePasswordForm,
  UserAssignedModel,
  UserModel,
} from "@/components/Users/models";

import { PaginatedResponse } from "@/Utils/request/types";
import {
  AppointmentPatient,
  AppointmentPatientRegister,
} from "@/pages/Patient/Utils";
import { AllergyIntolerance } from "@/types/emr/allergyIntolerance";
import { Encounter, EncounterEditRequest } from "@/types/emr/encounter";
import { MedicationAdministration } from "@/types/emr/medicationAdministration";
import { MedicationRequest } from "@/types/emr/medicationRequest";
import { MedicationStatement } from "@/types/emr/medicationStatement";
import { PartialPatientModel, Patient } from "@/types/emr/newPatient";
import { Observation } from "@/types/emr/observation";
import { ObservationAnalyzeResponse } from "@/types/emr/observation";
import { PatientModel } from "@/types/emr/patient";
import {
  BaseFacility,
  CreateFacility,
  FacilityData,
} from "@/types/facility/facility";
import {
  FacilityOrganization,
  FacilityOrganizationCreate,
  FacilityOrganizationResponse,
} from "@/types/facilityOrganization/facilityOrganization";
import {
  Organization,
  OrganizationResponse,
  OrganizationUserRole,
  OrganizationUserRoleResponse,
  RoleResponse,
} from "@/types/organization/organization";
import { PlugConfig } from "@/types/plugConfig";
import {
  BatchRequestBody,
  BatchSubmissionResult,
} from "@/types/questionnaire/batch";
import { Code } from "@/types/questionnaire/code";
import { Diagnosis } from "@/types/questionnaire/diagnosis";
import type { QuestionnaireDetail } from "@/types/questionnaire/questionnaire";
import type { QuestionnaireResponse } from "@/types/questionnaire/questionnaireResponse";
import { Symptom } from "@/types/questionnaire/symptom";
import {
  CreateResourceRequest,
  ResourceRequest,
  UpdateResourceRequest,
} from "@/types/resourceRequest/resourceRequest";
import { UserBase } from "@/types/user/user";

/**
 * A fake function that returns an empty object casted to type T
 * @returns Empty object as type T
 */
export function Type<T>(): T {
  return {} as T;
}

export interface JwtTokenObtainPair {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export const API = <TResponse = undefined, TBody = undefined>(
  route: `${HttpMethod} ${string}`,
) => {
  const [method, path] = route.split(" ") as [HttpMethod, string];
  return {
    path,
    method,
    TRes: Type<TResponse>(),
    TBody: Type<TBody>(),
  };
};

export const ModelCrudApis = <
  TModel extends object,
  TCreate = TModel,
  TListResponse = TModel,
  TUpdate = TModel,
>(
  route: string,
) => {
  return {
    list: API<PaginatedResponse<TListResponse>>(`GET ${route}/`),
    create: API<TModel, TCreate>(`POST ${route}/`),
    retrieve: API<TModel>(`GET ${route}/{id}/`),
    update: API<TModel, TUpdate>(`PUT ${route}/{id}/`),
    delete: API(`DELETE ${route}/{id}/`),
  };
};

const routes = {
  // Auth Endpoints
  login: {
    path: "/api/v1/auth/login/",
    method: "POST",
    noAuth: true,
    TRes: Type<JwtTokenObtainPair>(),
    TBody: Type<LoginCredentials>(),
  },

  token_refresh: {
    path: "/api/v1/auth/token/refresh/",
    method: "POST",
    TRes: Type<JwtTokenObtainPair>(),
    TBody: Type<{ refresh: JwtTokenObtainPair["refresh"] }>(),
  },

  token_verify: {
    path: "/api/v1/auth/token/verify/",
    method: "POST",
  },

  checkResetToken: {
    path: "/api/v1/password_reset/check/",
    method: "POST",
    noAuth: true,
    TRes: Type<Record<string, never>>(),
    TBody: Type<{
      token: string;
    }>(),
  },

  resetPassword: {
    path: "/api/v1/password_reset/confirm/",
    method: "POST",
    noAuth: true,
    TRes: Type<Record<string, never>>(),
    TBody: Type<{
      password: string;
      confirm: string;
    }>(),
  },

  forgotPassword: {
    path: "/api/v1/password_reset/",
    method: "POST",
    noAuth: true,
    TRes: Type<Record<string, never>>(),
    TBody: Type<{
      username: string;
    }>(),
  },

  updatePassword: {
    path: "/api/v1/password_change/",
    method: "PUT",
    TRes: Type<Record<string, string | string[]>>(),
    TBody: Type<UpdatePasswordForm>(),
  },
  // User Endpoints
  currentUser: {
    path: "/api/v1/users/getcurrentuser/",
    TRes: Type<UserModel>(),
  },

  userList: {
    path: "/api/v1/users/",
    method: "GET",
    TRes: Type<PaginatedResponse<UserModel>>(),
  },

  getUserList: {
    path: "/api/v1/users/",
    method: "GET",
    TRes: Type<PaginatedResponse<UserBase>>(),
  },

  userListSkill: {
    path: "/api/v1/users/{username}/skill/",
    method: "GET",
    TRes: Type<PaginatedResponse<SkillModel>>(),
  },

  userListFacility: {
    path: "/api/v1/users/{username}/get_facilities/",
    method: "GET",
    TRes: Type<PaginatedResponse<FacilityModel>>(),
  },

  addUserFacility: {
    path: "/api/v1/users/{username}/add_facility/",
    method: "PUT",
    TBody: Type<IUserFacilityRequest>(),
    TRes: Type<UserModel>(),
  },

  addUserSkill: {
    path: "/api/v1/users/{username}/skill/",
    method: "POST",
    TBody: Type<{ skill: string }>(),
    TRes: Type<SkillModel>(),
  },

  deleteUserFacility: {
    path: "/api/v1/users/{username}/delete_facility/",
    method: "DELETE",
    TBody: Type<IUserFacilityRequest>(),
    TRes: Type<Record<string, never>>(),
  },

  clearHomeFacility: {
    path: "/api/v1/users/{username}/clear_home_facility/",
    method: "DELETE",
    TRes: Type<Record<string, never>>(),
  },

  deleteUserSkill: {
    path: "/api/v1/users/{username}/skill/{id}/",
    method: "DELETE",
    TRes: Type<Record<string, never>>(),
  },

  createUser: {
    path: "/api/v1/users/",
    method: "POST",
    noAuth: true,
  },

  updateUser: {
    path: "/api/v1/users/",
    method: "PUT",
  },

  partialUpdateUser: {
    path: "/api/v1/users/{username}/",
    method: "PATCH",
    TRes: Type<UserBase>(),
    TBody: Type<Partial<UserBase>>(),
  },

  updateProfilePicture: {
    path: "/api/v1/users/{username}/profile_picture/",
    method: "PATCH",
    TRes: Type<UserModel>(),
    TBody: Type<{ profile_picture_url: string }>(),
  },

  deleteProfilePicture: {
    path: "/api/v1/users/{username}/profile_picture/",
    method: "DELETE",
    TRes: Type<UserModel>(),
  },

  deleteUser: {
    path: "/api/v1/users/{username}/",
    method: "DELETE",
    TRes: Type<Record<string, never>>(),
  },

  addUser: {
    path: "/api/v1/users/",
    method: "POST",
    TRes: Type<UserModel>(),
  },

  searchUser: {
    path: "/api/v1/users/",
  },

  getOnlineDoctors: {
    path: "/api/v1/users/?user_type=Doctor&ordering=-last_login",
  },

  getUserPnconfig: {
    path: "/api/v1/users/{username}/pnconfig/",
    method: "GET",
    TRes: Type<PNconfigData>(),
  },

  updateUserPnconfig: {
    path: "/api/v1/users/{username}/pnconfig/",
    method: "PATCH",
    TRes: Type<PNconfigData>(),
  },

  // Facility Endpoints

  getPermittedFacilities: {
    path: "/api/v1/facility/",
    TRes: Type<PaginatedResponse<FacilityModel>>(),
  },

  getAllFacilities: {
    path: "/api/v1/getallfacilities/",
    TRes: Type<PaginatedResponse<FacilityModel>>(),
  },

  createFacility: {
    path: "/api/v1/facility/",
    method: "POST",
    TRes: Type<FacilityModel>(),
    TBody: Type<FacilityRequest>(),
  },

  getPermittedFacility: {
    path: "/api/v1/facility/{id}/",
    method: "GET",
    TRes: Type<FacilityModel>(),
  },

  getAnyFacility: {
    path: "/api/v1/getallfacilities/{id}/",
    method: "GET",
    TRes: Type<FacilityModel>(),
  },

  updateFacility: {
    path: "/api/v1/facility/{id}/",
    method: "PUT",
    TRes: Type<FacilityModel>(),
    TBody: Type<FacilityRequest>(),
  },

  partialUpdateFacility: {
    path: "/api/v1/facility/{id}/",
    method: "PATCH",
    TRes: Type<FacilityModel>(),
    TBody: Type<Partial<FacilityModel>>(),
  },

  deleteFacilityCoverImage: {
    path: "/api/v1/facility/{id}/cover_image/",
    method: "DELETE",
    TRes: Type<Record<string, never>>(),
  },

  getFacilityUsers: {
    path: "/api/v1/facility/{facility_id}/get_users/",
    TRes: Type<PaginatedResponse<UserAssignedModel>>(),
  },

  getScheduleAbleFacilityUser: {
    path: "/api/v1/facility/{facility_id}/schedulable_users/{user_id}/",
    TRes: Type<UserAssignedModel>(),
  },

  getScheduleAbleFacilityUsers: {
    path: "/api/v1/facility/{facility_id}/schedulable_users/",
    TRes: Type<PaginatedResponse<UserAssignedModel>>(),
  },

  // Download Api
  deleteFacility: {
    path: "/api/v1/facility/{id}/",
    method: "DELETE",
    TRes: Type<Record<string, never>>(),
  },

  // Patient

  searchPatient: {
    path: "/api/v1/patient/search/",
    method: "POST",
    TRes: Type<PaginatedResponse<PartialPatientModel>>(),
  },
  patientList: {
    path: "/api/v1/patient/",
    method: "GET",
    TRes: Type<PaginatedResponse<PatientModel>>(),
  },
  addPatient: {
    path: "/api/v1/patient/",
    method: "POST",
    TRes: Type<PatientModel>(),
  },
  getPatient: {
    path: "/api/v1/patient/{id}/",
    method: "GET",
    TBody: Type<PatientModel>(),
    TRes: Type<PatientModel>(),
  },
  updatePatient: {
    path: "/api/v1/patient/{id}/",
    method: "PUT",
    TRes: Type<PatientModel>(),
  },
  patchPatient: {
    path: "/api/v1/patient/{id}/",
    method: "PATCH",
    TBody: Type<Partial<PatientModel>>(),
    TRes: Type<PatientModel>(),
  },

  // Consents
  listConsents: {
    path: "/api/v1/consultation/{consultationId}/consents/",
    method: "GET",
    TRes: Type<PaginatedResponse<PatientConsentModel>>(),
  },
  getConsent: {
    path: "/api/v1/consultation/{consultationId}/consents/{id}/",
    method: "GET",
    TRes: Type<PatientConsentModel>(),
  },
  createConsent: {
    path: "/api/v1/consultation/{consultationId}/consents/",
    method: "POST",
    TRes: Type<PatientConsentModel>(),
    TBody: Type<Partial<PatientConsentModel>>(),
  },
  partialUpdateConsent: {
    path: "/api/v1/consultation/{consultationId}/consents/{id}/",
    method: "PATCH",
    TRes: Type<PatientConsentModel>(),
    TBody: Type<Partial<PatientConsentModel>>(),
  },

  //Profile

  getUserDetails: {
    path: "/api/v1/users/{username}/",
    method: "GET",
    TRes: Type<UserBase>(),
  },
  updateUserDetails: {
    path: "/api/v1/users/",
    method: "PUT",
  },

  // FileUpload Create
  createUpload: {
    path: "/api/v1/files/",
    method: "POST",
    TBody: Type<CreateFileRequest>(),
    TRes: Type<CreateFileResponse>(),
  },
  viewUpload: {
    path: "/api/v1/files/",
    method: "GET",
    TRes: Type<PaginatedResponse<FileUploadModel>>(),
  },
  retrieveUpload: {
    path: "/api/v1/files/{id}/",
    method: "GET",
    TRes: Type<FileUploadModel>(),
  },
  editUpload: {
    path: "/api/v1/files/{id}/",
    method: "PUT",
    TBody: Type<Partial<FileUploadModel>>(),
    TRes: Type<FileUploadModel>(),
  },
  markUploadCompleted: {
    path: "/api/v1/files/{id}/mark_upload_completed/",
    method: "POST",
    TRes: Type<FileUploadModel>(),
  },
  archiveUpload: {
    path: "/api/v1/files/{id}/archive/",
    method: "POST",
    TRes: Type<FileUploadModel>(),
    TBody: Type<{ archive_reason: string }>(),
  },

  // Request
  createResource: {
    path: "/api/v1/resource/",
    method: "POST",
    TRes: Type<ResourceRequest>(),
    TBody: Type<CreateResourceRequest>(),
  },
  updateResource: {
    path: "/api/v1/resource/{id}/",
    method: "PUT",
    TRes: Type<ResourceRequest>(),
    TBody: Type<UpdateResourceRequest>(),
  },
  listResourceRequests: {
    path: "/api/v1/resource/",
    method: "GET",
    TRes: Type<PaginatedResponse<ResourceRequest>>(),
  },
  getResourceDetails: {
    path: "/api/v1/resource/{id}/",
    method: "GET",
    TRes: Type<ResourceRequest>(),
  },
  downloadResourceRequests: {
    path: "/api/v1/resource/",
    method: "GET",
    TRes: Type<string>(),
  },
  getResourceComments: {
    path: "/api/v1/resource/{id}/comment/",
    method: "GET",
    TRes: Type<PaginatedResponse<CommentModel>>(),
  },
  addResourceComments: {
    path: "/api/v1/resource/{id}/comment/",
    method: "POST",
    TRes: Type<CommentModel>(),
    TBody: Type<Partial<CommentModel>>(),
  },

  // Prescription endpoints

  listPrescriptions: {
    path: "/api/v1/consultation/{consultation_external_id}/prescriptions/",
    method: "GET",
  },

  createPrescription: {
    path: "/api/v1/consultation/{consultation_external_id}/prescriptions/",
    method: "POST",
    TBody: Type<Prescription>(),
    TRes: Type<Prescription>(),
  },

  listAdministrations: {
    path: "/api/v1/consultation/{consultation_external_id}/prescription_administration/",
    method: "GET",
  },

  getAdministration: {
    path: "/api/v1/consultation/{consultation_external_id}/prescription_administration/{external_id}/",
    method: "GET",
  },

  getPrescription: {
    path: "/api/v1/consultation/{consultation_external_id}/prescriptions/{external_id}/",
    method: "GET",
  },

  administerPrescription: {
    path: "/api/v1/consultation/{consultation_external_id}/prescriptions/{external_id}/administer/",
    method: "POST",
  },

  discontinuePrescription: {
    path: "/api/v1/consultation/{consultation_external_id}/prescriptions/{external_id}/discontinue/",
    method: "POST",
    TBody: Type<{
      discontinued_reason: string;
    }>(),
    TRes: Type<Record<string, never>>(),
  },

  facility: {
    getUsers: {
      path: "/api/v1/facility/{facility_id}/users/",
      method: "GET",
      TRes: Type<PaginatedResponse<UserBase>>(),
    },
    list: {
      path: "/api/v1/facility/",
      method: "GET",
      TRes: Type<PaginatedResponse<BaseFacility>>(),
    },
    create: {
      path: "/api/v1/facility/",
      method: "POST",
      TRes: Type<BaseFacility>(),
      TBody: Type<CreateFacility>(),
    },
    show: {
      path: "/api/v1/facility/{id}/",
      method: "GET",
      TRes: Type<FacilityData>(),
    },
  },

  valueset: {
    expand: {
      path: "/api/v1/valueset/{system}/expand/",
      method: "POST",
      TBody: Type<{ search: string; count: number }>(),
      TRes: Type<{ results: Code[] }>(),
    },
  },

  // Questionnaire Routes
  questionnaire: {
    list: {
      path: "/api/v1/questionnaire/",
      method: "GET",
      TRes: Type<PaginatedResponse<QuestionnaireDetail>>(),
    },

    detail: {
      path: "/api/v1/questionnaire/{id}/",
      method: "GET",
      TRes: Type<QuestionnaireDetail>(),
    },

    create: {
      path: "/api/v1/questionnaire/",
      method: "POST",
      TRes: Type<QuestionnaireDetail>(),
      TBody: Type<Partial<QuestionnaireDetail>>(),
    },

    update: {
      path: "/api/v1/questionnaire/{id}/",
      method: "PUT",
      TRes: Type<QuestionnaireDetail>(),
      TBody: Type<QuestionnaireDetail>(),
    },

    partialUpdate: {
      path: "/api/v1/questionnaire/{id}/",
      method: "PATCH",
      TRes: Type<QuestionnaireDetail>(),
      TBody: Type<Partial<QuestionnaireDetail>>(),
    },

    delete: {
      path: "/api/v1/questionnaire/{id}/",
      method: "DELETE",
      TRes: Type<Record<string, never>>(),
    },

    submit: {
      path: "/api/v1/questionnaire/{id}/submit/",
      method: "POST",
      TRes: Type<Record<string, never>>(),
      TBody: Type<{
        resource_id: string;
        encounter?: string;
        patient: string;
        responses: Array<{
          question_id: string;
          value: string | number | boolean;
          note?: string;
          bodysite?: string;
          method?: string;
        }>;
      }>(),
    },
  },

  batchRequest: {
    path: "/api/v1/batch_requests/",
    method: "POST",
    TRes: Type<{
      results: BatchSubmissionResult[];
    }>(),
    TBody: Type<BatchRequestBody>(),
  },

  plugConfig: {
    listPlugConfigs: {
      path: "/api/v1/plug_config/",
      method: "GET",
      TRes: Type<{ configs: PlugConfig[] }>(),
    },
    getPlugConfig: {
      path: "/api/v1/plug_config/{slug}/",
      method: "GET",
      TRes: Type<PlugConfig>(),
    },
    createPlugConfig: {
      path: "/api/v1/plug_config/",
      method: "POST",
      TReq: Type<PlugConfig>(),
      TRes: Type<PlugConfig>(),
    },
    updatePlugConfig: {
      path: "/api/v1/plug_config/{slug}/",
      method: "PATCH",
      TReq: Type<PlugConfig>(),
      TRes: Type<PlugConfig>(),
    },
    deletePlugConfig: {
      path: "/api/v1/plug_config/{slug}/",
      method: "DELETE",
      TRes: Type<Record<string, never>>(),
    },
  },
  getQuestionnaireResponses: {
    path: "/api/v1/patient/{patientId}/questionnaire_response/",
    method: "GET",
    TRes: Type<PaginatedResponse<QuestionnaireResponse>>(),
  },
  getQuestionnaireResponse: {
    path: "/api/v1/patient/{patientId}/questionnaire_response/{responseId}/",
    method: "GET",
    TRes: Type<QuestionnaireResponse>(),
  },
  listObservations: {
    path: "/api/v1/patient/{patientId}/observation/",
    method: "GET",
    TRes: Type<PaginatedResponse<Observation>>(),
  },
  observationsAnalyse: {
    path: "/api/v1/patient/{patientId}/observation/analyse/",
    method: "POST",
    TRes: Type<ObservationAnalyzeResponse>(),
  },

  // Diagnosis Routes
  getDiagnosis: {
    path: "/api/v1/patient/{patientId}/diagnosis/",
    method: "GET",
    TRes: Type<PaginatedResponse<Diagnosis>>(),
  },
  // Get Symptom
  getSymptom: {
    path: "/api/v1/patient/{patientId}/symptom/",
    method: "GET",
    TRes: Type<PaginatedResponse<Symptom>>(),
  },

  getAllergy: {
    path: "/api/v1/patient/{patientId}/allergy_intolerance/",
    method: "GET",
    TRes: Type<PaginatedResponse<AllergyIntolerance>>(),
  },

  // Organization Routes
  organization: {
    listMine: {
      path: "/api/v1/organization/mine/",
      method: "GET",
      TRes: {} as OrganizationResponse,
    },
    list: {
      path: "/api/v1/organization/",
      method: "GET",
      TRes: {} as OrganizationResponse,
    },
    get: {
      path: "/api/v1/organization/{id}/",
      method: "GET",
      TRes: {} as Organization,
    },
    listUsers: {
      path: "/api/v1/organization/{id}/users/",
      method: "GET",
      TRes: {} as OrganizationUserRoleResponse,
    },
    assignUser: {
      path: "/api/v1/organization/{id}/users/",
      method: "POST",
      TRes: {} as OrganizationUserRole,
      TBody: {} as { user: string; role: string },
    },
    updateUserRole: {
      path: "/api/v1/organization/{id}/users/{userRoleId}/",
      method: "PUT",
      TRes: {} as OrganizationUserRole,
      TBody: {} as { user: string; role: string },
    },
    removeUserRole: {
      path: "/api/v1/organization/{id}/users/{userRoleId}/",
      method: "DELETE",
      TRes: {} as Record<string, never>,
    },
    listPatients: {
      path: "/api/v1/patient/",
      method: "GET",
      TRes: Type<PaginatedResponse<Patient>>(),
    },
    getPublicOrganizations: {
      path: "/api/v1/govt/organization/",
      method: "GET",
      TRes: Type<PaginatedResponse<Organization>>(),
    },
  },

  facilityOrganization: {
    list: {
      path: "/api/v1/facility/{facilityId}/organizations/",
      method: "GET",
      TRes: {} as FacilityOrganizationResponse,
    },
    get: {
      path: "/api/v1/facility/{facilityId}/organizations/{organizationId}/",
      method: "GET",
      TRes: {} as FacilityOrganization,
    },
    create: {
      path: "/api/v1/facility/{facilityId}/organizations/",
      method: "POST",
      TRes: {} as FacilityOrganization,
      TBody: {} as FacilityOrganizationCreate,
    },
    listUsers: {
      path: "/api/v1/facility/{facilityId}/organizations/{organizationId}/users/",
      method: "GET",
      TRes: {} as OrganizationUserRoleResponse,
    },
    assignUser: {
      path: "/api/v1/facility/{facilityId}/organizations/{organizationId}/users/",
      method: "POST",
      TRes: {} as OrganizationUserRole,
      TBody: {} as { user: string; role: string },
    },
    updateUserRole: {
      path: "/api/v1/facility/{facilityId}/organizations/{organizationId}/users/{userRoleId}/",
      method: "PUT",
      TRes: {} as OrganizationUserRole,
      TBody: {} as { user: string; role: string },
    },
    removeUserRole: {
      path: "/api/v1/facility/{facilityId}/organizations/{organizationId}/users/{userRoleId}/",
      method: "DELETE",
      TRes: {} as Record<string, never>,
    },
  },

  // Role Routes
  role: {
    list: {
      path: "/api/v1/role/",
      method: "GET",
      TRes: {} as RoleResponse,
    },
  },

  // Encounter Routes
  encounter: {
    list: {
      path: "/api/v1/encounter/",
      method: "GET",
      TRes: Type<PaginatedResponse<Encounter>>(),
    },
    create: {
      path: "/api/v1/encounter/",
      method: "POST",
      TRes: Type<Encounter>(),
      TBody: Type<EncounterEditRequest>(),
    },
    get: {
      path: "/api/v1/encounter/{id}/",
      method: "GET",
      TRes: Type<Encounter>(),
    },
    update: {
      path: "/api/v1/encounter/{id}/",
      method: "PUT",
      TRes: Type<Encounter>(),
      TBody: Type<EncounterEditRequest>(),
    },
    addOrganization: {
      path: "/api/v1/encounter/{encounterId}/organizations_add/",
      method: "POST",
      TRes: Type<Encounter>(),
      TBody: Type<{ organization: string }>(),
    },
    removeOrganization: {
      path: "/api/v1/encounter/{encounterId}/organizations_remove/",
      method: "POST",
      TRes: Type<Encounter>(),
      TBody: Type<{ organization: string }>(),
    },
  },

  // New Patient Routes

  patient: {
    getPatient: {
      path: "/api/v1/patient/{id}/",
      method: "GET",
      TBody: Type<Patient>(),
      TRes: Type<Patient>(),
    },
    allergyIntolerance: {
      create: {
        method: "POST",
        path: "/api/v1/patient/:patientId/allergy_intolerance/",
      },
    },
    users: {
      addUser: {
        method: "POST",
        path: "/api/v1/patient/{patientId}/add_user/",
        TRes: Type<UserBase>(),
        TBody: Type<{ user: string; role: string }>(),
      },
      listUsers: {
        method: "GET",
        path: "/api/v1/patient/{patientId}/get_users/",
        TRes: Type<PaginatedResponse<UserBase>>(),
      },
      removeUser: {
        method: "POST",
        path: "/api/v1/patient/{patientId}/delete_user/",
        TRes: Type<{ user: string }>(),
      },
    },
    search_retrieve: {
      path: "/api/v1/patient/search_retrieve/",
      method: "POST",
      TRes: Type<Patient>(),
      TBody: Type<{
        phone_number: string;
        year_of_birth: string;
        partial_id: string;
      }>(),
    },
  },

  // OTP Routes
  otp: {
    sendOtp: {
      path: "/api/v1/otp/send/",
      method: "POST",
      TBody: Type<{ phone_number: string }>(),
      TRes: Type<Record<string, never>>(),
      auth: {
        key: "Authorization",
        value: "{OTP_API_KEY}",
        type: "header",
      },
    },
    loginByOtp: {
      path: "/api/v1/otp/login/",
      method: "POST",
      TBody: Type<{ phone_number: string; otp: string }>(),
      TRes: Type<
        { access: string } | { errors: Array<Record<string, string>> }
      >(),
    },
    getPatient: {
      path: "/api/v1/otp/patient/",
      method: "GET",
      TRes: Type<PaginatedResponse<AppointmentPatient>>(),
      auth: {
        key: "Authorization",
        value: "Bearer {token}",
        type: "header",
      },
    },
    createPatient: {
      path: "/api/v1/otp/patient/",
      method: "POST",
      TBody: Type<Partial<AppointmentPatientRegister>>(),
      TRes: Type<AppointmentPatient>(),
      auth: {
        key: "Authorization",
        value: "Bearer {token}",
        type: "header",
      },
    },
    getSlotsForDay: {
      path: "/api/v1/otp/slots/get_slots_for_day/",
      method: "POST",
      TRes: Type<{ results: SlotAvailability[] }>(),
      TBody: Type<{ facility: string; resource: string; day: string }>(),
    },
    getAppointments: {
      path: "/api/v1/otp/slots/get_appointments/",
      method: "GET",
      TRes: Type<{ results: Appointment[] }>(),
    },
    createAppointment: {
      path: "/api/v1/otp/slots/{id}/create_appointment/",
      method: "POST",
      TRes: Type<Appointment>(),
      TBody: Type<AppointmentCreate>(),
    },
  },

  // Medication
  medicationRequest: {
    list: {
      path: "/api/v1/patient/{patientId}/medication/request/",
      method: "GET",
      TRes: Type<PaginatedResponse<MedicationRequest>>(),
    },
    discontinue: {
      path: "/api/v1/patient/{patientId}/medication/request/{id}/discontinue/",
      method: "POST",
      TBody: Type<{ status_reason: MedicationRequest["status_reason"] }>(),
      TRes: Type<MedicationRequest>(),
    },
  },

  medicationAdministration: {
    list: {
      path: "/api/v1/patient/{patientId}/medication/administration/",
      method: "GET",
      TRes: Type<PaginatedResponse<MedicationAdministration>>(),
    },
    create: {
      path: "/api/v1/patient/{patientId}/medication/administration/",
      method: "POST",
      TBody: Type<MedicationAdministration>(),
      TRes: Type<MedicationAdministration>(),
    },
  },

  medicationStatement: {
    list: {
      path: "/api/v1/patient/{patientId}/medication/statement/",
      method: "GET",
      TRes: Type<PaginatedResponse<MedicationStatement>>(),
    },
  },
} as const;

export default routes;
