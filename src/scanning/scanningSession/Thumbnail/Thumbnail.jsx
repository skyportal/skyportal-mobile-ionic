import "./Thumbnail.scss";
import {
  getThumbnailAltAndSurveyLink,
  getThumbnailHeader,
} from "../../scanning.js";

/**
 * Thumbnail component
 * @param {Object} props
 * @param {string} props.name
 * @param {number} props.ra
 * @param {number} props.dec
 * @param {string} props.url
 */
export const Thumbnail = ({ name, ra, dec, url }) => {
  const { alt } = getThumbnailAltAndSurveyLink(name, ra, dec);
  return (
    <div className={`thumbnail ${name}`}>
      <div className="thumbnail-name">{getThumbnailHeader(name)}</div>
      <div className="thumbnail-image">
        <img
          className="crosshairs"
          src="https://preview.fritz.science/static/images/crosshairs.png"
          alt=""
          loading="lazy"
        />
        <img
          src={url}
          alt={alt}
          loading="lazy"
          onError={(/** @type {any} */ e) => {
            e.target.onerror = null;
            if (name === "ls") {
              e.target.src =
                "https://preview.fritz.science/static/images/outside_survey.png";
            } else {
              e.target.src =
                "https://preview.fritz.science/static/images/currently_unavailable.png";
            }
          }}
        />
      </div>
    </div>
  );
};
