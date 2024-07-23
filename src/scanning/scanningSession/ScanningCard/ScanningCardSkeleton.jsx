import "./ScanningCard.scss";
import { IonSkeletonText } from "@ionic/react";
import { THUMBNAIL_TYPES } from "../../scanning.js";
import { ThumbnailSkeleton } from "../ThumnailSkeleton/ThumbnailSkeleton.jsx";
import { PinnedAnnotationsSkeleton } from "../PinnedAnnotationsSkeleton/PinnedAnnotationsSkeleton.jsx";

/**
 * @param {Object} props
 * @param {boolean} [props.animated=false]
 * @returns {JSX.Element}
 */
export const ScanningCardSkeleton = ({ animated = false }) => {
  return (
    <div className="scanning-card">
      <div className="candidate-name">
        <h1>
          <IonSkeletonText style={{ width: "8rem" }} animated={animated} />
        </h1>
        <div className="pagination-indicator">
          <IonSkeletonText style={{ width: "2rem" }} animated={animated} />
        </div>
      </div>
      <div className="thumbnails-container">
        {Object.keys(THUMBNAIL_TYPES).map((type) => (
          <ThumbnailSkeleton key={type} type={type} animated={animated} />
        ))}
      </div>
      <PinnedAnnotationsSkeleton animated={animated} />
      <div className="plot-container">
        <IonSkeletonText
          style={{ width: "100%", height: "100%" }}
          animated={animated}
        />
      </div>
    </div>
  );
};
