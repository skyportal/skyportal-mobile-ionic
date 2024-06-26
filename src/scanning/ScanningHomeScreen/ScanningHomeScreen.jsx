import "./ScanningHomeScreen.scss";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router";

export const ScanningHomeScreen = () => {
  const history = useHistory();
  return (
    <IonPage>
      <IonContent>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Scanning</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="scanning-home-screen-content">
          <IonButton
            size="large"
            onClick={() => history.push("/app/scanning-options")}
          >
            Start scanning
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};
