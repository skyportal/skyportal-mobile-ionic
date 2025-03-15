import "./ScanningProfilesScreen.scss";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonList,
  IonLoading,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useUserAccessibleGroups } from "../../../../common/common.hooks.js";
import { useCallback } from "react";
import { useScanningProfiles } from "../../../scanning.hooks.js";
import { ProfileListItem } from "../../components/ProfileListItem/ProfileListItem.jsx";
import { useHistory } from "react-router";
import { navigateWithParams } from "../../../../common/common.lib.js";

export const ScanningProfilesScreen = () => {
  const history = useHistory();
  const { profiles } = useScanningProfiles();
  const { userAccessibleGroups } = useUserAccessibleGroups();
  const defaultProfileIndex = profiles?.findIndex((profile) => profile.default);

  const handleOnProfileClick = useCallback(
    /**
     * @param {import("../../../../onboarding/onboarding.lib.js").ScanningProfile} profile
     */
    (profile) => {
      navigateWithParams(history, "/scanning", {
        params: {
          profile: profile.name,
        },
      });
    },
    [profiles],
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonBackButton />
          </IonButtons>
          <IonTitle>Scanning profiles</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {profiles && defaultProfileIndex && userAccessibleGroups ? (
          profiles.length > 0 ? (
            <IonList>
              <ProfileListItem
                profile={profiles[defaultProfileIndex]}
                userAccessibleGroups={userAccessibleGroups}
                itemSliding={true}
                onClick={() =>
                  handleOnProfileClick(profiles[defaultProfileIndex])
                }
              />
              {profiles.toSpliced(defaultProfileIndex, 1).map((profile) => (
                <ProfileListItem
                  key={profile.name}
                  profile={profile}
                  userAccessibleGroups={userAccessibleGroups}
                  itemSliding={true}
                  onClick={() => handleOnProfileClick(profile)}
                />
              ))}
            </IonList>
          ) : <div className="hint-container">
                <IonText color="secondary" className="hint">
                  You don’t have any profiles yet.
                </IonText>
              </div>
        ) : (
          <IonLoading isOpen={true} />
        )}
      </IonContent>
    </IonPage>
  );
};
