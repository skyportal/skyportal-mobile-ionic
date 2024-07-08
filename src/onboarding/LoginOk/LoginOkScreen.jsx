import { IonContent, IonIcon, IonPage } from "@ionic/react";
import "./LoginOkScreen.scss";
import { checkmarkCircleSharp } from "ionicons/icons";
import { useEffect } from "react";
import { useHistory } from "react-router";
import { useUser } from "../../common/hooks.js";

export const LoginOkScreen = () => {
  const history = useHistory();
  const { user } = useUser();

  useEffect(() => {
    /** @type {any} */
    let timer;
    if (user) {
      timer = setTimeout(() => {
        history.replace("/app");
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [user]);

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
            <p className="welcome-hint">Welcome back {user?.first_name}! 😄</p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
