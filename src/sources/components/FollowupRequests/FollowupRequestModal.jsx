import "./FollowupRequestModal.scss";
import { formatDateTime } from "../../../common/common.lib.js";
import {
  IonButton,
  IonButtons, IonChip,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonModal,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import {IonList} from "@ionic/react";

/** @typedef {import("../../sources.lib.js").FollowupRequest} FollowupRequest */

/**
 * Followup request modal component
 * @param {Object} props
 * @param {FollowupRequest | null} props.followupRequest
 * @param {Function} props.setOpenFollowupRequest
 * @returns {JSX.Element}
 */
export const FollowupRequestModal = ({followupRequest, setOpenFollowupRequest}) => {
  return (
    <IonModal
      isOpen={followupRequest !== null}
      onDidDismiss={() => setOpenFollowupRequest(null)}
      className="followup-request-modal"
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>{followupRequest?.allocation?.instrument?.name}</IonTitle>
          <IonButtons slot="secondary">
            <IonButton onClick={() => setOpenFollowupRequest(null)}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {followupRequest && (
          <IonList inset lines="full" color="light">
            <IonItem color="light">
              <IonLabel className="field">Requester:</IonLabel>
              <IonLabel color="primary">{followupRequest.requester?.username}</IonLabel>
            </IonItem>
            <IonItem color="light">
              <IonLabel className="field">Group:</IonLabel>
              <IonLabel>{followupRequest.allocation?.group?.name}</IonLabel>
            </IonItem>
            <IonItem color="light">
              <IonLabel className="field">PI:</IonLabel>
              <IonLabel>{followupRequest.allocation?.pi}</IonLabel>
            </IonItem>
            <IonItem color="light">
              <IonLabel className="field">Start date:</IonLabel>
              <IonLabel>{formatDateTime(followupRequest.payload?.start_date)}</IonLabel>
            </IonItem>
            <IonItem color="light">
              <IonLabel className="field">End date:</IonLabel>
              <IonLabel>{formatDateTime(followupRequest.payload?.end_date)}</IonLabel>
            </IonItem>
            <IonItem color="light">
              <IonLabel className="field">Filters:</IonLabel>
              <IonLabel>
                {followupRequest.payload?.filters?.map((filter) =>
                    <IonChip key={filter} color="primary">
                      {filter}
                    </IonChip>
                )}
              </IonLabel>
            </IonItem>
            <IonItem color="light">
              <IonLabel className="field">Priority:</IonLabel>
              <IonLabel>{followupRequest.payload?.priority}</IonLabel>
            </IonItem>
            <IonItem color="light">
              <IonLabel className="field">Status:</IonLabel>
              <IonLabel>{followupRequest.status}</IonLabel>
            </IonItem>
          </IonList>
        )}
      </IonContent>
    </IonModal>
  );
};
