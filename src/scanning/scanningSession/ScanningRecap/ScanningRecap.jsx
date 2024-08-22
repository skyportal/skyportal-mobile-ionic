import "./ScanningRecap.scss";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRouterLink,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import moment from "moment-timezone";
import { useUserInfo } from "../../../common/hooks.js";
import { useCallback } from "react";
import { useLocation } from "react-router";
import { exitOutline } from "ionicons/icons";

export const ScanningRecap = () => {
  const { userInfo } = useUserInfo();
  const location = useLocation();
  /**
   * @type {import("../../scanningLib").ScanningRecap|undefined}
   */
  // @ts-ignore
  const recap = location.state?.recap;

  const handleDraftEmail = useCallback(() => {
    if (!userInfo || !recap) {
      return;
    }
    let body = `Dear all,
    
    ${recap.totalMatches} candidates
    
    
    Saved, not assigned:
    `;
    body += recap.notAssigned
      .map((source) => userInfo.instance.url + `/source/${source.id}`)
      .join("\n\n");
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
                    <IonItem key={source.id}>
                      <IonLabel>{source.id}</IonLabel>
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
              <IonButton expand="block">Draft email</IonButton>
            </a>
          )}
          <IonRouterLink routerLink="/app/scanning">
            <IonButton expand="block" fill="outline" color="danger">
              <IonIcon slot="start" icon={exitOutline}></IonIcon>
              Exit
            </IonButton>
          </IonRouterLink>
        </div>
      </IonContent>
    </IonPage>
  );
};
