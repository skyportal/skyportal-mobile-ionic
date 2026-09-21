import {
  IonCheckbox,
  IonContent,
  IonItem,
  IonList,
  IonSearchbar,
  IonText
} from "@ionic/react";
import { IonModal } from "@ionic/react";
import { useState } from "react";
import { useUserAccessibleGroups } from "../../../common/common.hooks.js";

/**
 * Picks the groups a comment is restricted to, public when none is selected.
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {number[]} props.groupIds
 * @param {(groupIds: number[]) => void} props.onChange
 * @param {() => void} props.onClose
 * @returns {JSX.Element}
 */
export const CommentGroupsModal = ({ isOpen, groupIds, onChange, onClose }) => {
  const [filter, setFilter] = useState("");
  const { userAccessibleGroups } = useUserAccessibleGroups();

  const matching = (userAccessibleGroups ?? []).filter((group) =>
    group.name.toLowerCase().includes(filter.toLowerCase())
  );

  /** @param {number} groupId */
  const toggle = (groupId) =>
    onChange(
      groupIds.includes(groupId)
        ? groupIds.filter((id) => id !== groupId)
        : [...groupIds, groupId]
    );

  return (
    <IonModal
      className="comment-groups-modal"
      isOpen={isOpen}
      onDidDismiss={onClose}
      initialBreakpoint={0.75}
      breakpoints={[0, 0.75, 1]}
    >
      <IonContent>
        <IonSearchbar
          placeholder="Filter groups"
          value={filter}
          onIonInput={(e) => setFilter(`${e.detail.value ?? ""}`)}
        />
        <div className="groups-hint">
          <IonText color="secondary">
            {groupIds.length
              ? `shared with ${groupIds.length} group${groupIds.length > 1 ? "s" : ""}`
              : "public if no group is selected"}
          </IonText>
        </div>
        <IonList>
          {matching.map((group) => (
            <IonItem key={group.id}>
              <IonCheckbox
                checked={groupIds.includes(group.id)}
                onIonChange={() => toggle(group.id)}
              >
                {group.name}
              </IonCheckbox>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonModal>
  );
};
