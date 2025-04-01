import "./PinnedAnnotations.scss";
import { IonButton, IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import {
  extractAnnotationOriginAndKey,
  getAnnotationId,
  useCopyAnnotationLineOnClick,
  sanitizeAnnotationData,
  concat,
} from "../../../scanning.lib.js";
import { copyOutline } from "ionicons/icons";
import { useEffect, useState } from "react";

/**
 * @param {Object} props
 * @param {import("../../../scanning.lib.js").Candidate} props.candidate
 * @param {() => void} props.onButtonClick
 * @param {string[]} [props.pinnedAnnotationIds]
 * @returns {JSX.Element}
 */
export const PinnedAnnotations = ({
  candidate,
  onButtonClick,
  pinnedAnnotationIds = [],
}) => {
  const handleTextCopied = useCopyAnnotationLineOnClick();
  /**
   * @type {[{ id: string; origin: string; value: any; }[], React.Dispatch<React.SetStateAction<{ id: string; origin: string; value: any; }[]>>]}
   */
  // @ts-ignore
  const [pinnedAnnotations, setPinnedAnnotations] = useState([]);

  useEffect(() => {
    const annotations = pinnedAnnotationIds
      .map((id) => {
        const { key, origin } = extractAnnotationOriginAndKey(id);
        return {
          id: key,
          origin,
          value: candidate.annotations.find(
            (annotation) => annotation.origin === origin
          )?.data[key],
        };
      })
      .filter((annotation) => annotation.value);

    if (annotations.length >= 3) {
      setPinnedAnnotations(annotations);
      return;
    }

    for (const annotation of candidate.annotations) {
      for (const [key, value] of Object.entries(annotation.data)) {
        if (annotations.length >= 3) {
          break;
        }
        if ( value && !annotations.some((item) => item.id === key && item.origin === annotation.origin)) {
          annotations.push({
            id: key,
            origin: annotation.origin,
            value,
          });
        }
      }
    }
    setPinnedAnnotations([...annotations].slice(0, 3));
  }, [candidate.annotations]);

  return (
    <div className="pinned-annotations section">
      <div className="annotations">
        <IonList>
          {pinnedAnnotations.map((annotationLine) => (
            <IonItem
              key={getAnnotationId(annotationLine.origin, annotationLine.id)}
              onClick={() =>
                handleTextCopied(
                  annotationLine.id,
                  sanitizeAnnotationData(annotationLine.value, true)
                )
              }
              color="light"
              lines="none"
            >
              <IonLabel color="secondary" className="annotation-id">
                {annotationLine.id}:
              </IonLabel>
              {annotationLine.value ? (
                <IonLabel className="annotation-value">
                  {concat(sanitizeAnnotationData(annotationLine.value,false), 15)}
                  <IonIcon icon={copyOutline} size="small" color="secondary"></IonIcon>
                </IonLabel>
              ) : (
                <IonLabel color="warning" className="no-value">
                  no value
                </IonLabel>
              )}
            </IonItem>
          ))}
        </IonList>
      </div>
      <div className="button-container">
        <IonButton
          onClick={onButtonClick}
          color="secondary"
          size="small"
          fill="clear"
          className="ion-text-nowrap"
        >
          Show all
        </IonButton>
      </div>
    </div>
  );
};
