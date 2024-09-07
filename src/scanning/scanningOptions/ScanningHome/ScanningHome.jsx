import "./ScanningHome.scss";
import { IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/react";
import { RecentProfiles } from "../RecentProfiles/RecentProfiles.jsx";

export const ScanningHome = () => {
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Candidates</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent force-overscroll="false">
        <RecentProfiles />
      </IonContent>
    </>
  );
};
