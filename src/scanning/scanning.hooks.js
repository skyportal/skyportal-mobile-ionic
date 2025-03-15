import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchAnnotationInfo, searchCandidates } from "./scanning.requests.js";
import { fetchUserProfile } from "../onboarding/onboarding.lib.js";
import { useContext } from "react";
import { UserContext } from "../common/common.context.js";
import { useLocation } from "react-router";
import { CANDIDATES_PER_PAGE, QUERY_KEYS } from "../common/common.lib.js";

/**
 * @returns {import("@tanstack/react-query").UseInfiniteQueryResult<import("@tanstack/react-query").InfiniteData<import("./scanning.requests.js").CandidateSearchResponse, unknown>, Error>}
 */
export const useSearchCandidates = () => {
  const { userInfo } = useContext(UserContext);
  /** @type {any} */
  const { state } = useLocation();
  /** @type {string} */
  let startDate = "";
  /** @type {string} */
  let endDate = "";
  /** @type {import("../common/common.lib.js").SavedStatus} */
  let savedStatus = "all";
  /** @type {number[]} */
  let groupIDs = [];
  /** @type {string} */
  let queryID = "";

  if (state) {
    startDate = state.startDate;
    endDate = state.endDate;
    savedStatus = state.savedStatus;
    groupIDs = state.saveGroupIds;
    queryID = state.queryID;
  }

  return useInfiniteQuery({
    queryKey: [
      QUERY_KEYS.CANDIDATES,
      startDate,
      endDate,
      savedStatus,
      groupIDs,
    ],
    queryFn: async (ctx) => {
      if (!startDate || !endDate || !savedStatus || !groupIDs) {
        throw new Error("Missing parameters");
      }
      return await searchCandidates({
        userInfo,
        startDate,
        endDate,
        savedStatus,
        groupIDs,
        pageNumber: ctx.pageParam ?? "1",
        queryID,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.candidates.length < CANDIDATES_PER_PAGE) {
        return undefined;
      }
      return +lastPage.pageNumber + 1;
    },
    enabled: !!state,
  });
};

/**
 * @returns {{profiles: import("../onboarding/onboarding.lib.js").ScanningProfile[] | undefined, status: import("@tanstack/react-query").QueryStatus, error: any | undefined}}
 */
export const useScanningProfiles = () => {
  const { userInfo } = useContext(UserContext);
  const {
    data: profiles,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.SCANNING_PROFILES],
    queryFn: () =>
      fetchUserProfile(userInfo).then(
        (userProfile) => userProfile.preferences.scanningProfiles || []
      ),
  });
  return {
    profiles,
    status,
    error,
  };
};

/**
 * @returns {{annotationsInfo: import("./scanning.requests.js").AnnotationsInfo | undefined, status: import("@tanstack/react-query").QueryStatus, error: any | undefined }}
 */
export const useAnnotationsInfo = () => {
  const { userInfo } = useContext(UserContext);
  const {
    data: annotationsInfo,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.ANNOTATIONS_INFO],
    queryFn: () => fetchAnnotationInfo({ userInfo }),
  });
  return {
    annotationsInfo,
    status,
    error,
  };
};
