import "./Thumbnail.scss";
import "./ThumbnailList.scss";
import { IonSkeletonText } from "@ionic/react";
import {
  ALERT_THUMBNAIL_TYPES,
  ARCHIVAL_THUMBNAIL_TYPES,
  getThumbnailHeader
} from "../../sources.lib.js";

/**
 * @param {Object} props
 * @param {boolean} props.animated
 * @returns {JSX.Element}
 */
export const ThumbnailListSkeleton = ({ animated }) => (
  <div className="thumbnails-container">
    {[...ALERT_THUMBNAIL_TYPES, ...ARCHIVAL_THUMBNAIL_TYPES].map((type) => (
      <div key={type} className="thumbnail">
        <div className="thumbnail-name">{getThumbnailHeader(type)}</div>
        <div className="thumbnail-image">
          <IonSkeletonText className="thumbnail-skeleton-img" animated={animated} />
        </div>
      </div>
    ))}
  </div>
);
