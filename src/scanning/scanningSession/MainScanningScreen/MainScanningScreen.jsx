import { IonContent, IonPage } from "@ionic/react";
import { CandidateScanner } from "../CandidateScanner/CandidateScanner.jsx";
import { Suspense } from "react";

export const MainScanningScreen = () => {
  return (
    <IonPage>
      <IonContent>
        <Suspense fallback={<p>Loading...</p>}>
          <CandidateScanner />
        </Suspense>
      </IonContent>
    </IonPage>
  );
};
