import "./Thumbnail.scss";
import { getThumbnailAltAndSurveyLink, getThumbnailHeader, getThumbnailImageUrl } from "../../../scanning.lib.js";
import { useContext, useState } from "react";
import { UserContext } from "../../../../common/common.context.js";

/**
 * Thumbnail component
 * @param {Object} props
 * @param {import("../../../scanning.lib.js").Candidate} props.candidate
 * @param {string} props.type
 */
export const Thumbnail = ({ candidate, type }) => {
  const { userInfo } = useContext(UserContext);
  const instanceUrl = userInfo?.instance.url;
  const [src, setSrc] = useState(getThumbnailImageUrl(instanceUrl, candidate, type));
  if (src === null) {
    return null;
  }

  const { alt } = getThumbnailAltAndSurveyLink(
    instanceUrl,
    type,
    candidate.ra,
    candidate.dec
  );
  return (
    <div className={`thumbnail ${type}`}>
      <div className="thumbnail-name">{getThumbnailHeader(type)}</div>
      <div className="thumbnail-image">
        <img
          className="crosshairs"
          src={`${instanceUrl}/static/images/crosshairs.png`}
          alt="crosshairs"
        />
        <img
          className="cutout"
          src={src}
          alt={alt}
          onError={() => {
            setSrc(`${instanceUrl}/static/images/` +
              (type === "ls" ? "outside_survey.png" : "currently_unavailable.png"));
          }}
        />
      </div>
    </div>
  );
};
