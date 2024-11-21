import { navigate } from "raviger";
import { useTranslation } from "react-i18next";

import CareIcon from "@/CAREUI/icons/CareIcon";
import PaginatedList from "@/CAREUI/misc/PaginatedList";

import ButtonV2 from "@/components/Common/ButtonV2";
import CircularProgress from "@/components/Common/CircularProgress";
import { ShiftingModel } from "@/components/Facility/models";
import ShiftingBlock from "@/components/Shifting/ShiftingBlock";

import { NonReadOnlyUsers } from "@/Utils/AuthorizeFor";
import routes from "@/Utils/request/api";

import { PatientProps } from ".";
import { PatientModel } from "../models";

const ShiftingHistory = (props: PatientProps) => {
  const { patientData, facilityId, id } = props;
  const { t } = useTranslation();

  const isPatientInactive = (patientData: PatientModel, facilityId: string) => {
    return (
      !patientData.is_active ||
      !(patientData?.last_consultation?.facility === facilityId)
    );
  };

  return (
    <section className="mt-4">
      <div className="flex justify-between items-center">
        <h2 className="my-4 ml-0 text-2xl font-semibold leading-tight">
          {t("shifting_history")}
        </h2>
        <ButtonV2
          className=""
          disabled={isPatientInactive(patientData, facilityId)}
          size="default"
          onClick={() =>
            navigate(`/facility/${facilityId}/patient/${id}/shift/new`)
          }
          authorizeFor={NonReadOnlyUsers}
        >
          <span className="flex w-full items-center justify-start gap-2">
            <CareIcon icon="l-ambulance" className="text-xl" />
            {t("shift")}
          </span>
        </ButtonV2>
      </div>
      <PaginatedList
        route={routes.listShiftRequests}
        query={{ patient: id }}
        perPage={12}
      >
        {() => (
          <div className="mt-4">
            <PaginatedList.WhenLoading>
              <CircularProgress />
            </PaginatedList.WhenLoading>
            <PaginatedList.WhenEmpty className="flex items-center justify-center text-secondary-500 py-10 px-4">
              <>{t("no_results_found")}</>
            </PaginatedList.WhenEmpty>
            <PaginatedList.Items<ShiftingModel> className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
              {(item) => (
                <div className="bg-white border border-secondary-300 rounded-lg">
                  <ShiftingBlock shift={item} />
                </div>
              )}
            </PaginatedList.Items>
          </div>
        )}
      </PaginatedList>
    </section>
  );
};

export default ShiftingHistory;
