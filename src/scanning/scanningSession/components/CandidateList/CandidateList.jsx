import "./CandidateList.scss";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import {
  useIonAlert,
} from "@ionic/react";
import { useQueryClient } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { useConfirmAlert, useErrorToast, useUserAccessibleGroups } from "../../../../common/common.hooks.js";
import { ScanningCard } from "../ScanningCard/ScanningCard.jsx";
import { ScanningCardSkeleton } from "../ScanningCard/ScanningCardSkeleton.jsx";
import { useSearchCandidates } from "../../../scanning.hooks.js";
import { useUpdateSourceGroups } from "../../../../sources/sources.hooks.js";
import { fetchFollowupRequest } from "../../../../sources/sources.requests.js";
import { SCANNING_TOOLBAR_ACTION } from "../../../scanning.lib.js";
import { ScanningEnd } from "../ScanningEnd/ScanningEnd.jsx";
import { ScanningToolbar } from "../ScanningToolbar/ScanningToolbar.jsx";
import { UserContext } from "../../../../common/common.context.js";
import { CANDIDATES_PER_PAGE } from "../../../scanning.lib.js";
import { QUERY_KEYS } from "../../../../common/common.lib.js";
import { RequestFollowupModal } from "../../../../sources/components/FollowupRequests/RequestFollowupModal.jsx";

export const CandidateList = () => {
  /** @type {{state: import("../../../scanning.lib.js").ScanningConfig|undefined}} */
  const { state } = useLocation();
  const {
    startDate,
    endDate,
    savedStatus,
    saveGroupIds: groupIDs,
    queryID,
  } = state ?? {};
  if (!startDate || !savedStatus || !groupIDs?.length) {
    return null;
  }
  const { userInfo } = useContext(UserContext);
  const queryClient = useQueryClient();
  const { userAccessibleGroups } = useUserAccessibleGroups();
  const updateSourceGroups = useUpdateSourceGroups();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel();
  /** @type {[number[], React.Dispatch<number[]>]} */
  // @ts-ignore
  const [slidesInView, setSlidesInView] = useState([]);
  const [presentAlert] = useIonAlert();
  const confirmAlert = useConfirmAlert();
  const errorToast = useErrorToast();

  /** @type {React.MutableRefObject<any>} */
  const requestFollowupModal = useRef(null);
  const [isLastBatch, setIsLastBatch] = useState(false);

  /** @type {React.MutableRefObject<import("../../../scanning.lib.js").ScanningRecap>} */
  // @ts-ignore
  const scanningRecap = useRef({
    queryId: "",
    assigned: [],
    notAssigned: [],
    totalMatches: 0,
  });
  const {
    data,
    isError,
    isFetched,
    fetchNextPage,
    isFetchingNextPage
  } = useSearchCandidates({
    startDate,
    endDate,
    savedStatus,
    groupIDs,
    queryID,
  });
  const totalMatches = data?.pages[0].totalMatches;
  useEffect(() => {
    if (isFetched && (isError || totalMatches === 0)) {
      presentAlert({
        header: isError ? "Error" : "No candidates found",
        message:
          isError ?
            "An error occurred while searching for candidates. Please try again." :
            "No candidates were found with the selected options. Please try again.",
        buttons: ["OK"],
      })
      history.back();
    }
  }, [isFetched, isError, totalMatches, presentAlert]);
  /** @type {import("../../../scanning.lib.js").Candidate[]|undefined} */
  const candidates = data?.pages.map((page) => page.candidates).flat(1);
  const currentCandidate = candidates?.at(currentIndex);

  /**
   * @param {number[]|undefined} ids
   * @param {import("../../../scanning.lib.js").Group[] | undefined} availableGroups
   */
  const resolveGroups = (ids, availableGroups) => {
    return (ids ?? []).map((id) => availableGroups?.find((g) => g.id === id))
      .filter((g) => g !== undefined);
  }

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

  const slidesInViewCallback = useCallback(
    async (/** @type {import("embla-carousel").EmblaCarouselType} */ e) => {
      if (!state) return;
      if (
        !isFetchingNextPage &&
        e.selectedScrollSnap() >= e.slideNodes().length - 4 &&
        e.slideNodes().length - e.selectedScrollSnap() < CANDIDATES_PER_PAGE &&
        totalMatches &&
        e.slideNodes().length < totalMatches
      ) {
        await fetchNextPage();
      }
      setSlidesInView(e.slidesInView());
    },
    [currentIndex, isFetchingNextPage, fetchNextPage, data],
  );

  useEffect(() => {
    if (emblaApi) {
      setSlidesInView(emblaApi.slidesInView());
      emblaApi.on("slidesInView", slidesInViewCallback);
    }
    return () => {
      if (emblaApi) {
        emblaApi.off("slidesInView", slidesInViewCallback);
      }
    };
  }, [emblaApi, currentIndex, isFetchingNextPage, fetchNextPage, data]);

  const promptUserForGroupSelection = useCallback(
    /**
     * @param {"save"|"discard"} action
     * @returns {Promise<string[]>}
     */
    (action) =>
      new Promise((resolve, reject) => {
        if (!state || !currentCandidate) {
          reject();
          return;
        }
        presentAlert({
          header:
            action === "save" ? "Select a program" : "Select a junk group",
          buttons: [action === "save" ? "Save" : "Discard"],
          /** @type {import("@ionic/react").AlertInput[]} */
          inputs: resolveGroups(
            action === "save" ? state.saveGroupIds : state.junkGroupIDs,
              userAccessibleGroups).map((group) => ({
            disabled: currentCandidate.saved_groups?.some((g) => g.id === group.id),
            type: "checkbox",
            label: group.name,
            value: String(group.id),
          })),
          onDidDismiss: (/** @type {any} **/ e) => {
            if (e.detail.data !== undefined) {
              resolve(e.detail.data.values);
            }
          },
        })
      }),
    [state, currentCandidate, presentAlert, userAccessibleGroups],
  );

  const handleSave = useCallback(async () => {
    if (!currentCandidate || !state) {
      return;
    }
    if (state.saveGroupIds.length > 1) {
      const groupIdsToAdd = await promptUserForGroupSelection("save");
      if (groupIdsToAdd.length > 0) {
        updateSourceGroups.mutate({
          sourceId: currentCandidate.id,
          groupIdsToAdd,
        });
      }else{
        errorToast("No group selected, please select at least one group");
      }
    } else {
      const confirmed = await confirmAlert("Do you want to save this source?");
      if (!confirmed)return;

      updateSourceGroups.mutate({
        sourceId: currentCandidate.id,
        groupIdsToAdd: state.saveGroupIds.map(String),
      });
    }
    scanningRecap.current = {
      ...scanningRecap.current,
      notAssigned: [...scanningRecap.current.notAssigned, currentCandidate],
    };
  }, [currentCandidate, state]);

  const handleDiscard = useCallback(async () => {
    if (!currentCandidate || !state) {
      return;
    }
    let groupIdsToAdd;
    if (state.discardBehavior === "ask") {
      groupIdsToAdd = await promptUserForGroupSelection("discard");
      if (groupIdsToAdd.length === 0) {
        errorToast("No group selected, please select at least one group");
        return;
      }
    } else {
      groupIdsToAdd = (state.discardBehavior === "specific" && state.discardGroup ?
        [state.discardGroup] : state.junkGroupIDs.map(String))
        .filter((id) => !currentCandidate.saved_groups?.some((g) => g.id === id),
      ).map(String);
      if (groupIdsToAdd.length === 0) {
        errorToast("This candidate is already in the selected junk groups");
        return;
      }
    }

    const confirmed = await confirmAlert("Do you want to discard this source?");
    if (!confirmed) return;

    updateSourceGroups.mutate({
      sourceId: currentCandidate.id,
      groupIdsToAdd,
    });
  }, [currentCandidate, state]);

  const handleExit = useCallback(async () => {
    const confirmed = await confirmAlert("Do you want to exit the scanning session?");
    if (confirmed) history.back();
  }, [presentAlert]);

  const isDiscardingEnabled = (state?.junkGroupIDs?.length ?? 0) > 0;

  scanningRecap.current.queryId = state?.queryID ?? "";
  scanningRecap.current.totalMatches = totalMatches ?? 0;

  if (candidates?.length === totalMatches && !isLastBatch) {
    setIsLastBatch(true);
  }

  const selectCallback = (
    /** @type {import("embla-carousel").EmblaCarouselType} */ e,
  ) => {
    setCurrentIndex(e.selectedScrollSnap());
  };

  /**
   * @param {boolean} isSubmitted
   */
  const handleFollowupRequestSubmitted = async (isSubmitted) => {
    if (!isSubmitted || !state || !currentCandidate) return

    // Update the list of followup requests for the current candidate
    const { followup_requests } = await fetchFollowupRequest({
      userInfo,
      sourceId: currentCandidate.id,
    });
    queryClient.setQueryData(
      [
        QUERY_KEYS.CANDIDATES,
        state.startDate,
        state.endDate,
        state.savedStatus,
        state.saveGroupIds,
      ],
      (
        /** @type {{ pages: { candidates: import("../../../scanning.lib.js").Candidate[]}[] }} */
        oldData,
      ) => {
        if (!oldData) {
          return oldData;
        }

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            candidates: page.candidates.map((candidate) =>
              candidate.id === currentCandidate.id
                ? { ...candidate, followup_requests }
                : candidate,
            ),
          })),
        };
      },
    );
  };

  /**
   * @param {import("../../../scanning.lib.js").ScanningToolbarAction} action
   */
  const handleToolbarAction = async (action) => {
    switch (action) {
      case SCANNING_TOOLBAR_ACTION.EXIT:
        await handleExit();
        break;
      case SCANNING_TOOLBAR_ACTION.DISCARD:
        await handleDiscard();
        break;
      case SCANNING_TOOLBAR_ACTION.REQUEST_FOLLOW_UP:
        requestFollowupModal.current?.present();
        break;
      case SCANNING_TOOLBAR_ACTION.ADD_REDSHIFT:
        break;
      case SCANNING_TOOLBAR_ACTION.SHOW_SURVEYS:
        break;
      case SCANNING_TOOLBAR_ACTION.SAVE:
        await handleSave();
        break;
    }
  };

  if (isFetched && (isError || totalMatches === 0)) {
    return null;
  }

  return (
    <div className="candidate-list">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {state && candidates ? (
            <>
              {candidates.map((candidate, index) => (
                <div key={candidate.id} className="embla__slide">
                  <ScanningCard
                    candidate={candidate}
                    currentIndex={index}
                    isInView={slidesInView.includes(index)}
                    // @ts-ignore
                    nbCandidates={data.pages[0].totalMatches}
                    // @ts-ignore
                    pinnedAnnotations={state.pinnedAnnotations}
                  />
                </div>
              ))}
              {totalMatches && isLastBatch && (
                <div className="embla__slide">
                  <ScanningEnd recap={scanningRecap} />
                </div>
              )}
            </>
          ) : (
            <div className="embla__slide">
              <div className="scanning-card-container">
                <ScanningCardSkeleton animated={true} />
              </div>
            </div>
          )}
        </div>
      </div>
      {currentIndex < (totalMatches ?? 99999999) && (
        <ScanningToolbar
          onAction={handleToolbarAction}
          isDiscardingEnabled={isDiscardingEnabled}
        />
      )}
      <RequestFollowupModal sourceId={currentCandidate?.id} submitRequestCallback={handleFollowupRequestSubmitted} modal={requestFollowupModal} />
    </div>
  );
};
