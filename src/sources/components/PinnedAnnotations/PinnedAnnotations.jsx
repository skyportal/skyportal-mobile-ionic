import "./PinnedAnnotations.scss";
import { IonButton, IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import {
  extractAnnotationOriginAndKey,
  getAnnotationId,
  useCopyAnnotationLineOnClick,
  sanitizeAnnotationData,
  concat,
} from "../../sources.lib.js";
import { copyOutline } from "ionicons/icons";
import { useEffect, useState } from "react";

/**
 * @param {Object} props
 * @param {import("../../../scanning/scanning.lib.js").Candidate | import("../../sources.lib.js").Source} props.source
 * @param {() => void} props.onButtonClick
 * @param {string[]} [props.pinnedAnnotationIds]
 * @returns {JSX.Element}
 */
export const PinnedAnnotations = ({
  source,
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
          value: source.annotations.find(
            (annotation) => annotation.origin === origin
          )?.data[key],
        };
      })
      .filter((annotation) => annotation.value);

    if (annotations.length >= 3) {
      setPinnedAnnotations(annotations);
      return;
    }

    for (const annotation of source.annotations) {
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
  }, [source.annotations]);

  return (
    <div className="pinned-annotations section">
      <div className="annotation-list">
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
                  <IonIcon icon={copyOutline} size="small" color="secondary"/>
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
