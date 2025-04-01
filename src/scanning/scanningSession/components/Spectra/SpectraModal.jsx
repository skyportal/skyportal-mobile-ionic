import "./SpectraModal.scss"
import { formatDateTime } from "../../../../common/common.lib.js";
import {
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonModal,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import {IonList} from "@ionic/react";

/** @typedef {import("../../../scanning.lib.js").Spectra} Spectra */

/**
 * Followup request modal component
 * @param {Object} props
 * @param {Spectra | null} props.spectra
 * @param {Function} props.setOpenSpectra
 * @returns {JSX.Element}
 */
export const SpectraModal = ({spectra, setOpenSpectra}) => {
  return (
    <IonModal
      isOpen={spectra !== null}
      onDidDismiss={() => setOpenSpectra(null)}
      className="spectra-modal"
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle slot="start">Spectra from {spectra?.instrument_name}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setOpenSpectra(null)}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {spectra && (
          <IonList inset lines="full" color="light">
            <IonItem color="light">
              <IonLabel className="field">Id:</IonLabel>
              <IonLabel color="primary">{spectra.id}</IonLabel>
            </IonItem>
            <IonItem color="light">
              <IonLabel className="field">Observed at:</IonLabel>
              <IonLabel>{formatDateTime(spectra.observed_at)}</IonLabel>
            </IonItem>
            <IonItem color="light">
              <IonLabel className="field">Currently visible to:</IonLabel>
              <IonLabel>
                {spectra.groups && spectra.groups.map((group) =>
                  <IonChip key={group.id} color="primary">
                    {group.name}
                  </IonChip>
                )}
              </IonLabel>
            </IonItem>
            <IonItem color="light">
              <IonLabel className="field">Uploaded by:</IonLabel>
              <IonLabel>{spectra.owner?.username}</IonLabel>
            </IonItem>
            <IonItem color="light">
              <IonLabel className="field">PI(s):</IonLabel>
              <IonLabel>
                {spectra.pis && spectra.pis.map((pi) =>
                  <IonChip key={pi.id} color="secondary">
                    {pi.username}
                  </IonChip>
                )}
              </IonLabel>
            </IonItem>
            <IonItem color="light">
              <IonLabel className="field">Reduced by:</IonLabel>
              <IonLabel>
                {spectra.reducers && spectra.reducers.map((reducer) =>
                  <IonChip key={reducer.id} color="primary">
                    {reducer.username}
                  </IonChip>
                )}
              </IonLabel>
            </IonItem>
            <IonItem color="light">
              <IonLabel className="field">Observed by:</IonLabel>
              <IonLabel>
                {spectra.observers && spectra.observers.map((observer) =>
                  <IonChip key={observer.id} color="secondary">
                    {observer.username}
                  </IonChip>
                )}
              </IonLabel>
            </IonItem>
            <IonItem color="light">
              <IonLabel className="field">Type:</IonLabel>
              <IonLabel>{spectra.type}</IonLabel>
            </IonItem>
          </IonList>
        )}
      </IonContent>
    </IonModal>
  );
};
