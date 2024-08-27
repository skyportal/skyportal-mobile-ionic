import "./CandidateAnnotationItem.scss";
import { IonItem, IonLabel, IonList, IonListHeader } from "@ionic/react";
import { useCopyAnnotationLineOnClick } from "../../scanningLib.js";

/**
 * @param {Object} props
 * @param {import("../../scanningLib.js").CandidateAnnotation} props.annotation
 * @returns {JSX.Element}
 */
export const CandidateAnnotationItem = ({ annotation }) => {
  const handleTextCopied = useCopyAnnotationLineOnClick();

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
            <IonItem
              key={key}
              onClick={() => handleTextCopied(key, value)}
              detail={false}
              button
            >
              {key}: {value}
            </IonItem>
          ))}
      </IonList>
    </div>
  );
};
