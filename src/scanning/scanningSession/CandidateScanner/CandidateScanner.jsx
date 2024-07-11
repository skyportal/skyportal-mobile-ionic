import "./CandidateScanner.scss";
import { getThumbnailImageUrl, THUMBNAIL_TYPES } from "../../scanning.js";
import { Thumbnail } from "../Thumbnail/Thumbnail.jsx";
import { CandidateAnnotations } from "../CandidateAnnotations/CandidateAnnotations.jsx";
import { IonButton, IonIcon } from "@ionic/react";
import { useState } from "react";
import { useQueryParams, useSearchCandidates } from "../../../common/hooks.js";
import { arrowForward, checkmark, trashBin } from "ionicons/icons";

export const CandidateScanner = () => {
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const params = useQueryParams();
  const { /** @type {Candidate[]} */ candidates = [] } = useSearchCandidates({
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
        <div className="candidate-name">
          <h1>{currentCandidate.id}</h1>
        </div>
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
        <CandidateAnnotations candidate={currentCandidate} />
        <div className="plot-container"></div>
      </div>
      <div className="action-buttons-container">
        <IonButton shape="round" size="large" color="danger" fill="outline">
          <IonIcon icon={trashBin} slot="icon-only" />
        </IonButton>
        <IonButton shape="round" size="large" color="success" fill="outline">
          <IonIcon icon={checkmark} slot="icon-only" />
        </IonButton>
        <IonButton shape="round" size="large" color="secondary" fill="outline">
          <IonIcon icon={arrowForward} slot="icon-only" />
        </IonButton>
      </div>
    </div>
  );
};
