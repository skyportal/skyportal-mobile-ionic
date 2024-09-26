import { IonSearchbar } from "@ionic/react";
import { CandidateAnnotations } from "../CandidateAnnotations/CandidateAnnotations.jsx";

/**
 * @param {Object} props
 * @param {import("../../../scanning.lib.js").Candidate} props.candidate
 * @returns {JSX.Element}
 */
export const CandidateAnnotationsViewer = ({ candidate }) => {
  return (
    <div className="candidate-annotations-viewer">
      <IonSearchbar />
      <CandidateAnnotations candidate={candidate} />
    </div>
  );
};
