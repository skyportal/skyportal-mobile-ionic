import "./PinnedAnnotations.scss";
import { IonButton, IonText } from "@ionic/react";

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
          <div key={annotationLine.id} className="annotation-line">
            <IonText className="name" color="secondary">
              {annotationLine.id}:
            </IonText>
            <div>{annotationLine.value}</div>
          </div>
        ))}
      </div>
      <IonButton
        onClick={onButtonClick}
        color="secondary"
        expand="block"
        shape="round"
        size="small"
        fill="clear"
      >
        Show all
      </IonButton>
    </div>
  );
};
