import { IonContent, IonPage } from "@ionic/react";
import OnboardingUpper from "../../components/OnboardingUpper/OnboardingUpper.jsx";
import OnboardingLower from "../../components/OnboardingLower/OnboardingLower.jsx";
import "./OnboardingScreen.scss";
import { useState } from "react";

const OnboardingScreen = () => {
  /** @type {[import("../../onboarding.lib.js").OnboardingPage, Function]} */
  const [page, setPage] = useState("welcome");
  return (
    <IonPage>
      <IonContent class="onboarding-screen-content">
        <div className="onboarding-screen-container">
          <OnboardingUpper page={page} />
          <OnboardingLower page={page} setPage={setPage} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OnboardingScreen;
