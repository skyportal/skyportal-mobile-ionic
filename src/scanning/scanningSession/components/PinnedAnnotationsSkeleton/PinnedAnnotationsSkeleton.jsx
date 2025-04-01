import "../PinnedAnnotations/PinnedAnnotations.scss";
import { IonSkeletonText } from "@ionic/react";

/**
 * @param {Object} props
 * @param {boolean} props.animated
 * @returns {JSX.Element}
 */
export const PinnedAnnotationsSkeleton = ({ animated }) => {
  return (
    <div>
      <div>
        {[1, 2, 3].map((index) => (
          <div key={index}>
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
