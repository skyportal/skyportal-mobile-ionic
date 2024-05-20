import { IonContent, IonIcon, IonPage } from "@ionic/react";
import "./LoginOkScreen.scss";
import { checkmarkCircleSharp } from "ionicons/icons";
import { useContext } from "react";
import { AppContext } from "../../lib/context.js";

export const LoginOkScreen = () => {
  const { userInfo, setUserInfo } = useContext(AppContext);

  return (
    <IonPage>
      <IonContent>
        <div className="content">
          <IonIcon
            className="check-icon"
            icon={checkmarkCircleSharp}
            color="success"
          />
          <div className="text">
            <p className="success-hint">Connected successfully</p>
            <p className="welcome-hint">Welcome back {userInfo.name}! 😄</p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
