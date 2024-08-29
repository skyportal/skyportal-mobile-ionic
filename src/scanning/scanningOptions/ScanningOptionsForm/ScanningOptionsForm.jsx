import "./ScanningOptionsForm.scss";
import { ScanningOptionsDate } from "../ScanningOptionsDate/ScanningOptionsDate.jsx";
import { ScanningOptionsProgram } from "../ScanningOptionsProgram/ScanningOptionsProgram.jsx";
import { ScanningOptionsDiscarding } from "../ScanningOptionsDiscarding/ScanningOptionsDiscarding.jsx";
import { IonButton, useIonAlert } from "@ionic/react";
import { useForm } from "react-hook-form";
import moment from "moment-timezone";
import { useRef } from "react";
import { useUserAccessibleGroups } from "../../../common/hooks.js";
import { SAVED_STATUS } from "../../../common/constants.js";
import { useHistory } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { initialSearchRequest } from "../../scanningLib.js";
import { navigateWithParams } from "../../../common/util.js";

export const ScanningOptionsForm = () => {
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  const defaultValues = {
    startDate:
      import.meta.env.MODE === "development"
        ? moment("2022-07-26T16:43:00-07:00").format()
        : moment().format(),
    endDate: moment().format(),
    filterCandidates: false,
    filteringType: "include",
    filteringAnyOrAll: "all",
    selectedGroups: [],
    junkGroups: [],
    discardBehavior: "specific",
    discardGroup: null,
  };

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    getValues,
    watch,
    control,
  } = useForm({ defaultValues });

  /**
   * @param {Object} data
   * @param {boolean} data.filterCandidates
   * @param {string} data.filteringType
   * @param {string} data.filteringAnyOrAll
   * @returns {import("../../../common/constants.js").SavedStatus}
   */
  const computeSavedStatus = ({
    filterCandidates,
    filteringType,
    filteringAnyOrAll,
  }) => {
    if (!filterCandidates) {
      return SAVED_STATUS.ALL;
    }
    if (filteringType === "include" && filteringAnyOrAll === "all") {
      return SAVED_STATUS.SAVED_TO_ALL_SELECTED;
    }
    if (filteringType === "include" && filteringAnyOrAll === "any") {
      return SAVED_STATUS.SAVED_TO_ANY_SELECTED;
    }
    if (filteringType === "exclude" && filteringAnyOrAll === "all") {
      return SAVED_STATUS.NOT_SAVED_TO_ALL_SELECTED;
    }
    if (filteringType === "exclude" && filteringAnyOrAll === "any") {
      return SAVED_STATUS.NOT_SAVED_TO_ANY_SELECTED;
    }
    throw new Error(
      "Invalid filterCandidates, filteringType, or filteringAnyOrAll",
    );
  };

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
    }) => {
      const response = await initialSearchRequest({
        groupIDs,
        savedStatus,
        startDate,
        endDate,
        pageNumber: 1,
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

    searchCandidatesMutation.mutate({
      groupIDs,
      savedStatus,
      startDate,
      endDate,
      junkGroupIDs,
      discardBehavior: data.discardBehavior,
      discardGroup: data.discardGroup,
    });
  };

  /** @type {React.MutableRefObject<any>} */
  const groupSelectionModal = useRef(null);
  /** @type {React.MutableRefObject<any>} */
  const junkGroupSelectionModal = useRef(null);
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
