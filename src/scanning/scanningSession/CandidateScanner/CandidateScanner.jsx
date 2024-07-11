import "./CandidateScanner.scss";
import { THUMBNAIL_TYPES } from "../../scanning.js";
import { Thumbnail } from "../Thumbnail/Thumbnail.jsx";
import { CandidateAnnotations } from "../CandidateAnnotations/CandidateAnnotations.jsx";
import { IonButton, IonIcon } from "@ionic/react";
import { useCallback, useEffect, useState } from "react";
import { useQueryParams, useSearchCandidates } from "../../../common/hooks.js";
import { arrowForward, checkmark, trashBin } from "ionicons/icons";
import "swiper/css";
import useEmblaCarousel from "embla-carousel-react";

export const CandidateScanner = () => {
  const params = useQueryParams();
  const { candidates } = useSearchCandidates({
    startDate: params.startDate,
    endDate: params.endDate,
    savedStatus: params.savedStatus,
    groupIDs: params.groupIDs,
  });
  if (candidates?.length === 0) {
    return <p>No candidates found</p>;
  }
  const [currentIndex, setCurrentIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel();
  const selectCallback = useCallback(
    (/** @type {import("embla-carousel").EmblaCarouselType} */ e) =>
      setCurrentIndex(e.selectedScrollSnap()),
    [],
  );
  useEffect(() => {
    if (emblaApi) emblaApi.on("select", selectCallback);
    return () => {
      if (emblaApi) emblaApi.off("select", selectCallback);
    };
  }, [emblaApi]);
  return (
    <div className="candidate-scanner">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {candidates?.map((candidate) => (
            <div key={candidate.id} className="embla__slide">
              <div className="scanning-card">
                <div className="candidate-name">
                  <h1>{candidate.id}</h1>
                  <div className="pagination-indicator">
                    {currentIndex + 1}/{candidates.length}
                  </div>
                </div>
                <div className="thumbnails-container">
                  {Object.keys(THUMBNAIL_TYPES).map((type) => (
                    <Thumbnail key={type} candidate={candidate} type={type} />
                  ))}
                </div>
                <CandidateAnnotations candidate={candidate} />
                <div className="plot-container"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="action-buttons-container">
        <IonButton shape="round" size="large" color="danger" fill="outline">
          <IonIcon icon={trashBin} slot="icon-only" />
        </IonButton>
        <IonButton shape="round" size="large" color="success" fill="outline">
          <IonIcon icon={checkmark} slot="icon-only" />
        </IonButton>
        <IonButton
          shape="round"
          size="large"
          color="secondary"
          fill="outline"
          onClick={() => emblaApi?.scrollNext()}
        >
          <IonIcon icon={arrowForward} slot="icon-only" />
        </IonButton>
      </div>
    </div>
  );
};
