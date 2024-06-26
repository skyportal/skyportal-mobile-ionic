import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useContext, useState } from "react";
import { AppContext } from "../../util/context.js";
import { useQuery } from "@tanstack/react-query";
import {
  getThumbnailImageUrl,
  searchCandidates,
  THUMBNAIL_TYPES,
} from "../scanning.js";
import { Capacitor } from "@capacitor/core";
import { Thumbnail } from "../Thumbnail/Thumbnail.jsx";
import { CandidateAnnotations } from "../CandidateAnnotations/CandidateAnnotations.jsx";

export const MainScanningScreen = () => {
  const { userInfo } = useContext(AppContext);
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const {
    data: candidates,
    status,
    error,
  } = useQuery({
    queryKey: ["candidates"],
    queryFn: () =>
      searchCandidates({
        token: userInfo.token,
        instanceUrl: userInfo.instance.url,
        platform: Capacitor.getPlatform(),
      }),
  });
  if (status === "pending") {
    return <p>Loading...</p>;
  }
  if (status === "error") {
    return <p>Error: {error.message}</p>;
  }
  const currentCandidate = candidates[currentCandidateIndex];
  return (
    <IonPage>
      <IonContent>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Scanning</IonTitle>
          </IonToolbar>
        </IonHeader>
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
