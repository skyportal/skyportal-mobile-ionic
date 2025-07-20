import "./Source.scss";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonPage, IonText,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonToast
} from "@ionic/react";
import { useParams } from "react-router";
import { useFetchSource, useUpdateSourceGroups } from "../../sources.hooks.js";
import React, { useEffect, useRef, useState } from "react";
import { THUMBNAIL_TYPES } from "../../sources.lib.js";
import { Thumbnail } from "../../components/Thumbnail/Thumbnail.jsx";
import {
  PinnedAnnotations
} from "../../components/PinnedAnnotations/PinnedAnnotations.jsx";
import {
  PhotometryChart
} from "../../components/PhotometryChart/PhotometryChart.jsx";
import {
  SourceInfo
} from "../../components/SourceInfo/SourceInfo.jsx";
import { Comments } from "../../components/Comments/Comments.jsx";
import { SpectraList } from "../../components/Spectra/SpectraList.jsx";
import { FollowupRequests } from "../../components/FollowupRequests/FollowupRequests.jsx";
import {
  AnnotationsViewerModal
} from "../../components/PinnedAnnotations/AnnotationsViewerModal.jsx";
import { GroupsModal } from "../../components/GroupsModal/GroupsModal.jsx";
import { SourceSkeleton } from "./SourceSkeleton.jsx";
import { RequestFollowupModal } from "../../components/FollowupRequests/RequestFollowupModal.jsx";
import { QUERY_KEYS } from "../../../common/common.lib.js";
import { useQueryClient } from "@tanstack/react-query";
import { useConfirmAlert, useErrorToast, useUserAccessibleGroups } from "../../../common/common.hooks.js";
import { checkmarkCircleOutline } from "ionicons/icons";

/**
 * @typedef {Object} RouteParams
 * @property {string} sourceId
 * @returns {JSX.Element}
 */
export function Source() {
  const { userAccessibleGroups } = useUserAccessibleGroups();
  const updateSourceGroups = useUpdateSourceGroups();
  /** @type {RouteParams} */
  const { sourceId } = useParams();
  const queryClient = useQueryClient();
  const { source } = useFetchSource({ sourceId });
  const [loading, setLoading] = useState(true);
  /** @type {React.MutableRefObject<any>} */
  const annotationsModal = useRef(null);
  /** @type {React.MutableRefObject<any>} */
  const groupsModal = useRef(null);
  /** @type {React.MutableRefObject<any>} */
  const requestFollowupModal = useRef(null);

  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const errorToast = useErrorToast();
  const confirmAlert = useConfirmAlert()


  useEffect(() => {
    if (source !== undefined) {
      setLoading(false);
    }
  }, [source]);

  /**
   * @param {boolean} isSubmitted
   */
  const handleFollowupRequestSubmitted = async (isSubmitted) => {
    if (isSubmitted) {
      queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEYS.SOURCE,
          sourceId
        ],
      });
    }
  };

  /**
   * Prompt the user to select groups to save or remove from the source.
   * @param {import("../../../common/common.lib.js").Group[]} availableGroups - The list of groups available for selection.
   * @param {import("../../sources.lib.js").Source} source - The source object to check current group membership.
   */
  const promptUserForGroupSelection = (availableGroups, source) =>
    new Promise((resolve) => {
      presentAlert({
        header: "Manage Groups",
        message: "Select or deselect groups to save or remove the source from.",
        buttons: ["Update"],
        /** @type {import("@ionic/react").AlertInput[]} */
        inputs: availableGroups.map((group) => ({
          type: "checkbox",
          label: group.name,
          value: String(group.id),
          checked: source?.groups?.some((g) => g.id === group.id) ?? false,
        })),
        onDidDismiss: (/** @type {any} **/ e) => {
          if (e.detail.data !== undefined) {
            resolve(e.detail.data.values);
          }
        },
      });
    });

  const manageSourceGroups = async () => {
    if (!userAccessibleGroups || !source) {
      errorToast("This user has no accessible groups or source data is not available.");
      return;
    }

    const selectedIds = await promptUserForGroupSelection(userAccessibleGroups, source);
    const currentIds = source.groups.map(group => String(group.id));

    // Only add or remove groups if there are not already added or removed
    const groupIdsToAdd = [...selectedIds].filter(id => !currentIds.includes(id));
    const groupIdsToRemove = [...currentIds].filter(id => !selectedIds.includes(id));

    if (groupIdsToAdd.length === 0 && groupIdsToRemove.length === 0) {
      presentToast({
        message: `No changes made to source groups.`,
        duration: 2000,
        position: "top",
        color: "warning",
        icon: checkmarkCircleOutline,
      });
      return
    }

    if (groupIdsToRemove.length > 0) {
      const confirmed = await confirmAlert("This will remove the source from the unselected groups for all group members.");
      if (!confirmed) return;
    }

    updateSourceGroups.mutate({
      sourceId: sourceId,
      groupIdsToAdd,
      groupIdsToRemove
    });
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.SOURCE, sourceId],
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Source details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {source ? (
          <div className="source-page">
            <div className="source">
              <div className="header">
                <h1>{source.id}</h1>
                <IonChip
                  className="source-groups-chip"
                  color="primary"
                  onClick={manageSourceGroups}
                >
                  Manage groups
                </IonChip>
              </div>
              <div className="thumbnails-container">
                {source.thumbnails?.length > 0 ? Object.keys(THUMBNAIL_TYPES).map((type) => (
                  <Thumbnail key={type} source={source} type={type} />
                )) : (
                  <div>
                    <IonText color="secondary">
                      no thumbnails found...
                    </IonText>
                  </div>
                )}
              </div>
              <PinnedAnnotations
                source={source}
                onButtonClick={() => annotationsModal.current?.present()}
              />
              <div className="plot-container">
                <PhotometryChart
                  sourceId={source.id}
                />
              </div>
              <SourceInfo source={source} />
              <Comments comments={source.comments} />
              <SpectraList sourceId={source.id} />
              <FollowupRequests source={source} requestType={"triggered"} />
              <FollowupRequests source={source} requestType={"forced_photometry"}/>
              <IonButton fill="outline" onClick={() => requestFollowupModal.current?.present()}>
                Request follow-up
              </IonButton>
            </div>
            {/* Modals */}
            <GroupsModal groups={source.groups} title={`Saved to ${source.groups.length} groups`} modal={groupsModal} />
            <AnnotationsViewerModal source={source} modal={annotationsModal}/>
            <RequestFollowupModal sourceId={source.id} submitRequestCallback={handleFollowupRequestSubmitted} modal={requestFollowupModal} />
          </div>
          ) :
          <div className="source-page">
            <SourceSkeleton animated={true} visible={loading} />
          </div>
        }
      </IonContent>
    </IonPage>
  );
}
