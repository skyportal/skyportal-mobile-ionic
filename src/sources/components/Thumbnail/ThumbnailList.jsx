import "./ThumbnailList.scss";
import { useState } from "react";
import { IonButton, IonIcon, IonText } from "@ionic/react";
import { chevronBack, chevronForward } from "ionicons/icons";
import { Thumbnail } from "./Thumbnail.jsx";
import {
  ALERT_THUMBNAIL_TYPES,
  getDisplayedThumbnails,
  ON_DEMAND_THUMBNAIL_TYPES,
  THUMBNAIL_TYPES
} from "../../sources.lib.js";
import { useGenerateSurveyThumbnails } from "../../sources.hooks.js";

/** 3 columns over 2 rows, the remaining thumbnails are reached with the arrows. */
const MAX_VISIBLE_THUMBNAILS = 6;

/** @type {import("../../sources.lib.js").Thumbnail} */
const PS1_PENDING_THUMBNAIL = {
  id: -1,
  type: "ps1",
  public_url: "#",
  created_at: "",
  survey: null,
  is_grayscale: false,
};

/**
 * Thumbnails of a source, dropping the ones the surveys report as having no
 * coverage at that position.
 * @param {Object} props
 * @param {import("../../sources.lib.js").Source|import("../../../scanning/scanning.lib.js").Candidate} props.source
 * @param {boolean} [props.isCandidate] - Candidates only display the cutouts generated on scanning
 * @returns {JSX.Element}
 */
export const ThumbnailList = ({ source, isCandidate = false }) => {
  const [unavailable, setUnavailable] = useState(
    /** @type {Set<number>} */ (new Set()),
  );
  const [offset, setOffset] = useState(0);
  const [generated, setGenerated] = useState(
    /** @type {import("../../sources.lib.js").Thumbnail[]} */ ([]),
  );
  const generateThumbnails = useGenerateSurveyThumbnails();

  const allThumbnails = [...(source.thumbnails ?? []), ...generated];
  const hasPs1 = allThumbnails.some((thumbnail) => thumbnail.type === "ps1");
  const displayTypes = isCandidate
    ? THUMBNAIL_TYPES.filter(
        (type) =>
          !ON_DEMAND_THUMBNAIL_TYPES.includes(type) && (type !== "ps1" || hasPs1),
      )
    : THUMBNAIL_TYPES;
  const thumbnails = getDisplayedThumbnails({ ...source, thumbnails: allThumbnails })
    .filter((thumbnail) => displayTypes.includes(thumbnail.type));
  const shown = thumbnails.filter((thumbnail) => !unavailable.has(thumbnail.id));
  // PanSTARRS is resolved by the instance after the source loads.
  const tiles =
    !isCandidate && !hasPs1 && shown.some((thumbnail) => !ALERT_THUMBNAIL_TYPES.includes(thumbnail.type))
      ? [...shown, PS1_PENDING_THUMBNAIL]
      : shown;

  const maxOffset = Math.max(0, tiles.length - MAX_VISIBLE_THUMBNAILS);
  const clampedOffset = Math.min(offset, maxOffset);
  const visibleTiles = tiles.slice(clampedOffset, clampedOffset + MAX_VISIBLE_THUMBNAILS);
  const showControls = tiles.length > MAX_VISIBLE_THUMBNAILS;
  const hasOnDemand = thumbnails.some((thumbnail) =>
    ON_DEMAND_THUMBNAIL_TYPES.includes(thumbnail.type),
  );

  /**
   * @param {import("../../sources.lib.js").ThumbnailType[]} [types]
   */
  const requestThumbnails = (types) =>
    generateThumbnails.mutate(
      { sourceId: source.id, types },
      { onSuccess: setGenerated },
    );

  return (
    <div className="thumbnail-list">
      <div className="thumbnails-row">
        {showControls && (
          <IonButton
            fill="clear"
            size="small"
            aria-label="previous thumbnails"
            disabled={clampedOffset === 0}
            onClick={() => setOffset(Math.max(0, clampedOffset - MAX_VISIBLE_THUMBNAILS))}
          >
            <IonIcon slot="icon-only" icon={chevronBack} />
          </IonButton>
        )}
        <div className="thumbnails-container">
          {visibleTiles.length > 0 ? (
            visibleTiles.map((thumbnail) => (
              <Thumbnail
                key={thumbnail.id}
                ra={source.ra}
                dec={source.dec}
                thumbnail={thumbnail}
                onUnavailable={() =>
                  setUnavailable((previous) =>
                    previous.has(thumbnail.id)
                      ? previous
                      : new Set(previous).add(thumbnail.id),
                  )
                }
              />
            ))
          ) : (
            <div>
              <IonText color="secondary">no thumbnails found...</IonText>
            </div>
          )}
        </div>
        {showControls && (
          <IonButton
            fill="clear"
            size="small"
            aria-label="next thumbnails"
            disabled={clampedOffset >= maxOffset}
            onClick={() => setOffset(Math.min(maxOffset, clampedOffset + MAX_VISIBLE_THUMBNAILS))}
          >
            <IonIcon slot="icon-only" icon={chevronForward} />
          </IonButton>
        )}
      </div>
      {isCandidate
        ? !hasPs1 && (
            <IonButton
              fill="clear"
              size="small"
              disabled={generateThumbnails.isPending}
              onClick={() => requestThumbnails()}
            >
              Generate PS1 Cutout
            </IonButton>
          )
        : !hasOnDemand && (
            <IonButton
              fill="clear"
              size="small"
              disabled={generateThumbnails.isPending}
              onClick={() => requestThumbnails(ON_DEMAND_THUMBNAIL_TYPES)}
            >
              {generateThumbnails.isPending ? "Loading…" : "Request more thumbnails"}
            </IonButton>
          )}
    </div>
  );
};
