import "./ScanningOptionsDiscarding.scss";
import {
  IonButton,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { ControlledMultiSearchSelect } from "../../../common/MultiSearchSelect/ControlledMultiSearchSelect.jsx";
import { pencil } from "ionicons/icons";
import { ErrorMessageContainer } from "../../../common/ErrorMessageContainer/ErrorMessageContainer.jsx";

/**
 * Discarding section of the scanning options
 * @param {Object} props
 * @param {import("react-hook-form").UseFormRegister<any>} props.register
 * @param {Partial<import("react-hook-form").FieldErrorsImpl<import("react-hook-form").DeepRequired<import("react-hook-form").FieldValues>>> & {root?: Record<string, import("react-hook-form").GlobalError> & import("react-hook-form").GlobalError}} props.errors
 * @param {import("react-hook-form").Control<any,any>} props.control
 * @param {import("react-hook-form").UseFormWatch<any>} props.watch
 * @param {import("../../scanningLib.js").Group[]} props.userAccessibleGroups
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
  /** @type {import("../../scanningLib.js").Group[]} */
  const junkGroups = watch("junkGroups").map(
    (/** @type {string[]} */ groupId) =>
      userAccessibleGroups.find((group) => group.id === +groupId),
  );
  return (
    <div className="form-section">
      <IonList inset>
        <IonItem lines="none">
          <IonLabel>
            Junk groups
            <p>
              {junkGroups.length ?? 0} junk group
              {junkGroups.length > 1 && "s"} selected
            </p>
          </IonLabel>
          <IonButton id="add-junk" fill="clear">
            Edit<IonIcon slot="end" icon={pencil}></IonIcon>
          </IonButton>
        </IonItem>
        {junkGroups.length > 0 && (
          <IonItem>
            {junkGroups.map(
              (/** @type {import("../../scanningLib.js").Group} */ group) => (
                <IonChip key={group.id}>{group.name}</IonChip>
              ),
            )}
          </IonItem>
        )}
        {watch("junkGroups").length > 0 && (
          <>
            <IonItem>
              <IonSelect
                {...register("discardBehavior")}
                aria-label="discard behavior"
                value="specific"
                label="Save to"
                disabled={junkGroups.length < 2}
              >
                <IonSelectOption value="specific">
                  Specific junk group
                </IonSelectOption>
                <IonSelectOption value="all">All junk groups</IonSelectOption>
                <IonSelectOption value="ask">Always ask</IonSelectOption>
              </IonSelect>
            </IonItem>
            {junkGroups.length >= 2 &&
              watch("discardBehavior") === "specific" && (
                <IonItem className="discard-group-selection">
                  <IonSelect
                    justify="end"
                    aria-label="Discard to:"
                    placeholder="Select junk group to discard to"
                    {...register("discardGroup")}
                  >
                    {junkGroups.map(
                      (
                        /** @type {import("../../scanningLib.js").Group} */ group,
                      ) => (
                        <IonSelectOption key={group.id} value={group.id}>
                          {group.name}
                        </IonSelectOption>
                      ),
                    )}
                  </IonSelect>
                </IonItem>
              )}
          </>
        )}
      </IonList>
      <ErrorMessageContainer
        errors={errors}
        errorNames={["junkGroups", "discardBehavior", "discardGroup"]}
      />
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
  );
};
