import "./ScanningOptionsScreen.scss";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { ScanningOptionsForm } from "../ScanningOptionsForm/ScanningOptionsForm.jsx";

export const ScanningOptionsScreen = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Scanning options</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="scanning-options-container">
          <ScanningOptionsForm />
        </div>
      </IonContent>
    </IonPage>
  );
};
