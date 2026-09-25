import "./Source.scss";
import { IonSkeletonText } from "@ionic/react";
import { ThumbnailListSkeleton } from "../../components/Thumbnail/ThumbnailListSkeleton.jsx";
import { PinnedAnnotationsSkeleton } from "../../components/PinnedAnnotations/PinnedAnnotationsSkeleton.jsx";

/**
 * @param {Object} props
 * @param {boolean} [props.animated=false]
 * @param {boolean} [props.visible=true]
 * @returns {JSX.Element}
 */
export const SourceSkeleton = ({ animated = false, visible = true }) => {
  return (
    <div
      className="source skeleton"
      style={{ visibility: visible ? "visible" : "hidden" }}
    >
      <div className="header">
        <h1>
          <IonSkeletonText
            style={{ width: "8rem", height: "1.2rem" }}
            animated={animated}
          />
        </h1>
        <div className="source-groups-chip">
          <IonSkeletonText
            style={{ width: "6rem", height: "1.2rem" }}
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
