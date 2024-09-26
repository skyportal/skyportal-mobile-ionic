import "./ScanningProfileCreator.scss";
import { ScanningOptionsProgram } from "../ScanningOptionsProgram/ScanningOptionsProgram.jsx";
import { IonButton, IonItem, IonList, useIonAlert } from "@ionic/react";
import { useForm } from "react-hook-form";
import { computeSavedStatus, getDefaultValues } from "../../../scanning.lib.js";
import { useUserAccessibleGroups } from "../../../../common/common.hooks.js";
import { useContext, useRef } from "react";
import { UserContext } from "../../../../common/common.context.js";
import { ErrorMessageContainer } from "../../../../common/components/ErrorMessageContainer/ErrorMessageContainer.jsx";
import { ControlledInput } from "../../../../common/components/ControlledInput/ControlledInput.jsx";
import { createNewProfile } from "../../../scanning.requests.js";
import { useHistory } from "react-router";

export const ScanningProfileCreator = () => {
  const { userInfo } = useContext(UserContext);
  const history = useHistory();
  const defaultValues = {
    ...getDefaultValues(),
    profileName: "",
    hoursBefore: 24,
  };
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    watch,
    control,
  } = useForm({ defaultValues });

  const [presentAlert] = useIonAlert();

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
    /** @type {import("../../../../onboarding/onboarding.lib.js").ScanningProfile} */
    const profile = {
      name: data.profileName,
      default: true,
      groupIDs: data.selectedGroups.map((/** @type {string} */ id) =>
        parseInt(id),
      ),
      timeRange: `${data.hoursBefore}`,
      savedStatus: computeSavedStatus({ ...data }),
      rejectedStatus: "hide",
    };
    await createNewProfile({ userInfo, profile });
    await presentAlert({
      header: "Profile created",
      message:
        "The profile has been created successfully. You can now use it to scan for candidates.",
      buttons: ["OK"],
      onDidDismiss: () => {
        history.replace("/app/scanning");
      },
    });
  };

  /** @type {React.MutableRefObject<any>} */
  const groupSelectionModal = useRef(null);
  const { userAccessibleGroups = [] } = useUserAccessibleGroups();

  return (
    <div className="scanning-profile-creator">
      <form
        id="newProfileForm"
        onSubmit={handleSubmit(onSubmit)}
        className="scanning-options-form"
      >
        <div className="form-section">
          <IonList inset>
            <IonItem>
              <ControlledInput
                name={"profileName"}
                control={control}
                rules={{ required: true }}
                // @ts-ignore
                label="Profile name"
                placeholder="Enter a name"
                labelPlacement="fixed"
              ></ControlledInput>
            </IonItem>
          </IonList>
          <ErrorMessageContainer errors={errors} errorNames={["profileName"]} />
        </div>
        <div className="form-section">
          <IonList inset>
            <IonItem>
              <ControlledInput
                name={"hoursBefore"}
                control={control}
                rules={{ required: true }}
                // @ts-ignore
                type="number"
                label="Hours before"
                labelPlacement="fixed"
              ></ControlledInput>
            </IonItem>
          </IonList>
        </div>
        <ScanningOptionsProgram
          register={register}
          control={control}
          errors={errors}
          modal={groupSelectionModal}
          userAccessibleGroups={userAccessibleGroups}
          watch={watch}
        />
      </form>
      <div className="form-footer">
        <IonButton
          type="submit"
          form="newProfileForm"
          shape="round"
          expand="block"
        >
          Create
        </IonButton>
      </div>
    </div>
  );
};
