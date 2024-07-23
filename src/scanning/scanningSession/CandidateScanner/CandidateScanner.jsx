import "./CandidateScanner.scss";
import { IonButton, IonIcon, IonModal } from "@ionic/react";
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
  const numPerPage = 7;
  const [pageNumber, setPageNumber] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ watchResize: false });
  /** @type {React.MutableRefObject<any>} */
  const modal = useRef(null);
  const queryParams = useQueryParams();
  const { candidateSearchResponse, status } = useSearchCandidates({
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    savedStatus: queryParams.savedStatus,
    groupIDs: queryParams.groupIDs,
    numPerPage,
  });
  /** @type {[import("../../scanningLib").Candidate[], React.Dispatch<import("../../scanningLib").Candidate[]>]} */
  // @ts-ignore
  const [candidates, setCandidates] = useState([]);
  const [totalMatches, setTotalMatches] = useState(
    candidateSearchResponse?.totalMatches,
  );
  const [queryID, setQueryID] = useState(candidateSearchResponse?.queryID);

  useEffect(() => {
    if (status === "success" && candidateSearchResponse) {
      setCandidates(candidateSearchResponse?.candidates);
      setTotalMatches(candidateSearchResponse?.totalMatches);
      setQueryID(candidateSearchResponse?.queryID);
    }
  }, [candidateSearchResponse, status]);

  const slidesInViewMutation = useMutation({
    // @ts-ignore
    mutationFn: async (
      /** @type {import("embla-carousel").EmblaCarouselType} */ e,
    ) => {
      if (e.slidesInView()[0] !== numPerPage * pageNumber - 4) {
        return null;
      }
      /** @type {import("../../../onboarding/auth").UserInfo} */
      const userInfo = await getPreference({ key: QUERY_KEYS.USER_INFO });
      return await searchCandidates({
        instanceUrl: userInfo.instance.url,
        token: userInfo.token,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
        savedStatus: queryParams.savedStatus,
        groupIDs: queryParams.groupIDs,
        queryID,
        numPerPage: numPerPage.toString(),
        pageNumber: (pageNumber + 1).toString(),
      });
    },
    mutationKey: [totalMatches, pageNumber, queryID],
    onSuccess: (data) => {
      // @ts-ignore
      setCandidates([...candidates, ...data.candidates]);
      setPageNumber((prev) => prev + 1);
    },
  });

  const selectCallback = useCallback(
    (/** @type {import("embla-carousel").EmblaCarouselType} */ e) => {
      setCurrentIndex(e.selectedScrollSnap());
      slidesInViewMutation.mutate(e);
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
