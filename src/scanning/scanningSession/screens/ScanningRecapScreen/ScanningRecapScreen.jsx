import "./ScanningRecapScreen.scss";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import moment from "moment-timezone";
import { useCallback, useContext } from "react";
import { useHistory, useLocation } from "react-router";
import { exitOutline, linkOutline, mailOutline } from "ionicons/icons";
import { UserContext } from "../../../../common/common.context.js";

export const ScanningRecapScreen = () => {
  const { userInfo } = useContext(UserContext);
  const location = useLocation();
  const history = useHistory();
  /**
   * @type {import("../../../scanning.lib.js").ScanningRecap|undefined}
   */
  // @ts-ignore
  const recap = location.state?.recap;

  const getLink = useCallback(
    /**
     * @param {import("../../../scanning.lib.js").Candidate} source
     * @returns {string}
     */
    (source) => {
      if (!userInfo) return "";
      return userInfo.instance.url + `/source/${source.id}`;
    },
    [userInfo],
  );

  const handleDraftEmail = useCallback(() => {
    if (!userInfo || !recap) {
      return;
    }
    let body = `Dear all,
    
    ${recap.totalMatches} candidates
    
    
    Saved, not assigned:
    `;
    body += recap.notAssigned.map(getLink).join("\n\n");
    const bodyEncoded = encodeURIComponent(body);
    const subject = "Candidate scanning " + moment().format("YYYY-MM-DD");
    const subjectEncoded = encodeURIComponent(subject);
    return `mailto:?subject=${subjectEncoded}&body=${bodyEncoded}`;
  }, [recap?.notAssigned, userInfo]);

  return (
    <IonPage className="scanning-recap">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Scanning recap</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="recap-container">
          <div className="not-assigned">
            {recap?.notAssigned?.length ?? 0 > 0 ? (
              <>
                <h5>Not assigned</h5>
                <IonList>
                  {(recap?.notAssigned ?? []).map((source) => (
                    <IonItem
                      key={source.id}
                      onClick={() => window.open(getLink(source))}
                      detail={false}
                      button
                    >
                      <IonLabel>{source.id}</IonLabel>
                      <IonIcon
                        slot="end"
                        icon={linkOutline}
                        color="primary"
                      ></IonIcon>
                    </IonItem>
                  ))}
                </IonList>
              </>
            ) : (
              <p style={{ textAlign: "center" }}>
                You did not save any sources
              </p>
            )}
          </div>

          {(recap?.notAssigned?.length ?? 0) > 0 && (
            <a href={handleDraftEmail()}>
              <IonButton expand="block">
                <IonIcon slot="start" icon={mailOutline}></IonIcon>
                Draft email
              </IonButton>
            </a>
          )}
          <IonButton
            expand="block"
            fill="outline"
            color="danger"
            onClick={() => history.replace("/app/scanning")}
          >
            <IonIcon slot="start" icon={exitOutline}></IonIcon>
            Exit
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};
