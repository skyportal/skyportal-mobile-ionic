import "./ScanningOptionsScreen.scss";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { ScanningOptionsForm } from "../ScanningOptionsForm/ScanningOptionsForm.jsx";
import React, { Suspense } from "react";

export const ScanningOptionsScreen = () => {
  return (
    <IonPage className="scanning-options-screen">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Scanning options</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Suspense
          fallback={
            <div className="scanning-option-loading">
              <IonSpinner />
            </div>
          }
        >
          <div className="scanning-options-container">
            <ScanningOptionsForm />
          </div>
        </Suspense>
      </IonContent>
    </IonPage>
  );
};
