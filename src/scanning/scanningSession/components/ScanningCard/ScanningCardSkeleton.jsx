import "./ScanningCard.scss";
import { IonSkeletonText } from "@ionic/react";
import { ThumbnailListSkeleton } from "../../../../sources/components/Thumbnail/ThumbnailListSkeleton.jsx";
import { PinnedAnnotationsSkeleton } from "../../../../sources/components/PinnedAnnotations/PinnedAnnotationsSkeleton.jsx";

/**
 * @param {Object} props
 * @param {boolean} [props.animated=false]
 * @param {boolean} [props.visible=true]
 * @returns {JSX.Element}
 */
export const ScanningCardSkeleton = ({ animated = false, visible = true }) => {
  return (
    <div
      className="scanning-card skeleton"
      style={{ visibility: visible ? "visible" : "hidden" }}
    >
      <div className="candidate-name">
        <h1>
          <IonSkeletonText
            style={{ width: "8rem", height: "1.2rem" }}
            animated={animated}
          />
        </h1>
        <div className="pagination-indicator">
          <IonSkeletonText
            style={{ width: "2rem", height: ".8rem" }}
            animated={animated}
          />
        </div>
      </div>
      <ThumbnailListSkeleton animated={animated} />
      <PinnedAnnotationsSkeleton animated={animated} />
      <div className="plot-container">
        <IonSkeletonText animated={animated} />
      </div>
    </div>
  );
};
