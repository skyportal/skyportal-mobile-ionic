import "./CandidateScanner.scss";
import { IonButton, IonIcon, IonModal, IonSpinner } from "@ionic/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryParams } from "../../../common/hooks.js";
import { arrowForward, checkmark, trashBin } from "ionicons/icons";
import useEmblaCarousel from "embla-carousel-react";
import { CandidateAnnotationsViewer } from "../CandidateAnnotationsViewer/CandidateAnnotationsViewer.jsx";
import { ScanningCard } from "../ScanningCard/ScanningCard.jsx";
import { ScanningCardSkeleton } from "../ScanningCard/ScanningCardSkeleton.jsx";
import { useSearchCandidates } from "../../scanningHooks.js";
import { searchCandidates } from "../../scanningRequests.js";
import { getPreference } from "../../../common/preferences.js";
import { QUERY_KEYS } from "../../../common/constants.js";
import { useMutation } from "@tanstack/react-query";

export const CandidateScanner = () => {
  const numPerPage = 25;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel();
  /** @type {[import("../../scanningLib").Candidate[], React.Dispatch<import("../../scanningLib").Candidate[]>]} */
  // @ts-ignore
  const [candidates, setCandidates] = useState([]);

  /** @type {React.MutableRefObject<string|null>} */
  const queryID = useRef(null);
  const isFetchingNewBatch = useRef(false);
  /** @type {React.MutableRefObject<any>} */
  const modal = useRef(null);

  const queryParams = useQueryParams();
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
