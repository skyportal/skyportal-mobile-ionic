import "./MainScanningScreen.scss";
import { IonContent, IonPage, IonSpinner } from "@ionic/react";
import { CandidateScanner } from "../CandidateScanner/CandidateScanner.jsx";
import React, { Suspense } from "react";

export const MainScanningScreen = () => {
  return (
    <IonPage className="main-scanning-screen">
      <IonContent>
        <Suspense
          fallback={
            <div
              className="scanning-main-loading"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <IonSpinner />
            </div>
          }
        >
          <CandidateScanner />
        </Suspense>
      </IonContent>
    </IonPage>
  );
};
