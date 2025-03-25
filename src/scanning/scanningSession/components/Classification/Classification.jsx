import "./Classification.scss";
import { IonChip } from "@ionic/react";

/**
 * @param {Object} props
 * @param {import("../../../scanning.lib.js").Candidate} props.candidate
 * @returns {JSX.Element | null}
 */
export const Classification = ({candidate}) => {
  const mostRecentHumanClassification =
    candidate.classifications?.filter((c) => (c?.ml === false || c?.ml === null) && c.probability > 0)
      ?.sort((a, b) => b.modified.localeCompare(a.modified))[0]?.classification || null;

  if (!mostRecentHumanClassification) {
    return null;
  }

  return (
    <div className="classification">
      Latest classification
      <div>
        <IonChip color="primary">
          {mostRecentHumanClassification}
        </IonChip>
      </div>
    </div>
  );
};
