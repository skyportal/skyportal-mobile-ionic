import "./CandidateAnnotationItem.scss";

export const CandidateAnnotationItem = ({ name, value }) => {
  return (
    <div className="candidate-annotation-item">
      <div className="name">{name}:</div>
      <div className="value">{value}</div>
    </div>
  );
};
