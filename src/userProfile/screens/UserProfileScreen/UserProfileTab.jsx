import {
  IonAvatar,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";
import { useUserProfile } from "../../../common/common.hooks.js";
import { useContext } from "react";
import { AppContext, UserContext } from "../../../common/common.context.js";
import { swapHorizontal } from "ionicons/icons";
import { useMutation } from "@tanstack/react-query";
import {
  clearPreference,
  QUERY_KEYS,
  setDarkModeInDocument,
  setPreference,
} from "../../../common/common.lib.js";

export const UserProfileTab = () => {
  const { darkMode, updateDarkMode } = useContext(AppContext);
  const { userInfo, updateUserInfo } = useContext(UserContext);
  const [presentAlert] = useIonAlert();
  const { userProfile } = useUserProfile();

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

  const onInstanceSwitchButtonClick = async () => {
    await presentAlert({
      header: "Switch instance?",
      message: "Do you want to switch to another SkyPortal instance?",
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

  const instanceSwitchMutation = useMutation({
    mutationFn: onInstanceSwitchButtonClick,
  });

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {userProfile && (
          <form className="ion-padding-top">
            <div className="form-section">
              <IonList inset>
                <IonItem>
                  <IonAvatar slot="start">
                    <img
                      src={`${userProfile.gravatar_url}&s=48`}
                      alt="avatar"
                    />
                  </IonAvatar>
                  <IonLabel>
                    <h1>{`${userProfile.first_name} ${userProfile.last_name}`}</h1>
                  </IonLabel>
                </IonItem>
              </IonList>
            </div>
            <div className="form-section">
              <IonList inset>
                <IonItem color="light">
                  <IonLabel>Instance</IonLabel>
                  <IonButton
                    slot="end"
                    fill="clear"
                    onClick={() => instanceSwitchMutation.mutate()}
                  >
                    {userInfo.instance.name}
                    <IonIcon slot="end" icon={swapHorizontal}></IonIcon>
                  </IonButton>
                </IonItem>
              </IonList>
            </div>
            <div className="form-section">
              <IonList inset>
                <IonItem color="light">
                  <IonSelect
                    label="Dark theme"
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
          </form>
        )}
        {!userProfile && <IonLoading />}
      </IonContent>
    </>
  );
};
