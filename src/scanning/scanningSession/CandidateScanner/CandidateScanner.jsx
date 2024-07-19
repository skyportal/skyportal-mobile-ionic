import "./CandidateScanner.scss";
import { IonButton, IonIcon, IonModal } from "@ionic/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryParams, useSearchCandidates } from "../../../common/hooks.js";
import { arrowForward, checkmark, trashBin } from "ionicons/icons";
import useEmblaCarousel from "embla-carousel-react";
import { CandidateAnnotationsViewer } from "../CandidateAnnotationsViewer/CandidateAnnotationsViewer.jsx";
import { ScanningCard } from "../ScanningCard/ScanningCard.jsx";
import { ScanningCardSkeleton } from "../ScanningCard/ScanningCardSkeleton.jsx";

export const CandidateScanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ watchResize: false });

  const selectCallback = useCallback(
    (/** @type {import("embla-carousel").EmblaCarouselType} */ e) =>
      setCurrentIndex(e.selectedScrollSnap()),
    [],
  );

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on("select", selectCallback);
    }
    return () => {
      if (emblaApi) {
        emblaApi.off("select", selectCallback);
      }
    };
  }, [emblaApi]);

  /** @type {React.MutableRefObject<any>} */
  const modal = useRef(null);
  const queryParams = useQueryParams();
  const { candidates } = useSearchCandidates({
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    savedStatus: queryParams.savedStatus,
    groupIDs: queryParams.groupIDs,
  });

  if (candidates?.length === 0) {
    return <p>No candidates found</p>;
  }
  // @ts-ignore
  const currentCandidate = candidates?.at(currentIndex);
  return (
    <div className="candidate-scanner">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {candidates?.map((candidate, index) => (
            <div key={candidate.id} className="embla__slide">
              <ScanningCard
                candidate={candidate}
                modal={modal}
                currentIndex={index}
                nbCandidates={candidates.length}
                emblaApi={emblaApi}
              />
            </div>
          )) ?? (
            <div className="embla__slide">
              <ScanningCardSkeleton animated={true} />
            </div>
          )}
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
        initialBreakpoint={0.75}
        breakpoints={[0, 0.25, 0.5, 0.75]}
      >
        <CandidateAnnotationsViewer
          // @ts-ignore
          candidate={currentCandidate}
        />
      </IonModal>
    </div>
  );
};
