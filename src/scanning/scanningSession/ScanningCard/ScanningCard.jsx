import "./ScanningCard.scss";
import { THUMBNAIL_TYPES } from "../../scanningLib.js";
import { Thumbnail } from "../Thumbnail/Thumbnail.jsx";
import { PinnedAnnotations } from "../PinnedAnnotations/PinnedAnnotations.jsx";
import { CandidatePhotometryChart } from "../CandidatePhotometryChart/CandidatePhotometryChart.jsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScanningCardSkeleton } from "./ScanningCardSkeleton.jsx";

/**
 * Scanning card component
 * @param {Object} props
 * @param {import("../../scanningLib.js").Candidate} props.candidate
 * @param {React.MutableRefObject<any>} props.modal
 * @param {number} props.currentIndex
 * @param {number} props.nbCandidates
 * @param {import("embla-carousel").EmblaCarouselType|undefined} props.emblaApi
 * @returns {JSX.Element}
 */
export const ScanningCard = ({
  candidate,
  modal,
  currentIndex,
  nbCandidates,
  emblaApi,
}) => {
  const [isInView, setIsInView] = useState(false);
  const plotContainer = useRef(null);
  const shouldBeMounted = useCallback(
    () => emblaApi?.slidesInView().includes(currentIndex),
    [emblaApi],
  );
  const shouldUnmount = useCallback(
    () => !emblaApi?.slidesInView().includes(currentIndex),
    [emblaApi],
  );

  const updateIsInView = useCallback(() => {
    if (!isInView && shouldBeMounted()) {
      setIsInView(true);
    } else if (isInView && shouldUnmount()) {
      setIsInView(false);
    }
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) {
      updateIsInView();
      emblaApi.on("slidesInView", updateIsInView);
    }
    return () => {
      if (emblaApi) {
        emblaApi.off("slidesInView", updateIsInView);
      }
    };
  }, [emblaApi]);
  return isInView ? (
    <div className="scanning-card">
      <div className="candidate-name">
        <h1>{candidate.id}</h1>
        <div className="pagination-indicator">
          {currentIndex + 1}/{nbCandidates}
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
      <div className="plot-container" ref={plotContainer}>
        <CandidatePhotometryChart candidate={candidate} />
      </div>
    </div>
  ) : (
    <ScanningCardSkeleton />
  );
};
