import { IonButton, IonIcon, IonSelect, IonSelectOption } from "@ionic/react";
import "./OnboardingLower.scss";
import { INSTANCES } from "../../lib/constants.js";
import { useState } from "react";
import { qrCode } from "ionicons/icons";

const OnboardingLower = ({ page }) => {
  const [instance, setInstance] = useState(null);
  if (page === "welcome")
    return (
      <div className="lower">
        <IonButton shape="round" size="large" strong>
          Log in
        </IonButton>
      </div>
    );
  else
    return (
      <div className="lower">
        <div className="instance-container">
          <IonSelect
            class="select"
            label={"Instance"}
            placeholder="Select an instance"
            onIonChange={(e) => setInstance(e.detail.value)}
          >
            {INSTANCES.map((instance) => (
              <IonSelectOption key={instance.name} value={instance}>
                {instance.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </div>
        <div className="login-methods">
          <IonButton shape="round" disabled={instance === null} strong>
            <IonIcon slot="start" icon={qrCode}></IonIcon>
            Scan QR code
          </IonButton>
          <IonButton shape="round" disabled={instance === null} strong>
            Log in with token
          </IonButton>
        </div>
      </div>
    );
};

export default OnboardingLower;
