import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { ScanningProfiles } from "../ScanningProfiles/ScanningProfiles.jsx";

export const ScanningHome = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Candidates</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <ScanningProfiles />
      </IonContent>
    </IonPage>
  );
};
