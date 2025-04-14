import "./CandidateList.scss";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  IonButton,
  IonButtons, IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonToast
} from "@ionic/react";
import { useMutation } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { checkmarkCircleOutline, warningOutline } from "ionicons/icons";
import { useUserAccessibleGroups } from "../../../../common/common.hooks.js";
import { CandidateAnnotationsViewer } from "../CandidateAnnotationsViewer/CandidateAnnotationsViewer.jsx";
import { ScanningCard } from "../ScanningCard/ScanningCard.jsx";
import { ScanningCardSkeleton } from "../ScanningCard/ScanningCardSkeleton.jsx";
import { useSearchCandidates } from "../../../scanning.hooks.js";
import { addSourceToGroups } from "../../../../sources/sources.requests.js";
import {
  parseIntList,
  SCANNING_TOOLBAR_ACTION,
} from "../../../scanning.lib.js";
import { ScanningEnd } from "../ScanningEnd/ScanningEnd.jsx";
import { ScanningToolbar } from "../ScanningToolbar/ScanningToolbar.jsx";
import { useLocation } from "react-router";
import { UserContext } from "../../../../common/common.context.js";
import { CANDIDATES_PER_PAGE } from "../../../../common/common.lib.js";
import { RequestFollowup } from "../../../../sources/components/RequestFollowup/RequestFollowup.jsx";

export const CandidateList = () => {
  const { userInfo } = useContext(UserContext);
  const { userAccessibleGroups } = useUserAccessibleGroups();

  /** @type {{state: any}} */
  const { state } = useLocation();

  /** @type {import("../../../scanning.lib.js").ScanningConfig|undefined} */
  let scanningConfig = undefined;
  if (state) {
    scanningConfig = {
      ...state,
      /** @type {import("../../../scanning.lib.js").Group[]} **/
      saveGroups: userAccessibleGroups
        ? state.saveGroupIds?.map((/** @type {number} */ id) =>
              userAccessibleGroups.find((g) => g.id === id),
            )
            .filter(
              (
                /** @type {import("../../../scanning.lib.js").Group | undefined} */ g,
              ) => g !== undefined,
            )
        : [],
      /** @type {import("../../../scanning.lib.js").Group[]} **/
      // @ts-ignore
      junkGroups: userAccessibleGroups
        ? parseIntList(state.junkGroupIDs)
            .map((id) => userAccessibleGroups.find((g) => g.id === id))
            .filter((g) => g !== undefined)
        : [],
      pinnedAnnotations: state.pinnedAnnotations,
      queryID: state.queryID,
      totalMatches: state.totalMatches,
    };
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel();
  /** @type {[number[], React.Dispatch<number[]>]} */
  // @ts-ignore
  const [slidesInView, setSlidesInView] = useState([]);

  /** @type {React.MutableRefObject<any>} */
  const annotationsModal = useRef(null);
  /** @type {React.MutableRefObject<any>} */
  const requestFollowupModal = useRef(null);

  const [submitRequest, setSubmitRequest] = useState(false);
  const [isLastBatch, setIsLastBatch] = useState(false);

  /** @type {React.MutableRefObject<import("../../../scanning.lib.js").ScanningRecap>} */
  // @ts-ignore
  const scanningRecap = useRef({
    queryId: "",
    assigned: [],
    notAssigned: [],
    totalMatches: 0,
  });
  const { data, fetchNextPage, isFetchingNextPage } = useSearchCandidates();
  const totalMatches = data?.pages[0].totalMatches;
  /** @type {import("../../../scanning.lib.js").Candidate[]|undefined} */
  const candidates = data?.pages.map((page) => page.candidates).flat(1);
  const currentCandidate = candidates?.at(currentIndex);

  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

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
      if (!scanningConfig) return;
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

  const saveSourceMutation = useMutation({
    /**
     * @param {Object} params
     * @param {string} params.sourceId
     * @param {number[]} params.groupIds
     * @returns {Promise<*>}
     */
    mutationFn: ({ sourceId, groupIds }) =>
      addSourceToGroups({ userInfo, sourceId, groupIds }),
    onSuccess: (_data, variables) =>
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
      }),
    onError: () =>
      presentToast({
        message: "Failed to save source",
        duration: 2000,
        position: "top",
        color: "danger",
        icon: warningOutline,
      }),
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
      return await addSourceToGroups({ userInfo, sourceId, groupIds });
    },
    onSuccess: (_data, variables) =>
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
      }),
    onError: () =>
      presentToast({
        message: "Failed to discard source",
        duration: 2000,
        position: "top",
        color: "danger",
        icon: warningOutline,
      }),
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
        presentAlert({
          header:
            action === "save" ? "Select a program" : "Select a junk group",
          buttons: [action === "save" ? "Save" : "Discard"],
          /** @type {import("@ionic/react").AlertInput[]} */
          inputs: (action === "save"
            ? scanningConfig.saveGroups
            : scanningConfig.junkGroups
          ).map((group) => ({
            type: "checkbox",
            label: group.name,
            value: String(group.id),
          })),
          onDidDismiss: (/** @type {any} **/ e) => {
            const groupIds = e.detail.data.values;
            resolve(groupIds);
          },
        }).then()
      }),
    [state, currentCandidate, presentAlert],
  );

  const handleSave = useCallback(async () => {
    if (!currentCandidate || !scanningConfig) {
      return;
    }
    if (scanningConfig.saveGroupIds.length > 1) {
      let groupIds = await promptUserForGroupSelection("save");
      if (groupIds.length > 0) {
        saveSourceMutation.mutate({
          sourceId: currentCandidate.id,
          groupIds,
        });
      }else{
        await presentToast({
          message: "No group selected, please select at least one group",
          duration: 2000,
          position: "top",
          color: "danger",
          icon: warningOutline,
        });
      }
    } else {
      const areYouSure = await new Promise((resolve) => {
        presentAlert({
          header: "Are you sure?",
          message: "Do you want to save this source?",
          buttons: [
            {
              text: "Cancel",
              role: "cancel",
            },
            {
              text: "Save",
              role: "confirm",
              handler: () => resolve(true),
            },
          ],
        });
      });
      if (!areYouSure) {
        return;
      }
      saveSourceMutation.mutate({
        sourceId: currentCandidate.id,
        groupIds: scanningConfig.saveGroupIds,
      });
    }
    scanningRecap.current = {
      ...scanningRecap.current,
      notAssigned: [...scanningRecap.current.notAssigned, currentCandidate],
    };
  }, [currentCandidate, state]);

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
        groupIds: scanningConfig.junkGroupIDs,
      });
    }
  }, [currentCandidate, state]);

  const handleExit = useCallback(async () => {
    const areYouSure = await new Promise((resolve) => {
      presentAlert({
        header: "Are you sure?",
        message: "Do you want to exit the scanning session?",
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Exit",
            role: "destructive",
            handler: () => resolve(true),
          },
        ],
      });
    });
    if (areYouSure) {
      history.back();
    }
  }, [presentAlert]);

  const isDiscardingEnabled = (scanningConfig?.junkGroupIDs?.length ?? 0) > 0;

  scanningRecap.current.queryId = scanningConfig?.queryID ?? "";
  scanningRecap.current.totalMatches = totalMatches ?? 0;

  if (candidates && candidates.length === totalMatches && !isLastBatch) {
    setIsLastBatch(true);
  }

  const selectCallback = (
    /** @type {import("embla-carousel").EmblaCarouselType} */ e,
  ) => {
    setCurrentIndex(e.selectedScrollSnap());
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

  return (
    <div className="candidate-list">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {scanningConfig && candidates ? (
            <>
              {scanningConfig && candidates.map((candidate, index) => (
                <div key={candidate.id} className="embla__slide">
                  <ScanningCard
                    candidate={candidate}
                    modal={annotationsModal}
                    currentIndex={index}
                    isInView={slidesInView.includes(index)}
                    // @ts-ignore
                    nbCandidates={data.pages[0].totalMatches}
                    // @ts-ignore
                    pinnedAnnotations={scanningConfig.pinnedAnnotations}
                  />
                </div>
              ))}
              {isLastBatch && (
                <div className="embla__slide">
                  <ScanningEnd recap={scanningRecap} />
                </div>
              )}
            </>
          ) : (
            <div className="embla__slide">
              <ScanningCardSkeleton animated={true} />
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
        ref={annotationsModal}
        isOpen={false}
        initialBreakpoint={0.75}
        breakpoints={[0, 0.25, 0.5, 0.75]}
      >
        <CandidateAnnotationsViewer
          // @ts-ignore
          candidate={currentCandidate}
        />
      </IonModal>
      <IonModal ref={requestFollowupModal} isOpen={false} onDidDismiss={() => requestFollowupModal.current?.dismiss()} keepContentsMounted={true}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton color="secondary" onClick={() => requestFollowupModal.current?.dismiss()}>Close</IonButton>
            </IonButtons>
            <IonTitle slot="start">Request Follow-Up</IonTitle>
            <IonButtons slot="primary">
              <IonButton
                fill="solid"
                color="primary"
                onClick={() => setSubmitRequest(true)}>
                Submit
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <RequestFollowup obj_id={currentCandidate?.id}
                           submitRequest={submitRequest}
                           submitRequestCallback={() => setSubmitRequest(false)}/>
        </IonContent>
      </IonModal>
    </div>
  );
};
