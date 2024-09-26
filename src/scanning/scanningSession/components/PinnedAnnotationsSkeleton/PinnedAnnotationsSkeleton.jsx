import "../PinnedAnnotations/PinnedAnnotations.scss";
import { IonSkeletonText } from "@ionic/react";

/**
 * @param {Object} props
 * @param {boolean} props.animated
 * @returns {JSX.Element}
 */
export const PinnedAnnotationsSkeleton = ({ animated }) => {
  return (
    <div className="pinned-annotations">
      <div className="annotations skeleton">
        {[1, 2, 3].map((index) => (
          <div key={index} className="annotation-line">
            <IonSkeletonText
              style={{ width: "2rem", height: ".8rem" }}
              animated={animated}
            />
            <IonSkeletonText style={{ width: "11rem" }} animated={animated} />
          </div>
        ))}
      </div>
    </div>
  );
};
