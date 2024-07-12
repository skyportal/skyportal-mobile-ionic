import "./CandidateScanner.scss";
import { THUMBNAIL_TYPES } from "../../scanning.js";
import { Thumbnail } from "../Thumbnail/Thumbnail.jsx";
import { IonButton, IonIcon, IonModal } from "@ionic/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryParams, useSearchCandidates } from "../../../common/hooks.js";
import { arrowForward, checkmark, trashBin } from "ionicons/icons";
import useEmblaCarousel from "embla-carousel-react";
import { PinnedAnnotations } from "../PinnedAnnotations/PinnedAnnotations.jsx";
import { CandidateAnnotationsViewer } from "../CandidateAnnotationsViewer/CandidateAnnotationsViewer.jsx";

export const CandidateScanner = () => {
  const params = useQueryParams();
  const [candidates] = useState(
    useSearchCandidates({
      startDate: params.startDate,
      endDate: params.endDate,
      savedStatus: params.savedStatus,
      groupIDs: params.groupIDs,
    }).candidates,
  );
  if (!candidates || candidates?.length === 0) {
    return <p>No candidates found</p>;
  }
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentCandidate = candidates[currentIndex];

  const [emblaRef, emblaApi] = useEmblaCarousel();
  const selectCallback = useCallback(
    (/** @type {import("embla-carousel").EmblaCarouselType} */ e) =>
      setCurrentIndex(e.selectedScrollSnap()),
    [],
  );
  /** @type {React.MutableRefObject<any>} */
  const modal = useRef(null);
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
                <PinnedAnnotations
                  candidate={candidate}
                  onButtonClick={() => modal.current?.present()}
                />
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
      <IonModal
        ref={modal}
        isOpen={false}
        initialBreakpoint={0.25}
        breakpoints={[0, 0.25, 0.5, 0.75]}
      >
        <CandidateAnnotationsViewer
          candidate={currentCandidate}
          modal={modal}
        />
      </IonModal>
    </div>
  );
};
