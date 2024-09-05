import "./ScanningHome.scss";
import { IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/react";
import { ScanningProfiles } from "../ScanningProfiles/ScanningProfiles.jsx";

export const ScanningHome = () => {
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Candidates</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent force-overscroll="false">
        <ScanningProfiles />
      </IonContent>
    </>
  );
};
