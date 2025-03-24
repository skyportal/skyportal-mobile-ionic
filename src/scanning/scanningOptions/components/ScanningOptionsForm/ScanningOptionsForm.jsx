import "./ScanningOptionsForm.scss";
import { ScanningOptionsDate } from "../ScanningOptionsDate/ScanningOptionsDate.jsx";
import { ScanningOptionsProgram } from "../ScanningOptionsProgram/ScanningOptionsProgram.jsx";
import { ScanningOptionsDiscarding } from "../ScanningOptionsDiscarding/ScanningOptionsDiscarding.jsx";
import { IonButton, IonLoading, useIonAlert } from "@ionic/react";
import { useForm } from "react-hook-form";
import moment from "moment-timezone";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  useUserAccessibleGroups,
  useUserProfile,
} from "../../../../common/common.hooks.js";
import { useHistory, useLocation } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { searchCandidates } from "../../../scanning.requests.js";
import {
  computeSavedStatus,
  getDefaultValues,
  getFiltering,
  getStartDate,
} from "../../../scanning.lib.js";
import { ScanningOptionsPinnedAnnotations } from "../ScanningOptionsPinnedAnnotations/ScanningOptionsPinnedAnnotations.jsx";
import { UserContext } from "../../../../common/common.context.js";

const useQuery = () => new URLSearchParams(useLocation().search);

export const ScanningOptionsForm = () => {
  const profileName = useQuery().get("profile");
  const { userInfo } = useContext(UserContext);

  const { userProfile } = useUserProfile();
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  const [loading, setLoading] = useState(false);
  const scanningProfile = useMemo(
    () =>
      userProfile?.preferences?.scanningProfiles?.find(
        (profile) => profile.name === profileName
      ),
    [userProfile, profileName]
  );

  const defaultValues = useMemo(
    () => ({
      ...getDefaultValues(),
      ...(scanningProfile ?
        {
          startDate: getStartDate(scanningProfile),
          ...getFiltering(scanningProfile),
          selectedGroups: scanningProfile.groupIDs,
        } : {}),
    }),
    [scanningProfile]
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    getValues,
    watch,
    control,
    reset,
  } = useForm({ defaultValues });

  useEffect(() => {
    if (scanningProfile) {
      reset(defaultValues);
    }
  }, [scanningProfile]);

  const searchCandidatesMutation = useMutation({
    /**
     * @param {Object} params
     * @param {number[]} params.saveGroupIds
     * @param {import("../../../../common/common.lib.js").SavedStatus} params.savedStatus
     * @param {string} params.startDate
     * @param {string} params.endDate
     * @returns {Promise<any>}
     */
    mutationFn: async ({ saveGroupIds, savedStatus, startDate, endDate }) => {
      const response = await searchCandidates({
        groupIDs: saveGroupIds,
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
        saveGroupIds,
        savedStatus,
        startDate,
        endDate,
        queryID: response.queryID,
      };
    },
    onError: (error) => {
      setLoading(false);
      presentAlert({
        header: error.message === "No candidates found" ? "No candidates found" : "Error",
        message:
          error.message === "No candidates found"
            ? "No candidates were found with the selected options. Please try again."
            : "An error occurred while searching for candidates. Please try again.",
        buttons: ["OK"],
      });
    },
  });

  /**
   * @param {any} data
   */
  const onSubmit = async (data) => {
    if (data.selectedGroups.length === 0) {
      setError("selectedGroups", {
        type: "custom",
        message: "At least one group must be selected",
      });
      return;
    }
    setLoading(true);
    const saveGroupIds = data.selectedGroups;
    const savedStatus = computeSavedStatus({ ...data });
    const startDate = moment(data.startDate).format();
    const endDate = moment(data.endDate).format();
    const junkGroupIDs = data.junkGroups;
    const pinnedAnnotations = data.pinnedAnnotations;

    const response = await searchCandidatesMutation.mutateAsync({
      saveGroupIds,
      savedStatus,
      startDate,
      endDate,
    });

    setLoading(false);
    history.push("/scanning/result", {
      ...response,
      junkGroupIDs,
      pinnedAnnotations,
    });
  };

  /** @type {React.MutableRefObject<any>} */
  const groupSelectionModal = useRef(null);
  /** @type {React.MutableRefObject<any>} */
  const junkGroupSelectionModal = useRef(null);
  const pinnedAnnotationSelectionModal = useRef(null);
  const { userAccessibleGroups = [] } = useUserAccessibleGroups();

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
      <IonLoading isOpen={loading} message="Scanning..." />
    </>
  );
};
