import "./MainScanningScreen.scss";
import { IonButton, IonContent, IonPage } from "@ionic/react";
import { useState } from "react";
import { getThumbnailImageUrl, THUMBNAIL_TYPES } from "../scanning.js";
import { Thumbnail } from "../Thumbnail/Thumbnail.jsx";
import { CandidateAnnotations } from "../CandidateAnnotations/CandidateAnnotations.jsx";
import { useSearchCandidates } from "../../common/hooks.js";

export const MainScanningScreen = () => {
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const { candidates, status, error } = useSearchCandidates();

  if (!candidates || status === "pending") {
    return <p>Loading...</p>;
  }
  if (status === "error") {
    return <p>Error: {error.message}</p>;
  }
  const currentCandidate = candidates[currentCandidateIndex];
  return (
    <IonPage>
      <IonContent>
        <div className="main-scanning-screen-container">
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
      </IonContent>
    </IonPage>
  );
};
