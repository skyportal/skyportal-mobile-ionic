import "./ScanningCard.scss";
import { ThumbnailList } from "../../../../sources/components/Thumbnail/ThumbnailList.jsx";
import { PinnedAnnotations } from "../../../../sources/components/PinnedAnnotations/PinnedAnnotations.jsx";
import { PhotometryChart } from "../../../../sources/components/PhotometryChart/PhotometryChart.jsx";
import { memo, useRef } from "react";
import { ScanningCardSkeleton } from "./ScanningCardSkeleton.jsx";
import { IonChip } from "@ionic/react";
import { SourceInfo } from "../../../../sources/components/SourceInfo/SourceInfo.jsx";
import { FollowupRequests } from "../../../../sources/components/FollowupRequests/FollowupRequests.jsx";
import { Comments } from "../../../../sources/components/Comments/Comments.jsx";
import { SpectraList } from "../../../../sources/components/Spectra/SpectraList.jsx";
import { GroupsModal } from "../../../../sources/components/GroupsModal/GroupsModal.jsx";
import { Tags } from "../../../../sources/components/Tags/Tags.jsx";
import { AnnotationsViewerModal } from "../../../../sources/components/PinnedAnnotations/AnnotationsViewerModal.jsx";

/**
 * Scanning card component
 * @param {Object} props
 * @param {import("../../../scanning.lib.js").Candidate} props.candidate
 * @param {number} props.currentIndex
 * @param {number} props.nbCandidates
 * @param {boolean} props.isInView
 * @param {string[]} props.pinnedAnnotations
 * @returns {JSX.Element}
 */
const ScanningCardBase = ({
  candidate,
  currentIndex,
  nbCandidates,
  isInView,
  pinnedAnnotations,
}) => {
  /** @type {React.MutableRefObject<any>} */
  const groupsModal = useRef(null);
  /** @type {React.MutableRefObject<any>} */
  const annotationsModal = useRef(null);

  return (
    <div className="scanning-card-container">
      <div
        className="scanning-card"
        style={{ visibility: isInView ? "visible" : "hidden" }}
      >
        <div className="candidate-header">
          <h1>{candidate.id}</h1>
          <IonChip
            className="is-saved"
            color={candidate.is_source ? "primary" : "secondary"}
            onClick={() => {
              if (candidate.is_source) groupsModal.current?.present();
            }}
          >
            {candidate.is_source ? "Previously Saved" : "Not saved"}
          </IonChip>
          <div className="pagination-indicator">
            {currentIndex + 1}/{nbCandidates}
          </div>
          <Tags tags={candidate.tags} sourceId={candidate.id} />
        </div>
        <ThumbnailList source={candidate} isCandidate />
        <PinnedAnnotations
          source={candidate}
          onButtonClick={() => annotationsModal.current?.present()}
          pinnedAnnotationIds={pinnedAnnotations}
        />
        <div className="plot-container">
          <PhotometryChart
            sourceId={candidate.id}
            isInView={isInView}
          />
        </div>
        <SourceInfo source={candidate} />
        <Comments
          sourceId={candidate.id}
          isInView={isInView}
          origin="scanning"
        />
        <SpectraList sourceId={candidate.id} isInView={isInView} />
        <FollowupRequests source={candidate} requestType={"triggered"} />
        <FollowupRequests source={candidate} requestType={"forced_photometry"}/>
      </div>
      <ScanningCardSkeleton visible={!isInView} />
      {/* Modals */}
      <GroupsModal title="Saved Groups" groups={candidate.saved_groups} modal={groupsModal} />
      <AnnotationsViewerModal source={candidate} modal={annotationsModal}/>
    </div>
  );
};

export const ScanningCard = memo(ScanningCardBase);
