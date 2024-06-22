import "./ScanningScreen.scss";
import { IonButton, IonContent, IonPage } from "@ionic/react";
import { Thumbnail } from "../../components/Thumbnail/Thumbnail.jsx";
import {
  getThumbnailImageUrl,
  searchCandidates,
  THUMBNAIL_TYPES,
} from "../../lib/sources.js";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const ScanningScreen = () => {
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const {
    data: candidates,
    status,
    error,
  } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => searchCandidates(),
  });
  if (status === "pending") {
    return <p>Loading...</p>;
  }
  const currentCandidate = candidates[currentCandidateIndex];
  return (
    <IonPage>
      <IonContent>
        <div className="scanning-container">
          <div className="scanning-card">
            <div className="thumbnails-container">
              {Object.keys(THUMBNAIL_TYPES).map((type, index) => (
                <Thumbnail
                  key={type}
                  name={type}
                  ra={currentCandidate.ra}
                  dec={currentCandidate.dec}
                  url={getThumbnailImageUrl(currentCandidate, type)}
                />
              ))}
            </div>
            <div className="annotations-container"></div>
            <div className="photometry-container"></div>
            <IonButton>See more</IonButton>
          </div>
          <div className="action-buttons-container"></div>
        </div>
      </IonContent>
    </IonPage>
  );
};
