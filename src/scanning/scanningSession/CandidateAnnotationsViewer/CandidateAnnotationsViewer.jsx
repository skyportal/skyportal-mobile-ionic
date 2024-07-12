import { IonSearchbar } from "@ionic/react";
import { CandidateAnnotations } from "../CandidateAnnotations/CandidateAnnotations.jsx";

/**
 * @param {Object} props
 * @param {import("../../scanning").Candidate} props.candidate
 * @param {React.MutableRefObject<any>} props.modal
 * @returns {JSX.Element}
 */
export const CandidateAnnotationsViewer = ({ candidate, modal }) => {
  return (
    <div className="candidate-annotations-viewer">
      <IonSearchbar onClick={() => modal.current?.setCurrentBreakpoint(0.75)} />
      <CandidateAnnotations candidate={candidate} />
    </div>
  );
};
