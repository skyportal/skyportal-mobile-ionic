import "./ScanningCard.scss";
import { THUMBNAIL_TYPES } from "../../../scanning.lib.js";
import { Thumbnail } from "../Thumbnail/Thumbnail.jsx";
import { PinnedAnnotations } from "../PinnedAnnotations/PinnedAnnotations.jsx";
import { CandidatePhotometryChart } from "../CandidatePhotometryChart/CandidatePhotometryChart.jsx";
import { memo, useState } from "react";
import { ScanningCardSkeleton } from "./ScanningCardSkeleton.jsx";
import {
  IonButton, IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { FollowupRequests } from "../FollowupRequests/FollowupRequests.jsx";
import { Comments } from "../Comments/Comments.jsx";
import { CandidateSourceInfo } from "../CandidateSourceInfo/CandidateSourceInfo.jsx";
import { SpectraList } from "../Spectra/SpectraList.jsx";

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
  const [showGroupsSaveTo, setShowGroupsSaveTo] = useState(false);
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
              if (candidate.is_source) setShowGroupsSaveTo(true);
            }}
          >
            {candidate.is_source ? "Previously Saved" : "Not saved"}
          </IonChip>
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
        <CandidateSourceInfo candidate={candidate} />
        <Comments comments={candidate.comments} />
        <SpectraList candidate={candidate} />
        <FollowupRequests candidate={candidate} requestType={"triggered"} />
        <FollowupRequests candidate={candidate} requestType={"forced_photometry"}/>
      </div>
      <ScanningCardSkeleton visible={!isInView} />
      {/* Saved groups modal */}
      <IonModal isOpen={showGroupsSaveTo} onDidDismiss={() => setShowGroupsSaveTo(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Saved Groups</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowGroupsSaveTo(false)}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {candidate.saved_groups?.length ? (
            candidate.saved_groups.map((group) => (
              <IonChip key={group.name} color="secondary">
                {group.name}
              </IonChip>
            ))
          ) : (
            <p>No saved groups</p>
          )}
        </IonContent>
      </IonModal>
    </div>
  );
};

export const ScanningCard = memo(ScanningCardBase);
