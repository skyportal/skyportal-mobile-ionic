import "./Thumbnail.scss";
import {
  getThumbnailAltAndLink,
  getThumbnailHeader,
} from "../../lib/sources.js";

export const Thumbnail = ({ name, ra, dec, url }) => {
  const { alt, link } = getThumbnailAltAndLink(name, ra, dec);
  return (
    <div className={`thumbnail ${name}`}>
      <div className="thumbnail-name">{getThumbnailHeader(name)}</div>
      <div className="thumbnail-image">
        <img
          className="crosshairs"
          src="https://preview.fritz.science/static/images/crosshairs.png"
          alt=""
        />
        <img
          className="h-auto w-full"
          src={url}
          alt={alt}
          onError={(e) => {
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
