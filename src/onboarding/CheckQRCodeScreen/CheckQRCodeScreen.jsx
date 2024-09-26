import { IonContent, IonPage, IonSpinner } from "@ionic/react";
import "./CheckQRCodeScreen.scss";
import { useHistory, useLocation } from "react-router";
import { useContext, useEffect, useState } from "react";
import { fetchUserProfile } from "../common.onboarding.js";
import { useMutation } from "@tanstack/react-query";
import { UserContext } from "../../common/common.context.js";
import {
  QUERY_KEYS,
  QUERY_PARAMS,
  setPreference,
} from "../../common/common.lib.js";

export const CheckQRCodeScreen = () => {
  const history = useHistory();
  const location = useLocation();
  const { updateUserInfo } = useContext(UserContext);
  const params = new URLSearchParams(location.search);
  const [token] = useState(params.get(QUERY_PARAMS.TOKEN) ?? "");
  const [instanceParam] = useState(params.get(QUERY_PARAMS.INSTANCE) ?? "");
  const instance = JSON.parse(instanceParam);
  const loginMutation = useMutation({
    // @ts-ignore
    mutationFn: async (variables) => await fetchUserProfile(variables),
    onSuccess: async () => {
      await setPreference(QUERY_KEYS.USER_INFO, { token, instance });
      updateUserInfo({ token, instance });
      history.replace("/login-ok");
    },
    onError: (error) => {
      console.error(error);
    },
  });
  useEffect(() => {
    // @ts-ignore
    loginMutation.mutate({ token, instance });
  }, [token, instanceParam]);

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
