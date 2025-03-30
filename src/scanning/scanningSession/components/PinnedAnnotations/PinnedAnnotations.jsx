import "./PinnedAnnotations.scss";
import { IonButton, IonIcon, IonItem, IonText } from "@ionic/react";
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
    const pinnedAnnotations = pinnedAnnotationIds
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

    if (pinnedAnnotations.length >= 3) {
      setPinnedAnnotations(pinnedAnnotations);
      return;
    }

    for (const annotation of candidate.annotations) {
      for (const [key, value] of Object.entries(annotation.data)) {
        if (pinnedAnnotations.length >= 3) {
          break;
        }
        if ( value && !pinnedAnnotations.some((item) => item.id === key && item.origin === annotation.origin)) {
          pinnedAnnotations.push({
            id: key,
            origin: annotation.origin,
            value,
          });
        }
      }
    }
    setPinnedAnnotations([...pinnedAnnotations].slice(0, 3));
  }, [candidate.annotations]);

  return (
    <div className="pinned-annotations section">
      <div className="annotations">
        {pinnedAnnotations.map((annotationLine) => (
          <IonItem
            key={getAnnotationId(annotationLine.origin, annotationLine.id)}
            className="annotation-line"
            lines="none"
            onClick={() =>
              handleTextCopied(annotationLine.id, sanitizeAnnotationData(annotationLine.value))
            }
            detail={false}
            button
          >
            <IonText className="name" color="secondary">
              {annotationLine.id}
            </IonText>
            {"\u00A0"}
            {annotationLine.value ? (
              <div className="annotation-line-content">
                <span className="annotation-value">
                  {concat(sanitizeAnnotationData(annotationLine.value), 20)}
                </span>
                <IonIcon icon={copyOutline} size="small" color="secondary" />
              </div>
            ) : (
              <>
                <IonText color="warning" className="no-value">
                  No value
                </IonText>
              </>
            )}
          </IonItem>
        ))}
      </div>
      <div className="button-container">
        <IonButton
          onClick={onButtonClick}
          color="secondary"
          expand="block"
          size="small"
          fill="clear"
        >
          Show all
        </IonButton>
      </div>
    </div>
  );
};
