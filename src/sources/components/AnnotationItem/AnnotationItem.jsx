import "./AnnotationItem.scss";
import { IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonText } from "@ionic/react";
import { sanitizeAnnotationData, useCopyAnnotationLineOnClick } from "../../sources.lib.js";
import { copyOutline } from "ionicons/icons";

/**
 * @param {Object} props
 * @param {import("../../sources.lib.js").Annotation} props.annotation
 * @returns {JSX.Element}
 */
export const AnnotationItem = ({ annotation }) => {
  const handleTextCopied = useCopyAnnotationLineOnClick();

  return (
    <div className="annotation-item">
      <IonList lines="full">
        <IonListHeader>
          <h6>
            <IonLabel>{annotation.origin}</IonLabel>
          </h6>
        </IonListHeader>
        {Object.entries(annotation.data)
          .map(([key, value]) => (
            <IonItem
              key={key}
              onClick={() => handleTextCopied(key, sanitizeAnnotationData(value, true))}
              detail={false}
              button
            >
              <IonText color="secondary" style={{ marginRight: "0.5rem" }}>
                {key}:
              </IonText>
              <IonText style={{ wordBreak: "break-word", marginRight: "0.5rem"}}
              >
                {sanitizeAnnotationData(value,false)}
              </IonText>
              <IonIcon icon={copyOutline} size="small" color="secondary" style={{ minWidth: "19.125px" }} />
            </IonItem>
          ))}
      </IonList>
    </div>
  );
};
