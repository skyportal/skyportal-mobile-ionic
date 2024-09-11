import "./RecentProfiles.scss";
import { IonButton, IonList, IonLoading, IonText } from "@ionic/react";
import { useUserAccessibleGroups } from "../../../common/hooks.js";
import { useCallback, useContext } from "react";
import { UserContext } from "../../../common/context.js";
import { navigateWithParams } from "../../../common/util.js";
import { useHistory } from "react-router";
import { useScanningProfiles } from "../../scanningHooks.js";
import { ProfileListItem } from "../ProfileListItem/ProfileListItem.jsx";

export const RecentProfiles = () => {
  const history = useHistory();
  const userInfo = useContext(UserContext);
  const { profiles } = useScanningProfiles(userInfo);
  const { userAccessibleGroups } = useUserAccessibleGroups(userInfo);

  const defaultProfileIndex = profiles?.findIndex((profile) => profile.default);

  const handleScanWithProfile = useCallback(
    /**
     * @param {import("../../../onboarding/auth").ScanningProfile} profile
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
    <div className="scanning-profiles">
      <div className="sp-header">
        <h1>Recent profiles</h1>
        <IonButton fill="clear" onClick={handleSeeAll}>
          See all
        </IonButton>
      </div>
      {profiles !== undefined &&
      (profiles.length < 0 || defaultProfileIndex) !== undefined &&
      userAccessibleGroups !== undefined ? (
        <div className="sp-content">
          {profiles.length > 0 && (
            <IonList color="light" inset>
              <ProfileListItem
                key={profiles[defaultProfileIndex ?? 0].name}
                profile={profiles[defaultProfileIndex ?? 0]}
                userAccessibleGroups={userAccessibleGroups}
                onClick={() =>
                  handleScanWithProfile(profiles[defaultProfileIndex ?? 0])
                }
              />
              {profiles
                .toSpliced(defaultProfileIndex ?? 0, 1)
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
          )}{" "}
          {profiles.length === 0 && (
            <div className="hint-container">
              <IonText color="secondary" className="hint">
                You don’t have any profiles yet. You can add a new one or click
                the “Scan without a profile” button below to configure the
                scanning session manually.
              </IonText>
            </div>
          )}
        </div>
      ) : (
        <IonLoading />
      )}
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
