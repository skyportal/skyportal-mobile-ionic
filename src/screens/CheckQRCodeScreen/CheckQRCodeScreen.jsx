import { IonContent, IonPage, IonSpinner } from "@ionic/react";
import "./CheckQRCodeScreen.scss";
import { useHistory, useLocation } from "react-router";
import { useContext, useEffect } from "react";
import { checkToken } from "../../lib/auth.js";
import { AppContext } from "../../lib/context.js";
import { Capacitor } from "@capacitor/core";

export const CheckQRCodeScreen = () => {
  const history = useHistory();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const { userInfo, setUserInfo } = useContext(AppContext);
  useEffect(() => {
    const platform = Capacitor.getPlatform();
    checkToken(token, userInfo.instance, platform).then((res) => {
      setUserInfo({ ...userInfo, name: res.first_name });
      history.push("/login-ok");
    });
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
