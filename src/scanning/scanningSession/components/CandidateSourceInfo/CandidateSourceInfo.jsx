import "./CandidateSourceInfo.scss";
import { IonButton, IonChip, IonItem, IonLabel, IonList } from "@ionic/react";

/**
 * @param {Object} props
 * @param {import("../../../scanning.lib.js").Candidate} props.candidate
 * @returns {JSX.Element | null}
 */
export const CandidateSourceInfo = ({candidate}) => {
  const mostRecentHumanClassification =
    candidate.classifications?.filter((c) => (c?.ml === false || c?.ml === null) && c.probability > 0)
      ?.sort((a, b) => b.modified.localeCompare(a.modified))[0]?.classification || null;

  return (
    <div className="section candidate-source-info">
      <div className="section-title section-padding">
        Source Info
      </div>
      <IonList>
        <IonItem color="light">
          <IonLabel className="classification">
            Latest classification:
          </IonLabel>
          {mostRecentHumanClassification && (
            <IonChip>{mostRecentHumanClassification}</IonChip>
          )}
        </IonItem>
        <IonItem color="light" lines="none">
          <IonLabel className="name">
            TNS Name:
          </IonLabel>
          { candidate.tns_name && (
            <IonButton
              fill="outline"
              color="secondary"
              href={`https://www.wis-tns.org/object/${candidate.tns_name.split(" ").pop()}`}
              target="_blank"
              className="tns-name"
              >
              {candidate.tns_name}
            </IonButton>
          )}
        </IonItem>
      </IonList>
    </div>
  );
};
