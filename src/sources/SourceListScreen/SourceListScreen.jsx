import "./SourceListScreen.scss";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Suspense } from "react";
import { SourceList } from "../SourceList/SourceList.jsx";

export const SourceListScreen = () => {
  return (
    <IonPage className="source-list-screen">
      <IonContent>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Sources</IonTitle>
          </IonToolbar>
        </IonHeader>
        <Suspense fallback={<p>Loading...</p>}>
          <SourceList />
        </Suspense>
      </IonContent>
    </IonPage>
  );
};
