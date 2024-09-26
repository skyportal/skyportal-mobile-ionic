import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { ScanningProfileCreator } from "../../components/ScanningProfileCreator/ScanningProfileCreator.jsx";
import { useHistory } from "react-router";

export const ScanningNewProfileScreen = () => {
  const history = useHistory();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonButton onClick={() => history.replace("/app/scanning")}>
              Cancel
            </IonButton>
          </IonButtons>
          <IonTitle>New profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <ScanningProfileCreator />
      </IonContent>
    </IonPage>
  );
};
