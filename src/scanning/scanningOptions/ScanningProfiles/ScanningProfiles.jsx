import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonList,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useUserAccessibleGroups } from "../../../common/common.hooks.js";
import { UserContext } from "../../../common/common.context.js";
import { useCallback, useContext } from "react";
import { useScanningProfiles } from "../../scanning.hooks.js";
import { ProfileListItem } from "../ProfileListItem/ProfileListItem.jsx";
import { useHistory } from "react-router";
import { navigateWithParams } from "../../../common/common.lib.js";

export const ScanningProfiles = () => {
  const history = useHistory();
  const { userInfo } = useContext(UserContext);
  const { profiles } = useScanningProfiles(userInfo);
  const { userAccessibleGroups } = useUserAccessibleGroups();
  const defaultProfileIndex = profiles?.findIndex((profile) => profile.default);

  const handleOnProfileClick = useCallback(
    /**
     * @param {import("../../../onboarding/common.onboarding.js").ScanningProfile} profile
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
        ) : (
          <IonLoading />
        )}
      </IonContent>
    </IonPage>
  );
};
