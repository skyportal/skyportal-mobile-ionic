import "./PinnedAnnotations.scss";
import { IonButton, IonIcon, IonItem, IonText } from "@ionic/react";
import { useCopyAnnotationLineOnClick } from "../../scanningLib.js";
import { copyOutline } from "ionicons/icons";

/**
 * @param {Object} props
 * @param {import("../../scanningLib.js").Candidate} props.candidate
 * @param {() => void} props.onButtonClick
 * @param {string[]} [props.pinnedAnnotationIds]
 * @returns {JSX.Element}
 */
export const PinnedAnnotations = ({
  candidate,
  onButtonClick,
  pinnedAnnotationIds = [
    "ZTF Science Validation:Public Transients.age",
    "ZTF Science Validation:Public Transients.acai_b",
    "ZTF Science Validation:Public Transients.acai_h",
  ],
}) => {
  const handleTextCopied = useCopyAnnotationLineOnClick();
  const pinnedAnnotations = pinnedAnnotationIds.map((id) => {
    const [annotationOrigin, dataItem] = id.split(".");
    return {
      id: dataItem,
      value: candidate.annotations.find(
        (annotation) => annotation.origin === annotationOrigin,
      )?.data[dataItem],
    };
  });

  return (
    <div className="pinned-annotations">
      <div className="annotations">
        {pinnedAnnotations.map((annotationLine) => (
          <IonItem
            key={annotationLine.id}
            className="annotation-line"
            lines="none"
            onClick={() =>
              handleTextCopied(annotationLine.id, annotationLine.value)
            }
            detail={false}
            button
          >
            <IonText className="name" color="secondary">
              {annotationLine.id}:
            </IonText>
            {"\u00A0"}
            {annotationLine.value ? (
              <div>
                {annotationLine.value}
                {"\u00A0"}
                {"\u00A0"}
                {"\u00A0"}
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
