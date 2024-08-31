import { IonContent, IonIcon, IonPage } from "@ionic/react";
import "./LoginOkScreen.scss";
import { checkmarkCircleSharp } from "ionicons/icons";
import { useContext, useEffect } from "react";
import { useHistory } from "react-router";
import { useUserProfile } from "../../common/hooks.js";
import { UserContext } from "../../common/context.js";

export const LoginOkScreen = () => {
  const history = useHistory();
  const userInfo = useContext(UserContext);
  const { userProfile } = useUserProfile(userInfo);

  useEffect(() => {
    /** @type {any} */
    let timer;
    if (userProfile) {
      timer = setTimeout(() => {
        history.replace("/app");
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [userProfile]);

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
            <p className="welcome-hint">
              Welcome back {userProfile?.first_name}! 😄
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
