import "./Thumbnail.scss";
import {
  getThumbnailAltAndSurveyLink,
  getThumbnailHeader,
  getThumbnailImageUrl,
} from "../../scanning.js";
import { IonImg, IonSkeletonText, IonThumbnail } from "@ionic/react";
import { useState } from "react";

/**
 * Thumbnail component
 * @param {Object} props
 * @param {import("../../scanning").Candidate} props.candidate
 * @param {string} props.type
 */
export const Thumbnail = ({ candidate, type }) => {
  const [src, setSrc] = useState(getThumbnailImageUrl(candidate, type));
  const [imageIsLoading, setImageIsLoading] = useState(true);
  const { alt } = getThumbnailAltAndSurveyLink(
    type,
    candidate.ra,
    candidate.dec,
  );
  return (
    <div className={`thumbnail ${type}`}>
      <div className="thumbnail-name">{getThumbnailHeader(type)}</div>
      <div className="thumbnail-image">
        <IonThumbnail
          className={`thumbnail-skeleton ${type} ${imageIsLoading ? "loading" : "loaded"}`}
        >
          <IonSkeletonText animated />
        </IonThumbnail>
        <img
          className="crosshairs"
          src="https://preview.fritz.science/static/images/crosshairs.png"
          alt=""
        />
        <IonImg
          src={src}
          alt={alt}
          onIonImgDidLoad={() => setImageIsLoading(false)}
          onIonError={() => {
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
