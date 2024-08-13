import "./CandidateScanner.scss";
import {
  IonButton,
  IonIcon,
  IonModal,
  IonSpinner,
  useIonAlert,
  useIonToast,
} from "@ionic/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useQueryParams,
  useUserAccessibleGroups,
} from "../../../common/hooks.js";
import {
  arrowForward,
  checkmark,
  checkmarkCircleOutline,
  trashBin,
  warningOutline,
} from "ionicons/icons";
import useEmblaCarousel from "embla-carousel-react";
import { CandidateAnnotationsViewer } from "../CandidateAnnotationsViewer/CandidateAnnotationsViewer.jsx";
import { ScanningCard } from "../ScanningCard/ScanningCard.jsx";
import { ScanningCardSkeleton } from "../ScanningCard/ScanningCardSkeleton.jsx";
import { useSearchCandidates } from "../../scanningHooks.js";
import { addSourceToGroup, searchCandidates } from "../../scanningRequests.js";
import { getPreference } from "../../../common/preferences.js";
import { QUERY_KEYS } from "../../../common/constants.js";
import { useMutation } from "@tanstack/react-query";
import { parseIntList } from "../../scanningLib.js";

export const CandidateScanner = () => {
  const numPerPage = 25;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel();
  /** @type {[import("../../scanningLib").Candidate[], React.Dispatch<import("../../scanningLib").Candidate[]>]} */
  // @ts-ignore
  const [candidates, setCandidates] = useState([]);
  const currentCandidate = candidates?.at(currentIndex);

  /** @type {React.MutableRefObject<string|null>} */
  const queryID = useRef(null);
  const isFetchingNewBatch = useRef(false);
  /** @type {React.MutableRefObject<any>} */
  const modal = useRef(null);

  const queryParams = useQueryParams();
  /** @type {ReturnType<typeof useState<import("../../scanningLib.js").ScanningConfig>>} */
  // @ts-ignore
  const [scanningConfig, setScanningConfig] = useState(null);

  const { userAccessibleGroups } = useUserAccessibleGroups();
  const [presentToast] = useIonToast();

  useEffect(() => {
    setScanningConfig({
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
    });
  }, []);

  const isDiscardingEnabled = scanningConfig?.junkGroups?.length ?? 0 > 0;

  const { candidateSearchResponse } = useSearchCandidates({
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    savedStatus: queryParams.savedStatus,
    groupIDs: queryParams.groupIDs,
    numPerPage,
  });

  useEffect(() => {
    if (candidateSearchResponse?.candidates) {
      // @ts-ignore
      setCandidates(candidateSearchResponse.candidates);
      setTotalMatches(candidateSearchResponse.totalMatches);
      queryID.current = candidateSearchResponse.queryID;
    }
  }, [candidateSearchResponse]);

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
    (/** @type {import("embla-carousel").EmblaCarouselType} */ e) => {
      if (
        !isFetchingNewBatch.current &&
        e.selectedScrollSnap() >= e.slideNodes().length - 4 &&
        e.slideNodes().length - e.selectedScrollSnap() < numPerPage &&
        totalMatches &&
        e.slideNodes().length < totalMatches
      ) {
        isFetchingNewBatch.current = true;
        slidesInViewMutation.mutate(e);
      }
    },
    [candidates, isFetchingNewBatch],
  );

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on("slidesInView", slidesInViewCallback);
    }
    return () => {
      if (emblaApi) {
        emblaApi.off("slidesInView", slidesInViewCallback);
      }
    };
  }, [emblaApi]);

  const slidesInViewMutation = useMutation({
    // @ts-ignore
    mutationFn: async (
      /** @type {import("embla-carousel").EmblaCarouselType} */ e,
    ) => {
      /** @type {import("../../../onboarding/auth").UserInfo} */
      const userInfo = await getPreference({ key: QUERY_KEYS.USER_INFO });
      return await searchCandidates({
        instanceUrl: userInfo.instance.url,
        token: userInfo.token,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
        savedStatus: queryParams.savedStatus,
        groupIDs: queryParams.groupIDs,
        queryID: queryID.current ?? "",
        numPerPage: numPerPage.toString(),
        pageNumber: (
          Math.floor(e.slideNodes().length / numPerPage) + 1
        ).toString(),
      });
    },
    mutationKey: [totalMatches, queryID],
    onSuccess: (data) => {
      // @ts-ignore
      setCandidates([...candidates, ...data.candidates]);
      isFetchingNewBatch.current = false;
    },
    onError: () => {
      isFetchingNewBatch.current = false;
    },
  });

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
     */
    async (action) => {
      if (scanningConfig && currentCandidate) {
        // @ts-ignore
        await presentDiscardAlert({
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
            (action === "save"
              ? saveSourceMutation
              : discardSourceMutation
            ).mutate({
              sourceId: currentCandidate.id,
              groupIds,
            });
          },
        });
      }
    },
    [scanningConfig, currentCandidate],
  );

  const handleDiscard = useCallback(
    async (groupIds = scanningConfig?.junkGroupIds ?? []) => {
      if (currentCandidate && scanningConfig) {
        if (scanningConfig.discardBehavior === "ask") {
          // @ts-ignore
          await promptUserForGroupSelection("discard");
        } else {
          discardSourceMutation.mutate({
            sourceId: currentCandidate.id,
            groupIds,
          });
        }
      }
    },
    [currentCandidate, scanningConfig],
  );

  const handleSave = useCallback(async () => {
    if (currentCandidate && scanningConfig) {
      if (scanningConfig.saveGroupIds.length > 1) {
        // @ts-ignore
        await promptUserForGroupSelection("save");
      } else {
        saveSourceMutation.mutate({
          sourceId: currentCandidate.id,
          groupIds: scanningConfig.saveGroupIds,
        });
      }
    }
  }, [currentCandidate, scanningConfig]);

  const [presentDiscardAlert] = useIonAlert();

  if (!candidateSearchResponse) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <IonSpinner />
      </div>
    );
  }

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
                // @ts-ignore
                nbCandidates={totalMatches}
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
        <IonButton
          onClick={() => handleDiscard()}
          shape="round"
          size="large"
          color="danger"
          fill="outline"
          disabled={!isDiscardingEnabled}
        >
          <IonIcon icon={trashBin} slot="icon-only" />
        </IonButton>
        <IonButton
          onClick={() => handleSave()}
          shape="round"
          size="large"
          color="success"
          fill="outline"
        >
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
