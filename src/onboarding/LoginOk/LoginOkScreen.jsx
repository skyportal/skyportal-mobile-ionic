import { IonContent, IonIcon, IonPage } from "@ionic/react";
import "./LoginOkScreen.scss";
import { checkmarkCircleSharp } from "ionicons/icons";
import { useContext, useEffect } from "react";
import { AppContext } from "../../util/context.js";
import { useHistory } from "react-router";

export const LoginOkScreen = () => {
  const { userInfo } = useContext(AppContext);
  const history = useHistory();

  useEffect(() => {
    setTimeout(() => {
      history.push("/app");
    }, 2000);
  }, []);

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
