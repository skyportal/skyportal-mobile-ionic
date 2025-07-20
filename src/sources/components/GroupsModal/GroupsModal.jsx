import {
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import React from "react";

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {import("../../sources.lib.js").Group[]} props.groups
 * @param {React.RefObject<HTMLIonModalElement>} props.modal
 */
export const GroupsModal = ({ title, groups, modal }) => {
  return (
    <IonModal ref={modal}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title || "Groups"}</IonTitle>
          <IonButtons slot="primary">
            <IonButton onClick={() => modal.current?.dismiss()}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {groups?.length ? (
          groups.map((group) => (
            <IonChip key={group.name} color="secondary">
              {group.name}
            </IonChip>
          ))
        ) : (
          <p>No groups</p>
        )}
      </IonContent>
    </IonModal>
  );
}
