import "./CandidateAnnotationItem.scss";
import { IonIcon } from "@ionic/react";
import { pin } from "ionicons/icons";

export const CandidateAnnotationItem = ({ name, value }) => {
  return (
    <div className="candidate-annotation-item">
      <IonIcon className="pin-icon" md={pin} />
      <div className="name-n-value">
        <div className="name">{name}:</div>
        <div className="value">{value}</div>
      </div>
    </div>
  );
};
