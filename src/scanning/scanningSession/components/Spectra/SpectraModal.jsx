import "./SpectraModal.scss"
import { formatDateTime } from "../../../../common/common.lib.js";
import {
  IonButton,
  IonButtons,
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
          <IonTitle slot="start">Spectra from {spectra?.instrument?.name}</IonTitle>
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
          </IonList>
        )}
      </IonContent>
    </IonModal>
  );
};
