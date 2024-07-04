import "./ScanningOptionsDiscarding.scss";
import {
  IonChip,
  IonIcon,
  IonLabel,
  IonModal,
  IonRadio,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { add } from "ionicons/icons";
import { ControlledMultiSearchSelect } from "../../../common/MultiSearchSelect/ControlledMultiSearchSelect.jsx";
import { ErrorMessage } from "../../../common/ErrorMessage/ErrorMessage.jsx";
import { ControlledRadioGroup } from "../../../common/ControlledRadioGroup/ControlledRadioGroup.jsx";

/**
 * Discarding section of the scanning options
 * @param {Object} props
 * @param {import("react-hook-form").UseFormRegister<any>} props.register
 * @param {Partial<import("react-hook-form").FieldErrorsImpl<import("react-hook-form").DeepRequired<import("react-hook-form").FieldValues>>> & {root?: Record<string, import("react-hook-form").GlobalError> & import("react-hook-form").GlobalError}} props.errors
 * @param {import("react-hook-form").Control<any,any>} props.control
 * @param {import("react-hook-form").UseFormWatch<any>} props.watch
 * @param {import("../../scanning.js").Group[]} props.userAccessibleGroups
 * @param {React.MutableRefObject<any>} props.modal
 * @returns {JSX.Element}
 */
export const ScanningOptionsDiscarding = ({
  register,
  errors,
  control,
  watch,
  userAccessibleGroups,
  modal,
}) => {
  /** @type {import("../../scanning.js").Group[]} */
  const junkGroups = watch("junkGroups").map(
    (/** @type {string[]} */ groupId) =>
      userAccessibleGroups.find((group) => group.id === +groupId),
  );
  return (
    <fieldset className="discarding-section">
      <legend>Discarding</legend>
      <div className="junk-group">
        <IonChip id="add-junk" className="add">
          <IonLabel>Add</IonLabel>
          <IonIcon icon={add} color="light"></IonIcon>
        </IonChip>
        {watch("junkGroups")
          .map((/** @type {string} */ groupId) =>
            userAccessibleGroups.find((group) => group.id === +groupId),
          )
          .map((/** @type {import("../../scanning.js").Group} */ group) => (
            <IonChip key={group.id}>{group.name}</IonChip>
          ))}
        <IonModal
          ref={modal}
          trigger="add-junk"
          isOpen={false}
          onDidDismiss={() => {}}
        >
          <ControlledMultiSearchSelect
            name="junkGroups"
            control={control}
            modal={modal}
            title="Select junk groups"
            items={userAccessibleGroups.map((group) => ({
              text: group.name,
              value: `${group.id}`,
            }))}
          />
        </IonModal>
      </div>
      {watch("junkGroups").length > 0 && (
        <div className="discard-behavior">
          <IonLabel>Discard button behavior</IonLabel>
          <ControlledRadioGroup
            name="discardBehavior"
            control={control}
            rules={{
              validate: (value, formValues) => {
                if (value !== "specific" && formValues.junkGroups.length < 2) {
                  return '"Save to a specific junk group" is the only valid option when there are less than 2 junk groups selected';
                }
                return true;
              },
            }}
          >
            <IonRadio
              value="specific"
              labelPlacement="end"
              disabled={watch("junkGroups").length < 2}
            >
              Save to a specific junk group
            </IonRadio>
            <br />
            <IonRadio
              value="all"
              labelPlacement="end"
              disabled={watch("junkGroups").length < 2}
            >
              Save to a all junk groups
            </IonRadio>
            <br />
            <IonRadio
              value="ask"
              labelPlacement="end"
              disabled={watch("junkGroups").length < 2}
            >
              Ask every time
            </IonRadio>
          </ControlledRadioGroup>
          {junkGroups.length >= 2 &&
            watch("discardBehavior")(
              <div className="discard-group-selection">
                <IonLabel>Discard to:</IonLabel>
                <IonSelect
                  justify="end"
                  aria-label="Discard to:"
                  placeholder="Select junk group to discard to"
                  {...register("discardGroup")}
                >
                  {junkGroups.map(
                    (
                      /** @type {import("../../scanning.js").Group} */ group,
                    ) => (
                      <IonSelectOption key={group.id} value={group.id}>
                        {group.name}
                      </IonSelectOption>
                    ),
                  )}
                </IonSelect>
              </div>,
            )}
        </div>
      )}
      <div className="error-container">
        <ErrorMessage errors={errors} name="discardBehavior" />
      </div>
    </fieldset>
  );
};
