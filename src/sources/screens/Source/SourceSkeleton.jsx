import "./Source.scss";
import { IonSkeletonText } from "@ionic/react";
import { ALERT_THUMBNAIL_TYPES, ARCHIVAL_THUMBNAIL_TYPES } from "../../sources.lib.js";
import { ThumbnailSkeleton } from "../../components/Thumbnail/ThumbnailSkeleton.jsx";
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
      <div className="thumbnails-container">
        {[...ALERT_THUMBNAIL_TYPES, ...ARCHIVAL_THUMBNAIL_TYPES].map((type) => (
          <ThumbnailSkeleton key={type} type={type} animated={animated} />
        ))}
      </div>
      <PinnedAnnotationsSkeleton animated={animated} />
      <div className="plot-container">
        <IonSkeletonText animated={animated} />
      </div>
    </div>
  );
};
