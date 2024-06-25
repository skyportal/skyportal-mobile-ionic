import "./CandidateAnnotations.scss";
import { CandidateAnnotationItem } from "../CandidateAnnotationItem/CandidateAnnotationItem.jsx";

export const CandidateAnnotations = () => {
  const pinnedAnnotations = [
    {
      name: "RA",
      value: "12.3456",
    },
    {
      name: "DEC",
      value: "-12.3456",
    },
    {
      name: "Redshift",
      value: "0.1234",
    },
  ];
  return (
    <div className="candidate-annotations">
      <div className="pinned-annotations">
        {pinnedAnnotations.map((annotation, index) => (
          <CandidateAnnotationItem
            key={index}
            name={annotation.name}
            value={annotation.value}
          />
        ))}
      </div>
    </div>
  );
};
