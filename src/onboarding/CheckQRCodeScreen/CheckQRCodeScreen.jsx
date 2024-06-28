import { IonContent, IonPage, IonSpinner } from "@ionic/react";
import "./CheckQRCodeScreen.scss";
import { useHistory, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { checkTokenAndFetchUser } from "../auth.js";
import { PREFERENCES, QUERY_PARAMS } from "../../util/constants.js";
import { setPreference } from "../../util/preferences.js";
import { useMutation } from "@tanstack/react-query";

export const CheckQRCodeScreen = () => {
  const history = useHistory();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [token] = useState(params.get(QUERY_PARAMS.TOKEN) ?? "");
  const [instanceParam] = useState(params.get(QUERY_PARAMS.INSTANCE) ?? "");
  const instance = JSON.parse(instanceParam);
  const loginMutation = useMutation({
    // @ts-ignore
    mutationFn: async (variables) => await checkTokenAndFetchUser(variables),
    onSuccess: async (data) => {
      await setPreference({
        key: PREFERENCES.USER_INFO,
        value: { token, instance },
      });
      await setPreference({ key: PREFERENCES.USER, value: data });
      history.push("/login-ok");
    },
    onError: (error) => {
      console.error(error);
    },
  });
  useEffect(() => {
    // @ts-ignore
    loginMutation.mutate({ token, instance: instance.url });
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
