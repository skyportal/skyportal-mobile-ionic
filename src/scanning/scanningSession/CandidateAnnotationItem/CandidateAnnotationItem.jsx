import "./CandidateAnnotationItem.scss";
import { IonItem, IonLabel, IonList, IonListHeader } from "@ionic/react";

/**
 * @param {Object} props
 * @param {import("../../scanning").CandidateAnnotation} props.annotation
 * @returns {JSX.Element}
 */
export const CandidateAnnotationItem = ({ annotation }) => {
  return (
    <div className="candidate-annotation-item">
      <IonList lines="full">
        <IonListHeader>
          <h6>
            <IonLabel>{annotation.origin}</IonLabel>
          </h6>
        </IonListHeader>
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
