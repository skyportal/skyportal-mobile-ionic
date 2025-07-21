import "./CandidateListScreen.scss";
import { IonContent, IonLoading, IonPage } from "@ionic/react";
import { CandidateList } from "../../components/CandidateList/CandidateList.jsx";
import React, { Suspense } from "react";

export const CandidateListScreen = () => {
  return (
    <IonPage className="candidate-list-screen">
      <IonContent forceOverscroll={false} className="content">
        <Suspense fallback={<IonLoading isOpen/>}>
          <CandidateList />
        </Suspense>
      </IonContent>
    </IonPage>
  );
};
