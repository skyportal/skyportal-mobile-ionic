import "./Thumbnail.scss";
import { getThumbnailAltAndSurveyLink, getThumbnailHeader, getThumbnailImageUrl } from "../../sources.lib.js";
import { useContext, useState } from "react";
import { UserContext } from "../../../common/common.context.js";
import { useUserProfile } from "../../../common/common.hooks.js";

/**
 * Thumbnail component
 * @param {Object} props
 * @param {number} props.ra - Right ascension of the source
 * @param {number} props.dec - Declination of the source
 * @param {import("../../sources.lib.js").Thumbnail} props.thumbnail
 */
export const Thumbnail = ({ ra, dec, thumbnail }) => {
  const { userInfo } = useContext(UserContext);
  const { userProfile } = useUserProfile();
  const instanceUrl = userInfo?.instance.url;
  const [src, setSrc] = useState(getThumbnailImageUrl(instanceUrl, thumbnail));

  const { alt, link } = getThumbnailAltAndSurveyLink(thumbnail.type, ra, dec);
  const inverted = thumbnail.is_grayscale && userProfile?.preferences?.invertThumbnails;
  const image = (
    <>
      <div className="thumbnail-name">
        {getThumbnailHeader(thumbnail.type, thumbnail.survey)}
      </div>
      <div className="thumbnail-image">
        <img
          className="crosshairs"
          src={`${instanceUrl}/static/images/crosshairs.png`}
          alt="crosshairs"
        />
        <img
          className={`cutout ${inverted ? "inverted" : ""}`}
          src={src}
          alt={alt}
          onError={() => {
            setSrc(`${instanceUrl}/static/images/` +
              (thumbnail.type === "ls" ? "outside_survey.png" : "currently_unavailable.png"));
          }}
        />
      </div>
    </>
  );

  return (
    <div className={`thumbnail ${thumbnail.type}`}>
      {link ? (
        <a href={link} target="_blank" rel="noreferrer">
          {image}
        </a>
      ) : (
        image
      )}
    </div>
  );
};
