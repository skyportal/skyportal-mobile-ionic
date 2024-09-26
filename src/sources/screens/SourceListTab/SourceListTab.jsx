import "./SourceListTab.scss";
import { IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/react";
import { Suspense } from "react";
import { SourceList } from "../../components/SourceList/SourceList.jsx";

export const SourceListTab = () => {
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Sources</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Suspense fallback={<p>Loading...</p>}>
          <SourceList />
        </Suspense>
      </IonContent>
    </>
  );
};
