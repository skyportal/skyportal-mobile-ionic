import "./ScanningOptionsScreen.scss";
import {
  IonButton,
  IonButtons,
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
          <IonButtons slot="start">
            <IonButton routerLink="/app/scanning" routerDirection="back">
              Exit
            </IonButton>
          </IonButtons>
          <IonTitle>Scanning options</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent force-overscroll="false">
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
