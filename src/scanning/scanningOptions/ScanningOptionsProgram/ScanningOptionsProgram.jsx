import "./ScanningOptionsProgram.scss";
import { IonChip, IonIcon, IonLabel, IonModal, IonToggle } from "@ionic/react";
import { add } from "ionicons/icons";
import { ControlledMultiSearchSelect } from "../../../common/TypeAhead/ControlledMultiSearchSelect.jsx";
import { Controller } from "react-hook-form";
import { CandidateFiltering } from "../CandidateFiltering/CandidateFiltering.jsx";

/**
 * Program selection section of the scanning options
 * @param {Object} props
 * @param {import("../../scanning.js").Group[]} props.selectedGroups
 * @param {(selectedGroupIds: string[]) => void} props.onSelectedGroupsChange
 * @param {import("../../scanning.js").Group[]} props.userAccessibleGroups
 * @param {React.MutableRefObject<any>} props.modal
 * @param {import("react-hook-form").Control<any,any>} props.control
 * @param {import("react-hook-form").UseFormWatch<any>} props.watch
 * @param {import("react-hook-form").UseFormRegister<any>} props.register
 * @param {Partial<import("react-hook-form").FieldErrorsImpl<import("react-hook-form").DeepRequired<import("react-hook-form").FieldValues>>> & {root?: Record<string, import("react-hook-form").GlobalError> & import("react-hook-form").GlobalError}} props.errors
 * @returns {JSX.Element}
 */
export const ScanningOptionsProgram = ({
  selectedGroups,
  onSelectedGroupsChange,
  userAccessibleGroups,
  modal,
  control,
  watch,
  register,
  errors,
}) => {
  return (
    <fieldset className="program-section">
      <legend>Program selection</legend>
      <div className="selected-groups">
        <IonChip id="add-group" className="add">
          <IonLabel>Add</IonLabel>
          <IonIcon icon={add} color="light"></IonIcon>
        </IonChip>
        {watch("selectedGroups")
          .map((/** @type {string} */ groupId) =>
            userAccessibleGroups.find((group) => group.id === +groupId),
          )
          .map((/** @type {import("../../scanning.js").Group} */ group) => (
            <IonChip key={group.id}>{group.name}</IonChip>
          ))}
        <IonModal
          ref={modal}
          trigger="add-group"
          isOpen={false}
          onDidDismiss={() => {}}
        >
          <ControlledMultiSearchSelect
            control={control}
            modal={modal}
            items={userAccessibleGroups.map((group) => ({
              value: `${group.id}`,
              text: group.name,
            }))}
            selectedItems={selectedGroups.map((group) => `${group.id}`)}
            onSelectedItemsChange={onSelectedGroupsChange}
          />
        </IonModal>
      </div>
      <Controller
        control={control}
        name="filterCandidates"
        render={({ field: { onChange, onBlur, disabled } }) => (
          <IonToggle
            onIonChange={(e) => onChange(e.detail.checked)}
            onIonBlur={onBlur}
            disabled={disabled}
          >
            Filtering
          </IonToggle>
        )}
      />
      {watch("filterCandidates") && (
        <CandidateFiltering register={register}></CandidateFiltering>
      )}
      <div className="error-container">
        {errors["filteringType"] && (
          // @ts-ignore
          <p className="error">{errors["filteringType"].message}</p>
        )}
        {errors["filteringAnyOrAll"] && (
          // @ts-ignore
          <p className="error">{errors["filteringAnyOrAll"].message}</p>
        )}
        {errors["selectedGroups"] && (
          // @ts-ignore
          <p className="error">{errors["selectedGroups"].message}</p>
        )}
      </div>
    </fieldset>
  );
};
