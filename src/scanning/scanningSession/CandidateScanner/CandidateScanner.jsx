import "./CandidateScanner.scss";
import { IonModal, useIonAlert, useIonToast } from "@ionic/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useQueryParams,
  useUserAccessibleGroups,
} from "../../../common/hooks.js";
import { checkmarkCircleOutline, warningOutline } from "ionicons/icons";
import useEmblaCarousel from "embla-carousel-react";
import { CandidateAnnotationsViewer } from "../CandidateAnnotationsViewer/CandidateAnnotationsViewer.jsx";
import { ScanningCard } from "../ScanningCard/ScanningCard.jsx";
import { ScanningCardSkeleton } from "../ScanningCard/ScanningCardSkeleton.jsx";
import { useSearchCandidates } from "../../scanningHooks.js";
import { addSourceToGroup } from "../../scanningRequests.js";
import { getPreference } from "../../../common/preferences.js";
import { QUERY_KEYS } from "../../../common/constants.js";
import { useMutation } from "@tanstack/react-query";
import { parseIntList, SCANNING_TOOLBAR_ACTION } from "../../scanningLib.js";
import { ScanningEnd } from "../ScanningEnd/ScanningEnd.jsx";
import { ScanningToolbar } from "../ScanningToolbar/ScanningToolbar.jsx";

export const CandidateScanner = () => {
  const numPerPage = 25;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel();
  /** @type {[number[], React.Dispatch<number[]>]} */
  // @ts-ignore
  const [slidesInView, setSlidesInView] = useState([]);
  /** @type {React.MutableRefObject<any>} */
  const modal = useRef(null);

  const [isLastBatch, setIsLastBatch] = useState(false);

  /** @type {React.MutableRefObject<import("../../scanningLib").ScanningRecap>} */
  // @ts-ignore
  const scanningRecap = useRef({
    queryId: "",
    assigned: [],
    notAssigned: [],
    totalMatches: 0,
  });

  const { userAccessibleGroups } = useUserAccessibleGroups();
  const queryParams = useQueryParams();
  /** @type {import("../../scanningLib.js").ScanningConfig} */
  const scanningConfig = {
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    savedStatus: queryParams.savedStatus,
    /** @type {import("../../scanningLib").DiscardBehavior} **/
    discardBehavior: queryParams.discardBehavior,
    saveGroupIds: parseIntList(queryParams.groupIDs),
    /** @type {import("../../scanningLib").Group[]} **/
    // @ts-ignore
    saveGroups: userAccessibleGroups
      ? parseIntList(queryParams.groupIDs)
          .map((id) => userAccessibleGroups.find((g) => g.id === id))
          .filter((g) => g !== undefined)
      : [],
    junkGroupIds: parseIntList(queryParams.junkGroupIDs),
    /** @type {import("../../scanningLib").Group[]} **/
    // @ts-ignore
    junkGroups: userAccessibleGroups
      ? parseIntList(queryParams.junkGroupIDs)
          .map((id) => userAccessibleGroups.find((g) => g.id === id))
          .filter((g) => g !== undefined)
      : [],
    numPerPage,
    queryID: queryParams.queryID,
  };

  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();
  const isDiscardingEnabled = (scanningConfig.junkGroups?.length ?? 0) > 0;

  const { data, fetchNextPage, isFetchingNextPage } = useSearchCandidates({
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    savedStatus: queryParams.savedStatus,
    groupIDs: queryParams.groupIDs,
    queryID: queryParams.queryID,
    numPerPage,
  });

  const totalMatches = data?.pages[0].totalMatches;
  const candidates = data?.pages.map((page) => page.candidates).flat(1);
  const currentCandidate = candidates?.at(currentIndex);
  if (candidates && candidates.length === totalMatches && !isLastBatch) {
    setIsLastBatch(true);
  }
  scanningRecap.current.queryId = scanningConfig.queryID ?? "";
  scanningRecap.current.totalMatches = totalMatches ?? 0;

  const selectCallback = useCallback(
    (/** @type {import("embla-carousel").EmblaCarouselType} */ e) => {
      setCurrentIndex(e.selectedScrollSnap());
    },
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

  const slidesInViewCallback = useCallback(
    async (/** @type {import("embla-carousel").EmblaCarouselType} */ e) => {
      if (
        !isFetchingNextPage &&
        e.selectedScrollSnap() >= e.slideNodes().length - 4 &&
        e.slideNodes().length - e.selectedScrollSnap() < numPerPage &&
        totalMatches &&
        e.slideNodes().length < totalMatches
      ) {
        await fetchNextPage();
      }
      setSlidesInView(e.slidesInView());
    },
    [currentIndex, isFetchingNextPage, fetchNextPage, totalMatches],
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
  }, [emblaApi, currentIndex, isFetchingNextPage, fetchNextPage, totalMatches]);

  const addSourceToGroups = useCallback(
    /**
     * @param {Object} params
     * @param {string} params.sourceId
     * @param {number[]} params.groupIds
     * @returns {Promise<*>}
     */
    async ({ sourceId, groupIds }) => {
      const userInfo = await getPreference({ key: QUERY_KEYS.USER_INFO });
      return await addSourceToGroup({
        sourceId,
        instanceUrl: userInfo.instance.url,
        token: userInfo.token,
        groupIds,
      });
    },
    [],
  );

  const saveSourceMutation = useMutation({
    /**
     * @param {Object} params
     * @param {string} params.sourceId
     * @param {number[]} params.groupIds
     * @returns {Promise<*>}
     */
    mutationFn: ({ sourceId, groupIds }) =>
      addSourceToGroups({ sourceId, groupIds }),
    onSuccess: (data, variables) => {
      presentToast({
        message:
          `Source saved to group${variables.groupIds.length > 1 ? "s" : ""} ` +
          variables.groupIds
            .map(
              (g) =>
                userAccessibleGroups?.find((group) => group.id === g)?.name,
            )
            .filter((g) => g !== undefined)
            .join(","),
        duration: 2000,
        position: "top",
        color: "success",
        icon: checkmarkCircleOutline,
      });
    },
    onError: () => {
      presentToast({
        message: "Failed to save source",
        duration: 2000,
        position: "top",
        color: "danger",
        icon: warningOutline,
      });
    },
  });

  const discardSourceMutation = useMutation({
    /**
     * @param {Object} params
     * @param {string} params.sourceId
     * @param {number[]} params.groupIds
     * @returns {Promise<*>}
     */
    mutationFn: async ({ sourceId, groupIds }) => {
      const areYouSure = await new Promise((resolve) => {
        presentAlert({
          header: "Are you sure?",
          message: "Do you want to discard this source?",
          buttons: [
            {
              text: "Cancel",
              role: "cancel",
            },
            {
              text: "Discard",
              role: "destructive",
              handler: () => resolve(true),
            },
          ],
        });
      });
      if (!areYouSure) {
        return;
      }
      return await addSourceToGroups({ sourceId, groupIds });
    },
    onSuccess: (data, variables) => {
      presentToast({
        message:
          `Source discarded to group${variables.groupIds.length > 1 ? "s" : ""} ` +
          variables.groupIds
            .map(
              (g) =>
                userAccessibleGroups?.find((group) => group.id === g)?.name,
            )
            .filter((g) => g !== undefined)
            .join(","),
        duration: 2000,
        position: "top",
        color: "secondary",
        icon: checkmarkCircleOutline,
      });
    },
    onError: () => {
      presentToast({
        message: "Failed to discard source",
        duration: 2000,
        position: "top",
        color: "danger",
        icon: warningOutline,
      });
    },
  });

  const promptUserForGroupSelection = useCallback(
    /**
     * @param {"save"|"discard"} action
     * @returns {Promise<number[]>}
     */
    (action) =>
      new Promise((resolve, reject) => {
        if (!scanningConfig || !currentCandidate) {
          reject();
          return;
        }
        // @ts-ignore
        presentAlert({
          header:
            action === "save" ? "Select a program" : "Select a junk group",
          buttons: [action === "save" ? "Save" : "Discard"],
          inputs: (action === "save"
            ? scanningConfig.saveGroups
            : scanningConfig.junkGroups
          ).map((group) => ({
            type: "checkbox",
            label: group.name,
            value: group.id,
          })),
          onDidDismiss: (/** @type {any} **/ e) => {
            const groupIds = e.detail.data.values;
            resolve(groupIds);
          },
        });
      }),
    [scanningConfig, currentCandidate],
  );

  const handleDiscard = useCallback(async () => {
    if (!currentCandidate || !scanningConfig) {
      return;
    }
    if (scanningConfig.discardBehavior === "ask") {
      let groupIds = await promptUserForGroupSelection("discard");
      discardSourceMutation.mutate({
        sourceId: currentCandidate.id,
        groupIds,
      });
    } else {
      discardSourceMutation.mutate({
        sourceId: currentCandidate.id,
        groupIds: scanningConfig.junkGroupIds,
      });
    }
  }, [currentCandidate, scanningConfig]);

  const handleSave = useCallback(async () => {
    if (!currentCandidate || !scanningConfig) {
      return;
    }
    if (scanningConfig.saveGroupIds.length > 1) {
      // @ts-ignore
      let groupIds = await promptUserForGroupSelection("save");
      saveSourceMutation.mutate({
        sourceId: currentCandidate.id,
        groupIds,
      });
    } else {
      saveSourceMutation.mutate({
        sourceId: currentCandidate.id,
        groupIds: scanningConfig.saveGroupIds,
      });
    }
    scanningRecap.current = {
      ...scanningRecap.current,
      notAssigned: [...scanningRecap.current.notAssigned, currentCandidate],
    };
  }, [currentCandidate, scanningConfig]);

  /**
   * @param {import("../../scanningLib.js").ScanningToolbarAction} action
   */
  const handleToolbarAction = async (action) => {
    console.log("action", action);
    switch (action) {
      case SCANNING_TOOLBAR_ACTION.EXIT:
        history.back();
        break;
      case SCANNING_TOOLBAR_ACTION.REQUEST_OBSERVING_RUN:
        break;
      case SCANNING_TOOLBAR_ACTION.REQUEST_FOLLOW_UP:
        break;
      case SCANNING_TOOLBAR_ACTION.ADD_REDSHIFT:
        break;
      case SCANNING_TOOLBAR_ACTION.SHOW_SURVEYS:
        break;
      case SCANNING_TOOLBAR_ACTION.SAVE:
        await handleSave();
        break;
      case SCANNING_TOOLBAR_ACTION.DISCARD:
        await handleDiscard();
        break;
    }
  };

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
                isInView={slidesInView.includes(index)}
                // @ts-ignore
                nbCandidates={data.pages[0].totalMatches}
              />
            </div>
          )) ?? (
            <div className="embla__slide">
              <ScanningCardSkeleton animated={true} />
            </div>
          )}
          {isLastBatch && (
            <div className="embla__slide">
              <ScanningEnd recap={scanningRecap} />
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
