import "./ScanningOptionsDiscarding.scss";
import { IonButton, IonChip, IonIcon, IonLabel, IonModal } from "@ionic/react";
import { create } from "ionicons/icons";
import { SingleSearchSelect } from "../../../common/SingleSearchSelect/SingleSearchSelect.jsx";

/**
 * Discarding section of the scanning options
 * @param {Object} props
 * @param {import("../../scanning.js").Group} props.junkGroup
 * @param {import("../../scanning.js").Group[]} props.userAccessibleGroups
 * @param {React.MutableRefObject<any>} props.modal
 * @param {(selectedGroupId: string) => void} props.junkGroupSelectionChange
 * @returns {JSX.Element}
 */
export const ScanningOptionsDiscarding = ({
  junkGroup,
  userAccessibleGroups,
  modal,
  junkGroupSelectionChange,
}) => {
  return (
    <fieldset className="discarding-section">
      <legend>Discarding</legend>
      <div className="junk-group">
        <IonLabel>Junk group:</IonLabel>
        {junkGroup !== null ? (
          <>
            <IonChip id="selectJunkGroup" className="add">
              <IonLabel> {junkGroup.name}</IonLabel>
              <IonIcon icon={create} color="light"></IonIcon>
            </IonChip>
          </>
        ) : (
          <IonButton id="selectJunkGroup" size="small" fill="outline">
            Select group
          </IonButton>
        )}
        <IonModal
          ref={modal}
          trigger="selectJunkGroup"
          isOpen={false}
          onDidDismiss={() => {}}
        >
          <SingleSearchSelect
            title="Select junk group"
            items={userAccessibleGroups.map((group) => ({
              value: `${group.id}`,
              text: group.name,
            }))}
            onSelectionCancel={() => modal.current?.dismiss()}
            onSelectionChange={junkGroupSelectionChange}
            previouslySelectedItem={junkGroup?.id?.toString() ?? null}
          ></SingleSearchSelect>
        </IonModal>
      </div>
    </fieldset>
  );
};
