import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import OnboardingUpper from "../../components/OnboardingUpper/OnboardingUpper.jsx";
import OnboardingLower from "../../components/OnboardingLower/OnboardingLower.jsx";
import "./OnboardingScreen.scss";
import { useState } from "react";
import { chevronBackOutline } from "ionicons/icons";

const OnboardingScreen = () => {
  /** @type {[import("../../onboarding.lib.js").OnboardingPage, Function]} */
  const [page, setPage] = useState("welcome");
  return (
    <IonPage>
      <IonContent class="onboarding-screen-content">
        <div className="onboarding-screen-container">
          { // @ts-ignore
            page === "type_token" && (
              <IonButton
                fill="clear"
                onClick={() => setPage("login")}
                style={{
                  position: "absolute",
                  top: "3.5rem",
                  left: "0",
                }}
              >
                <IonIcon icon={chevronBackOutline} size="large" />
              </IonButton>
            )
          }
          <OnboardingUpper page={page} />
          <OnboardingLower page={page} setPage={setPage} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OnboardingScreen;
