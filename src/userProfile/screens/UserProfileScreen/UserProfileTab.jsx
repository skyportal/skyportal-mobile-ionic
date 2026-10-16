import {
  IonAvatar,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonLoading, IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonToast
} from "@ionic/react";
import "./UserProfileTab.scss";
import { useErrorToast, useUserProfile } from "../../../common/common.hooks.js";
import React, { useContext } from "react";
import { AppContext, UserContext } from "../../../common/common.context.js";
import { logOutOutline, personCircle, swapHorizontal, warningOutline } from "ionicons/icons";
import { useMutation } from "@tanstack/react-query";
import {
  clearPreference,
  QUERY_KEYS,
  setDarkModeInDocument,
  setPreference,
} from "../../../common/common.lib.js";
import { getAllInstances, login } from "../../../onboarding/onboarding.lib.js";
import { useHistory } from "react-router";

export const UserProfileTab = () => {
  const history = useHistory();
  const errorToast = useErrorToast();
  const { userProfile } = useUserProfile();
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const { darkMode, updateDarkMode } = useContext(AppContext);
  const { userInfo, updateUserInfo } = useContext(UserContext);
  const [loading, setLoading] = React.useState(false);
  const instances = getAllInstances();

  const darkModeMutation = useMutation({
    mutationFn:
      /**
       * @param {Object} params
       * @param {"auto"|"light"|"dark"} params.newDarkMode
       * @returns {Promise<*>}
       */
      async ({ newDarkMode }) => {
        await setPreference(QUERY_KEYS.APP_PREFERENCES, {
          darkMode: newDarkMode,
        });
        return newDarkMode;
      },
    onSuccess: (newDarkMode) => {
      setDarkModeInDocument(newDarkMode);
      updateDarkMode(newDarkMode);
    },
  });

  const onDarkModeChange = (/** @type {any} */ e) => {
    darkModeMutation.mutate({ newDarkMode: e.target.value });
  };

  const onInstanceChange = async (/** @type {any} */ e) => {
    const instance = e.target.value;
    if (!instance || !instance.token) {
      presentToast({
        header: "No token available for this instance",
        message: "You need to disconnect from this instance to proceed.",
        duration: 2000,
        position: "top",
        color: "warning",
        icon: warningOutline,
      }).then()
      disconnect();
    }else{
      try {
        setLoading(true);
        await login(instance, instance.token, history, updateUserInfo);
        setLoading(false);
      } catch (/** @type {any} */ error) {
        setLoading(false);
        errorToast(error?.message || "Error trying to log in to the instance");
      }
    }
  }

  // use the hash of the username (which is in the gravatarUrl) to
  // select a unique color for this user
  const bgColor = () => {
    if (userProfile && userProfile.gravatar_url) {
      const splitUrl = userProfile.gravatar_url.split("/");
      const hash = splitUrl[splitUrl.length - 1];
      if (hash.length >= 6) {
        return `#${hash.slice(0, 6)}aa`;
      }
    }
    return "#aaaaaaaa";
  };

  const disconnect = async () => {
    await presentAlert({
      header: "Disconnect?",
      message: "Do you want to disconnect from this instance?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: async () => {
            await clearPreference(QUERY_KEYS.USER_INFO);
            updateUserInfo({ token: "", instance: { url: "", name: "" } });
          },
        },
      ],
    });
  };

  const avatarSize = "90";
  return (
    <IonPage className="profile-tab">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={loading} />
        {userProfile ? (
          <div className="profile-container">
            <div>
              <div className="profile-top">
                <IonAvatar
                  slot="start"
                  className="profile-avatar"
                  style={{ width: `${avatarSize}px`, height: `${avatarSize}px` }}
                >
                  <IonIcon
                    icon={personCircle}
                    className="placeholder-avatar"
                    style={{ color: bgColor(), fontSize: `${avatarSize}px` }}
                  />
                  <img
                    alt={`${userProfile.first_name} ${userProfile.last_name}`}
                    src={`${userProfile.gravatar_url}&s=${avatarSize}`}
                  />
                </IonAvatar>
                <IonItem className="profile-name">
                  <IonLabel>
                    <h1>
                      {`${userProfile.first_name} ${userProfile.last_name}`}
                    </h1>
                  </IonLabel>
                </IonItem>
              </div>
              <IonList inset>
                <IonItem color="light">
                  <IonSelect
                    className="instance-select"
                    label="Instance"
                    value={instances.find((instance) => instance.name === userInfo.instance.name)}
                    interface="popover"
                    onIonChange={onInstanceChange}
                    toggleIcon={swapHorizontal}
                    placeholder="Select Instance"
                  >
                    {instances.map((instance) => (
                      <IonSelectOption
                        key={instance.name}
                        value={instance}
                        className={ instance.name === userInfo.instance.name ?
                          "current-instance" :
                          (instance.token ? "instance-already-connected" : "") }
                      >
                        {instance.name}
                        {instance.name === userInfo.instance.name && " (Current)"}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonItem color="light">
                  <IonSelect
                    label="Dark Mode"
                    value={darkMode}
                    interface="popover"
                    onIonChange={onDarkModeChange}
                  >
                    <IonSelectOption value="auto">Auto</IonSelectOption>
                    <IonSelectOption value="light">Light</IonSelectOption>
                    <IonSelectOption value="dark">Dark</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </IonList>
            </div>
            <IonButton color="danger" onClick={disconnect} className="disconnect-button">
              <IonIcon icon={logOutOutline} slot="start" />
              Disconnect
            </IonButton>
          </div>
        ) : <IonLoading isOpen />}
      </IonContent>
    </IonPage>
  );
};
