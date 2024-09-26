import {
  IonBadge,
  IonChip,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel
} from "@ionic/react";
import { trash } from "ionicons/icons";
import { useRef } from "react";

/**
 * @param {Object} props
 * @param {import("../../../../onboarding/onboarding.lib.js").ScanningProfile} props.profile
 * @param {import("../../../scanning.lib.js").Group[]} props.userAccessibleGroups
 * @param {boolean} [props.itemSliding=false]
 * @param {() => void} [props.onClick]
 * @param {(profile: import("../../../../onboarding/onboarding.lib.js").ScanningProfile) => void} [props.onDelete]
 * @returns {JSX.Element}
 */
export const ProfileListItem = ({
  profile,
  userAccessibleGroups,
  itemSliding = false,
  onClick = () => {},
  onDelete = () => {},
}) => {
  /** @type {React.MutableRefObject<any>} */
  const ionItemSlidingRef = useRef(null);
  const handleDrag = (/** @type {any} **/ event) => {
    if (event.detail.ratio > 2.5) {
      handleDelete();
    }
  };

  const handleDelete = () => {
    ionItemSlidingRef.current.close();
    onDelete(profile);
  };

  return (
    <IonItemSliding
      key={profile.name}
      onIonDrag={handleDrag}
      ref={ionItemSlidingRef}
      disabled={!itemSliding}
    >
      <IonItem color="light" onClick={onClick} button>
        <IonLabel>
          {profile.name}
          <p>
            {profile.groupIDs
              .map(
                (id) =>
                  userAccessibleGroups.find((group) => group.id === id)?.name,
              )
              .filter((name) => name)
              .map((name) => (
                <IonChip color="secondary" key={name}>
                  {name}
                </IonChip>
              ))}
          </p>
        </IonLabel>
        {profile.default && (
          <IonBadge color="secondary" slot="end">
            Default
          </IonBadge>
        )}
      </IonItem>
      <IonItemOptions slot="end">
        <IonItemOption color="danger" expandable>
          <IonIcon
            slot="icon-only"
            onClick={handleDelete}
            icon={trash}
          ></IonIcon>
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};
