import "./CandidateAnnotationItem.scss";
import { IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonText } from "@ionic/react";
import { useCopyAnnotationLineOnClick } from "../../../scanning.lib.js";
import { copyOutline } from "ionicons/icons";

/**
 * @param {Object} props
 * @param {import("../../../scanning.lib.js").CandidateAnnotation} props.annotation
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
              <IonText color="secondary">{key}:</IonText>
              {"\u00A0"}
              <IonText>{value}</IonText>
              {"\u00A0"}
              {"\u00A0"}
              {"\u00A0"}
              <IonIcon icon={copyOutline} size="small" color="secondary" />
            </IonItem>
          ))}
      </IonList>
    </div>
  );
};
