import { IonContent, IonPage, IonSpinner } from "@ionic/react";
import "./CheckQRCodeScreen.scss";
import { useLocation } from "react-router";
import { useContext, useEffect } from "react";
import { checkToken } from "../../lib/auth.js";
import { AppContext } from "../../lib/context.js";

export const CheckQRCodeScreen = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const { userInfo, setUserInfo } = useContext(AppContext);
  useEffect(() => {
    checkToken(token, userInfo.instance).then(console.log);
  }, []);
  return (
    <IonPage>
      <IonContent>
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <IonSpinner />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CheckQRCodeScreen;
