import "./ScanningRecap.scss";
import {
  IonButton,
  IonItem,
  IonLabel,
  IonList,
  IonRouterLink,
} from "@ionic/react";
import moment from "moment-timezone";
import { useUserInfo } from "../../../common/hooks.js";
import { useCallback } from "react";

/**
 * @param {Object} props
 * @param {import("../../scanningLib").ScanningRecap} props.recap
 * @returns {JSX.Element}
 */
export const ScanningRecap = ({ recap }) => {
  const { userInfo } = useUserInfo();
  const handleDraftEmail = useCallback(() => {
    if (!userInfo) {
      return;
    }
    const body = recap.notAssigned
      .map((source) => userInfo.instance.url + `/source/${source.id}`)
      .join("\n");
    const bodyEncoded = encodeURIComponent(body);
    const subject = "Candidate scanning " + moment().format("YYYY-MM-DD");
    const subjectEncoded = encodeURIComponent(subject);
    return `mailto:?subject=${subjectEncoded}&body=${bodyEncoded}`;
  }, [recap.notAssigned, userInfo]);
  return (
    <div className="scanning-recap ion-padding">
      <h1>Saved sources</h1>
      <div className="not-assigned">
        <h5>Not assigned</h5>
        {recap.notAssigned.length > 0 ? (
          <>
            <IonList>
              {recap.notAssigned.map((source) => (
                <IonItem key={source.id}>
                  <IonLabel>{source.id}</IonLabel>
                </IonItem>
              ))}
            </IonList>
          </>
        ) : (
          <p>You did not save any source</p>
        )}
      </div>
      {recap.notAssigned.length > 0 && (
        <div className="button-container">
          <a href={handleDraftEmail()}>
            <IonButton expand="block">Draft email</IonButton>
          </a>
          <IonRouterLink routerLink="/app/scanning">
            <IonButton expand="block" fill="outline">
              Exit
            </IonButton>
          </IonRouterLink>
        </div>
      )}
    </div>
  );
};
