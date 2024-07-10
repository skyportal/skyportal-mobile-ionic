import { getThumbnailImageUrl, THUMBNAIL_TYPES } from "../../scanning.js";
import { Thumbnail } from "../Thumbnail/Thumbnail.jsx";
import { CandidateAnnotations } from "../CandidateAnnotations/CandidateAnnotations.jsx";
import { IonButton } from "@ionic/react";
import { useState } from "react";
import { useQueryParams, useSearchCandidates } from "../../../common/hooks.js";

export const CandidateScanner = () => {
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const params = useQueryParams();
  const { candidates = [] } = useSearchCandidates({
    startDate: params.startDate,
    endDate: params.endDate,
    savedStatus: params.savedStatus,
    groupIDs: params.groupIDs,
  });
  if (candidates.length === 0) {
    return <p>No candidates found</p>;
  }
  const currentCandidate = candidates[currentCandidateIndex];
  return (
    <div className="candidate-scanner">
      <div className="scanning-card">
        <div className="thumbnails-container">
          {Object.keys(THUMBNAIL_TYPES).map((type) => (
            <Thumbnail
              key={type}
              name={type}
              ra={currentCandidate.ra}
              dec={currentCandidate.dec}
              url={getThumbnailImageUrl(currentCandidate, type)}
            />
          ))}
        </div>
        <CandidateAnnotations />
        <div className="photometry-container"></div>
        <IonButton>See more</IonButton>
      </div>
      <div className="action-buttons-container"></div>
    </div>
  );
};
