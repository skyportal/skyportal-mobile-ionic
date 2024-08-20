import "./ScanningRecap.scss";
import { IonButton, IonItem, IonLabel, IonList } from "@ionic/react";

/**
 * @param {Object} props
 * @param {import("../../scanningLib").ScanningRecap} props.recap
 * @returns {JSX.Element}
 */
export const ScanningRecap = ({ recap }) => {
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
          <IonButton expand="block">Draft email</IonButton>
          <IonButton expand="block" fill="outline">
            Exit
          </IonButton>
        </div>
      )}
    </div>
  );
};
