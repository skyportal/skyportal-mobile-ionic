import "./ScanningOptionsForm.scss";
import { ScanningOptionsDate } from "../ScanningOptionsDate/ScanningOptionsDate.jsx";
import { ScanningOptionsProgram } from "../ScanningOptionsProgram/ScanningOptionsProgram.jsx";
import { ScanningOptionsDiscarding } from "../ScanningOptionsDiscarding/ScanningOptionsDiscarding.jsx";
import { IonButton, useIonAlert } from "@ionic/react";
import { useForm } from "react-hook-form";
import moment from "moment-timezone";
import { useContext, useRef } from "react";
import {
  useQueryParams,
  useUserAccessibleGroups,
  useUserProfile,
} from "../../../common/hooks.js";
import { useHistory } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { navigateWithParams } from "../../../common/util.js";
import { UserContext } from "../../../common/context.js";
import { searchCandidates } from "../../scanningRequests.js";
import {
  computeSavedStatus,
  getDefaultValues,
  getFiltering,
  getStartDate,
} from "../../scanningLib.js";
import { ScanningOptionsPinnedAnnotations } from "../ScanningOptionsPinnedAnnotations/ScanningOptionsPinnedAnnotations.jsx";

export const ScanningOptionsForm = () => {
  const userInfo = useContext(UserContext);

  const { /** @type {string|undefined} */ profile: profileName } =
    useQueryParams();
  const { userProfile } = useUserProfile(userInfo);
  /** @type {import("../../../onboarding/auth.js").ScanningProfile|undefined}*/
  const scanningProfile = userProfile?.preferences?.scanningProfiles?.find(
    (profile) => profile.name === profileName,
  );
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  let defaultValues = getDefaultValues();

  if (scanningProfile) {
    defaultValues = {
      ...defaultValues,
      startDate: getStartDate(scanningProfile),
      ...getFiltering(scanningProfile),
      // @ts-ignore
      selectedGroups: scanningProfile.groupIDs,
    };
  }

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    getValues,
    watch,
    control,
  } = useForm({ defaultValues });

  const searchCandidatesMutation = useMutation({
    /**
     * @param {Object} params
     * @param {string} params.groupIDs
     * @param {import("../../../common/constants.js").SavedStatus} params.savedStatus
     * @param {string} params.startDate
     * @param {string} params.endDate
     * @param {string} params.junkGroupIDs
     * @param {string} params.discardBehavior
     * @param {string} params.discardGroup
     * @param {string} params.pinnedAnnotations
     * @returns {Promise<any>}
     */
    mutationFn: async ({
      groupIDs,
      savedStatus,
      startDate,
      endDate,
      junkGroupIDs,
      discardBehavior,
      discardGroup,
      pinnedAnnotations,
    }) => {
      const response = await searchCandidates({
        groupIDs,
        savedStatus,
        startDate,
        endDate,
        pageNumber: 1,
        userInfo,
      });
      if (response.totalMatches === 0) {
        throw new Error("No candidates found");
      }
      return {
        totalMatches: response.totalMatches,
        groupIDs,
        savedStatus,
        startDate,
        endDate,
        junkGroupIDs,
        discardBehavior,
        discardGroup,
        pinnedAnnotations,
        queryID: response.queryID,
      };
    },
    onError: (error) => {
      if (error.message === "No candidates found") {
        presentAlert({
          header: "No candidates found",
          message:
            "No candidates were found with the selected options. Please try again with different options.",
          buttons: ["OK"],
        });
      } else {
        presentAlert({
          header: "Error",
          message:
            "An error occurred while searching for candidates. Please try again.",
          buttons: ["OK"],
        });
      }
    },
    onSuccess: (response) => {
      navigateWithParams(history, "/scanning/main", {
        params: {
          ...response,
        },
        replace: true,
      });
    },
  });

  /**
   * @param {any} data
   */
  const onSubmit = (data) => {
    if (data.selectedGroups.length === 0) {
      setError("selectedGroups", {
        type: "custom",
        message: "At least one group must be selected",
      });
      return;
    }
    const groupIDs = data.selectedGroups.join(",");
    const savedStatus = computeSavedStatus({ ...data });
    const startDate = moment(data.startDate).format();
    const endDate = moment(data.endDate).format();
    const junkGroupIDs = data.junkGroups.join(",");
    const pinnedAnnotations = data.pinnedAnnotations.join(",");

    searchCandidatesMutation.mutate({
      groupIDs,
      savedStatus,
      startDate,
      endDate,
      junkGroupIDs,
      pinnedAnnotations,
      discardBehavior: data.discardBehavior,
      discardGroup: data.discardGroup,
    });
  };

  /** @type {React.MutableRefObject<any>} */
  const groupSelectionModal = useRef(null);
  /** @type {React.MutableRefObject<any>} */
  const junkGroupSelectionModal = useRef(null);
  const pinnedAnnotationSelectionModal = useRef(null);
  const { userAccessibleGroups = [] } = useUserAccessibleGroups(userInfo);

  return (
    <>
      <form
        id="optionsForm"
        onSubmit={handleSubmit(onSubmit)}
        className="scanning-options-form"
      >
        <ScanningOptionsDate
          control={control}
          getValues={getValues}
          errors={errors}
        />
        <ScanningOptionsProgram
          register={register}
          control={control}
          errors={errors}
          modal={groupSelectionModal}
          userAccessibleGroups={userAccessibleGroups}
          watch={watch}
        />
        <ScanningOptionsDiscarding
          register={register}
          errors={errors}
          control={control}
          watch={watch}
          modal={junkGroupSelectionModal}
          userAccessibleGroups={userAccessibleGroups}
        />
        <ScanningOptionsPinnedAnnotations
          control={control}
          watch={watch}
          modal={pinnedAnnotationSelectionModal}
        />
      </form>
      <div className="form-footer">
        <IonButton
          type="submit"
          form="optionsForm"
          shape="round"
          expand="block"
        >
          Scan
        </IonButton>
      </div>
    </>
  );
};
