import "./ScanningOptionsProgram.scss";
import {
  IonButton,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonToggle,
} from "@ionic/react";
import { pencil } from "ionicons/icons";
import { ControlledMultiSearchSelect } from "../../../common/MultiSearchSelect/ControlledMultiSearchSelect.jsx";
import { Controller } from "react-hook-form";
import { CandidateFiltering } from "../CandidateFiltering/CandidateFiltering.jsx";
import { ErrorMessageContainer } from "../../../common/ErrorMessageContainer/ErrorMessageContainer.jsx";

/**
 * Program selection section of the scanning options
 * @param {Object} props
 * @param {import("../../scanning.lib.js").Group[]} props.userAccessibleGroups
 * @param {React.MutableRefObject<any>} props.modal
 * @param {import("react-hook-form").Control<any,any>} props.control
 * @param {import("react-hook-form").UseFormWatch<any>} props.watch
 * @param {import("react-hook-form").UseFormRegister<any>} props.register
 * @param {Partial<import("react-hook-form").FieldErrorsImpl<import("react-hook-form").DeepRequired<import("react-hook-form").FieldValues>>> & {root?: Record<string, import("react-hook-form").GlobalError> & import("react-hook-form").GlobalError}} props.errors
 * @returns {JSX.Element}
 */
export const ScanningOptionsProgram = ({
  userAccessibleGroups,
  modal,
  control,
  watch,
  register,
  errors,
}) => {
  return (
    <div className="form-section">
      <IonLabel className="form-list-header">Program selection</IonLabel>
      <IonList className="program-section" lines="full" inset>
        <IonItem
          lines={watch("selectedGroups")?.length ?? 0 > 0 ? "none" : "full"}
        >
          <IonLabel>
            Programs
            <p>
              {watch("selectedGroups")?.length ?? 0} program
              {watch("selectedGroups")?.length > 1 && "s"} selected
            </p>
          </IonLabel>

          <IonButton id="add-group" fill="clear">
            Edit
            <IonIcon icon={pencil} slot="end"></IonIcon>
          </IonButton>
        </IonItem>
        {watch("selectedGroups").length > 0 && (
          <IonItem>
            {watch("selectedGroups")
              .map((/** @type {string} */ groupId) =>
                userAccessibleGroups.find((group) => group.id === +groupId),
              )
              .map(
                (
                  /** @type {import("../../scanning.lib.js").Group} */ group,
                ) => (
                  <IonChip key={group.id}>{group.name}</IonChip>
                ),
              )}
          </IonItem>
        )}
        <IonItem>
          <Controller
            control={control}
            name="filterCandidates"
            render={({ field: { onChange, onBlur, disabled, value } }) => (
              <IonToggle
                justify="space-between"
                onIonChange={(e) => {
                  e.preventDefault();
                  onChange(e.detail.checked);
                }}
                onIonBlur={onBlur}
                disabled={disabled}
                checked={value}
              >
                <IonLabel>Filtering</IonLabel>
              </IonToggle>
            )}
          />
        </IonItem>
        {watch("filterCandidates") && (
          <CandidateFiltering register={register}></CandidateFiltering>
        )}
      </IonList>
      <ErrorMessageContainer
        errors={errors}
        errorNames={[
          "selectedGroups",
          "filterCandidates",
          "filteringType",
          "filteringAnyOrAll",
        ]}
      />
      <IonModal
        ref={modal}
        trigger="add-group"
        isOpen={false}
        onDidDismiss={() => {}}
      >
        <ControlledMultiSearchSelect
          control={control}
          name="selectedGroups"
          modal={modal}
          title="Select groups"
          items={userAccessibleGroups.map((group) => ({
            value: `${group.id}`,
            text: group.name,
          }))}
          rules={{
            required: true,
          }}
        />
      </IonModal>
    </div>
  );
};
