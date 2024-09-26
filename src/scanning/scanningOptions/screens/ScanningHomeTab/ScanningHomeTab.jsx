import { IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/react";
import { RecentProfiles } from "../../components/RecentProfiles/RecentProfiles.jsx";

export const ScanningHomeTab = () => {
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
