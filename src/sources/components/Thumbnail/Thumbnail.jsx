import "./Thumbnail.scss";
import {
  FETCHED_THUMBNAIL_TYPES,
  getThumbnailAltAndSurveyLink,
  getThumbnailHeader,
  getThumbnailImageUrl
} from "../../sources.lib.js";
import { useContext, useEffect, useRef, useState } from "react";
import { IonSkeletonText } from "@ionic/react";
import { UserContext } from "../../../common/common.context.js";
import { useUserProfile } from "../../../common/common.hooks.js";

const MAX_NB_OF_RETRIES = 3;

/**
 * Thumbnail component
 * @param {Object} props
 * @param {number} props.ra - Right ascension of the source
 * @param {number} props.dec - Declination of the source
 * @param {import("../../sources.lib.js").Thumbnail} props.thumbnail
 * @param {() => void} [props.onUnavailable] - Called when the survey has no coverage at that position
 * @returns {JSX.Element}
 */
export const Thumbnail = ({ ra, dec, thumbnail, onUnavailable }) => {
  const { userInfo } = useContext(UserContext);
  const { userProfile } = useUserProfile();
  const instanceUrl = userInfo?.instance.url;
  /** Cutout the instance is still resolving, it has no url yet. */
  const isPending = thumbnail.public_url === "#";
  const isFetched = FETCHED_THUMBNAIL_TYPES.includes(thumbnail.type);
  const url = isPending ? "" : getThumbnailImageUrl(instanceUrl, thumbnail);
  const [status, setStatus] = useState("loading");
  const [src, setSrc] = useState(isFetched || isPending ? null : url);
  const [retry, setRetry] = useState(0);
  const onUnavailableRef = useRef(onUnavailable);

  useEffect(() => {
    onUnavailableRef.current = onUnavailable;
  }, [onUnavailable]);

  useEffect(() => {
    setStatus("loading");
    setRetry(0);
    setSrc(isFetched || isPending ? null : url);
  }, [url, isFetched, isPending]);

  useEffect(() => {
    if (!isFetched) {
      return undefined;
    }
    let cancelled = false;
    /** @type {string|null} */
    let objectUrl = null;
    fetch(url)
      .then((response) => {
        if (response.status === 429) {
          if (retry < MAX_NB_OF_RETRIES) {
            setTimeout(() => !cancelled && setRetry((previous) => previous + 1), 2000);
          } else {
            setStatus("Too Many Requests");
          }
          return null;
        }
        // Outside their footprint these services answer a 404 holding a blank image.
        if (response.status === 404) {
          setStatus("Outside Survey Area");
          onUnavailableRef.current?.();
          return null;
        }
        if (!response.ok) {
          setStatus("Currently Unavailable");
          return null;
        }
        return response.blob();
      })
      .then((blob) => {
        if (cancelled || !blob) {
          return;
        }
        // Legacy Survey answers a tiny grey image when it has no coverage.
        if (thumbnail.type === "ls" && blob.size < 1500) {
          setStatus("Outside Survey Area");
          onUnavailableRef.current?.();
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => !cancelled && setStatus("Currently Unavailable"));
    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url, isFetched, retry, thumbnail.type]);

  const { alt, link } = getThumbnailAltAndSurveyLink(thumbnail.type, ra, dec);
  const inverted = thumbnail.is_grayscale && userProfile?.preferences?.invertThumbnails;
  const image = (
    <>
      <div className="thumbnail-name">
        {getThumbnailHeader(thumbnail.type, thumbnail.survey)}
      </div>
      <div className="thumbnail-image">
        {status === "loading" || status === "loaded" ? (
          <>
            {src && (
              <img
                className={`cutout ${inverted ? "inverted" : ""}`}
                src={src}
                alt={alt}
                style={{ opacity: status === "loaded" ? 1 : 0 }}
                onLoad={() => setStatus("loaded")}
                onError={() => !isFetched && setStatus("Currently Unavailable")}
              />
            )}
            {status === "loading" ? (
              <IonSkeletonText
                className="thumbnail-skeleton-img"
                style={{ margin: "0" }}
                animated
              />
            ) : (
              thumbnail.type !== "sdss" && (
                <img
                  className="crosshairs"
                  src={`${instanceUrl}/static/images/crosshairs.png`}
                  alt="crosshairs"
                />
              )
            )}
          </>
        ) : (
          <div className="thumbnail-status">{status}</div>
        )}
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
