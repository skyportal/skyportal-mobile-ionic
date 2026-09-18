import "../Thumbnail/Thumbnail.scss";
import { IonSkeletonText } from "@ionic/react";
import { getThumbnailHeader } from "../../sources.lib.js";

/**
 * @param {Object} props
 * @param {import("../../sources.lib.js").ThumbnailType} props.type
 * @param {boolean} props.animated
 * @returns {JSX.Element}
 */
export const ThumbnailSkeleton = ({ type, animated }) => {
  return (
    <div className="thumbnail">
      <div className="thumbnail-name">{getThumbnailHeader(type)}</div>
      <div className="thumbnail-image">
        <IonSkeletonText
          className="thumbnail-skeleton-img"
          style={{ margin: "0" }}
          animated={animated}
        />
      </div>
    </div>
  );
};
