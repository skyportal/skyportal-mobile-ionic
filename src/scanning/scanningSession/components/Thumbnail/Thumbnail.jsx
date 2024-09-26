import "./Thumbnail.scss";
import { getThumbnailAltAndSurveyLink, getThumbnailHeader, getThumbnailImageUrl } from "../../../scanning.lib.js";
import { useState } from "react";

/**
 * Thumbnail component
 * @param {Object} props
 * @param {import("../../../scanning.lib.js").Candidate} props.candidate
 * @param {string} props.type
 */
export const Thumbnail = ({ candidate, type }) => {
  const [src, setSrc] = useState(getThumbnailImageUrl(candidate, type));
  const { alt } = getThumbnailAltAndSurveyLink(
    type,
    candidate.ra,
    candidate.dec,
  );
  return (
    <div className={`thumbnail ${type}`}>
      <div className="thumbnail-name">{getThumbnailHeader(type)}</div>
      <div className="thumbnail-image">
        <img
          className="crosshairs"
          src="https://preview.fritz.science/static/images/crosshairs.png"
          alt=""
        />
        <img
          className="cutout"
          src={src}
          alt={alt}
          onError={() => {
            if (type === "ls") {
              setSrc(
                "https://preview.fritz.science/static/images/outside_survey.png",
              );
            } else {
              setSrc(
                "https://preview.fritz.science/static/images/currently_unavailable.png",
              );
            }
          }}
        />
      </div>
    </div>
  );
};
