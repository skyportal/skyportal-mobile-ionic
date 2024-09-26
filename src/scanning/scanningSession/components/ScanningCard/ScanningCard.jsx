import "./ScanningCard.scss";
import { THUMBNAIL_TYPES } from "../../../scanning.lib.js";
import { Thumbnail } from "../Thumbnail/Thumbnail.jsx";
import { PinnedAnnotations } from "../PinnedAnnotations/PinnedAnnotations.jsx";
import { CandidatePhotometryChart } from "../CandidatePhotometryChart/CandidatePhotometryChart.jsx";
import { memo } from "react";
import { ScanningCardSkeleton } from "./ScanningCardSkeleton.jsx";

/**
 * Scanning card component
 * @param {Object} props
 * @param {import("../../../scanning.lib.js").Candidate} props.candidate
 * @param {React.MutableRefObject<any>} props.modal
 * @param {number} props.currentIndex
 * @param {number} props.nbCandidates
 * @param {boolean} props.isInView
 * @param {string[]} props.pinnedAnnotations
 * @returns {JSX.Element}
 */
const ScanningCardBase = ({
  candidate,
  modal,
  currentIndex,
  nbCandidates,
  isInView,
  pinnedAnnotations,
}) => {
  return (
    <div className="scanning-card-container">
      <div
        className="scanning-card"
        style={{ visibility: isInView ? "visible" : "hidden" }}
      >
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
          pinnedAnnotationIds={pinnedAnnotations}
        />
        <div className="plot-container">
          <CandidatePhotometryChart
            candidateId={candidate.id}
            isInView={isInView}
          />
        </div>
      </div>
      <ScanningCardSkeleton visible={!isInView} />
    </div>
  );
};

export const ScanningCard = memo(ScanningCardBase);
