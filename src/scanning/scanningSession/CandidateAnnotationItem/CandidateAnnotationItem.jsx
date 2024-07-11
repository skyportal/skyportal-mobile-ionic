import "./CandidateAnnotationItem.scss";
import { IonItem, IonList } from "@ionic/react";

/**
 * @param {Object} props
 * @param {import("../../scanning").CandidateAnnotation} props.annotation
 * @returns {JSX.Element}
 */
export const CandidateAnnotationItem = ({ annotation }) => {
  return (
    <div className="candidate-annotation-item">
      <IonList lines="none">
        {Object.entries(annotation.data)
          .slice(0, 3)
          .map(([key, value]) => (
            <IonItem key={key} button>
              {key}: {value}
            </IonItem>
          ))}
      </IonList>
    </div>
  );
};
