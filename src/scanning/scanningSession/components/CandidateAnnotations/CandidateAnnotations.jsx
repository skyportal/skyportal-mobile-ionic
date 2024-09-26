import "./CandidateAnnotations.scss";
import { CandidateAnnotationItem } from "../CandidateAnnotationItem/CandidateAnnotationItem.jsx";

/**
 * @param {Object} props
 * @param {import("../../../scanning.lib.js").Candidate} props.candidate
 * @returns {JSX.Element}
 */
export const CandidateAnnotations = ({ candidate }) => {
  const annotations = candidate.annotations;
  return (
    <div className="candidate-annotations">
      {annotations.map((annotation) => (
        <CandidateAnnotationItem key={annotation.id} annotation={annotation} />
      ))}
    </div>
  );
};
