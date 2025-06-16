import "./ScanningOptionsForm.scss";
import { ScanningOptionsDate } from "../ScanningOptionsDate/ScanningOptionsDate.jsx";
import { ScanningOptionsProgram } from "../ScanningOptionsProgram/ScanningOptionsProgram.jsx";
import { ScanningOptionsDiscarding } from "../ScanningOptionsDiscarding/ScanningOptionsDiscarding.jsx";
import { IonButton } from "@ionic/react";
import { useForm } from "react-hook-form";
import moment from "moment-timezone";
import { useEffect, useMemo, useRef } from "react";
import {
  useUserAccessibleGroups,
  useUserProfile,
} from "../../../../common/common.hooks.js";
import { useHistory, useLocation } from "react-router";
import {
  computeSavedStatus,
  getDefaultValues,
  getFiltering,
  getStartDate,
} from "../../../scanning.lib.js";
import { ScanningOptionsPinnedAnnotations } from "../ScanningOptionsPinnedAnnotations/ScanningOptionsPinnedAnnotations.jsx";

const useQuery = () => new URLSearchParams(useLocation().search);

export const ScanningOptionsForm = () => {
  const profileName = useQuery().get("profile");
  const { userProfile } = useUserProfile();
  const history = useHistory();
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
    history.push("/scanning/result", {
      saveGroupIds: data.selectedGroups,
      savedStatus: computeSavedStatus({ ...data }),
      startDate: moment(data.startDate).format(),
      endDate: moment(data.endDate).format(),
      junkGroupIDs: data.junkGroups,
      discardBehavior: data.discardBehavior,
      discardGroup: data.discardGroup,
      pinnedAnnotations: data.pinnedAnnotations,
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
    </>
  );
};
