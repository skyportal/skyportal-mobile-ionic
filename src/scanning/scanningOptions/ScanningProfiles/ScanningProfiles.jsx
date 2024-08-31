import "./ScanningProfiles.scss";
import {
  IonButton,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonNote,
  IonText,
} from "@ionic/react";
import { add } from "ionicons/icons";
import { useUserAccessibleGroups } from "../../../common/hooks.js";
import { useCallback, useContext } from "react";
import { UserContext } from "../../../common/context.js";
import { navigateWithParams } from "../../../common/util.js";
import { useHistory } from "react-router";
import { useScanningProfiles } from "../../scanningHooks.js";

export const ScanningProfiles = () => {
  const userInfo = useContext(UserContext);
  const { profiles } = useScanningProfiles(userInfo);
  const history = useHistory();
  const { userAccessibleGroups } = useUserAccessibleGroups(userInfo);

  const handleScanWithDefault = useCallback(() => {
    if (!profiles) {
      return;
    }
    navigateWithParams(history, "/scanning", {
      params: {
        profile: profiles.find((profile) => profile.default)?.name ?? "",
      },
    });
  }, [profiles]);

  return (
    <div className="scanning-profiles">
      <div className="sp-header">
        <h1>Profiles</h1>
        <IonButton size="default" fill="clear">
          <IonIcon slot="start" icon={add} />
          Add
        </IonButton>
      </div>
      {profiles && userAccessibleGroups ? (
        <div className="sp-content">
          {profiles.length > 0 ? (
            <IonList color="light" inset>
              {profiles.map((profile) => (
                <IonItem key={profile.name} color="light" button>
                  <IonLabel>
                    {profile.name}
                    <p>
                      {profile.groupIDs
                        .map(
                          (id) =>
                            userAccessibleGroups.find(
                              (group) => group.id === id,
                            )?.name,
                        )
                        .filter((name) => name)
                        .map((name) => (
                          <IonChip color="secondary" key={name}>
                            {name}
                          </IonChip>
                        ))}
                    </p>
                  </IonLabel>
                  {profile.default && <IonNote slot="end">Default</IonNote>}
                </IonItem>
              ))}
            </IonList>
          ) : (
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
        <IonButton shape="round" expand="block" fill="outline">
          Scan without a profile
        </IonButton>
      </div>
    </div>
  );
};
