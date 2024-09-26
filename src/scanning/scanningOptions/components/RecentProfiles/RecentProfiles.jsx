import "./RecentProfiles.scss";
import { IonButton, IonIcon, IonList, IonLoading, IonText } from "@ionic/react";
import { useUserAccessibleGroups } from "../../../../common/common.hooks.js";
import { useCallback } from "react";
import { navigateWithParams } from "../../../../common/common.lib.js";
import { useHistory } from "react-router";
import { useScanningProfiles } from "../../../scanning.hooks.js";
import { ProfileListItem } from "../ProfileListItem/ProfileListItem.jsx";
import { chevronForwardOutline } from "ionicons/icons";

export const RecentProfiles = () => {
  const history = useHistory();
  const { profiles } = useScanningProfiles();
  const { userAccessibleGroups } = useUserAccessibleGroups();

  const defaultProfileIndex = profiles?.findIndex((profile) => profile.default);

  const handleScanWithProfile = useCallback(
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

  const handleScanWithDefault = useCallback(() => {
    if (!profiles) {
      return;
    }
    const defaultProfile = profiles.find((profile) => profile.default);
    if (!defaultProfile) {
      return;
    }
    return handleScanWithProfile(defaultProfile);
  }, [profiles, handleScanWithProfile]);

  const handleSeeAll = () => {
    history.push("/scanning/profiles");
  };

  return (
    <div className="recent-profiles">
      <div className="recent-profiles-header">
        <h1>Recent profiles</h1>
        <IonButton fill="clear" onClick={handleSeeAll}>
          See all
          <IonIcon icon={chevronForwardOutline} />
        </IonButton>
      </div>
      <div className="recent-profiles-content">
        {profiles && userAccessibleGroups && (
          <>
            {profiles.length > 0 && defaultProfileIndex && (
              <IonList color="light" inset>
                <ProfileListItem
                  key={profiles[defaultProfileIndex].name}
                  profile={profiles[defaultProfileIndex]}
                  userAccessibleGroups={userAccessibleGroups}
                  onClick={() =>
                    handleScanWithProfile(profiles[defaultProfileIndex])
                  }
                />
                {profiles
                  .toSpliced(defaultProfileIndex, 1)
                  .toSpliced(2)
                  .map((profile) => (
                    <ProfileListItem
                      key={profile.name}
                      profile={profile}
                      userAccessibleGroups={userAccessibleGroups}
                      onClick={() => handleScanWithProfile(profile)}
                    />
                  ))}
              </IonList>
            )}
            {profiles.length === 0 && (
              <div className="hint-container">
                <IonText color="secondary" className="hint">
                  You don’t have any profiles yet. You can add a new one or
                  click the “Scan without a profile” button below to configure
                  the scanning session manually.
                </IonText>
              </div>
            )}
          </>
        )}
        {(!profiles || !userAccessibleGroups) && <IonLoading />}
      </div>
      <div className="buttons-container">
        <IonButton
          shape="round"
          expand="block"
          disabled={(profiles?.length ?? 0) === 0}
          onClick={handleScanWithDefault}
        >
          Scan with default profile
        </IonButton>
        <IonButton
          shape="round"
          expand="block"
          fill="outline"
          routerLink="/scanning"
        >
          Scan without a profile
        </IonButton>
      </div>
    </div>
  );
};
