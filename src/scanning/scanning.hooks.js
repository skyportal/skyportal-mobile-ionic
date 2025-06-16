import { useContext } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchAnnotationInfo, searchCandidates } from "./scanning.requests.js";
import { CANDIDATES_PER_PAGE } from "./scanning.lib.js";
import { fetchUserProfile } from "../onboarding/onboarding.lib.js";
import { UserContext } from "../common/common.context.js";
import { QUERY_KEYS } from "../common/common.lib.js";

/**
 * @param {Object} props
 * @param {string} props.startDate - Only includes candidates that passed filters after this date.
 * @param {string} [props.endDate] - Only includes candidates that passed filters before this date.
 * @param {import("./scanning.lib.js").SavedStatus} props.savedStatus - The saved status of the candidates
 * @param {number[]} props.groupIDs - The group IDs linked to the filter passed by the candidates.
 * @param {string} [props.queryID] - The query ID to filter candidates.
 * @returns {import("@tanstack/react-query").UseInfiniteQueryResult<import("@tanstack/react-query").InfiniteData<import("./scanning.requests.js").CandidateSearchResponse, unknown>, Error>}
 */
export const useSearchCandidates = ({ startDate, endDate, savedStatus, groupIDs, queryID }) => {
  const { userInfo } = useContext(UserContext);

  return useInfiniteQuery({
    queryKey: [
      QUERY_KEYS.CANDIDATES,
      startDate,
      endDate,
      savedStatus,
      groupIDs,
    ],
    queryFn: async (ctx) => {
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
    enabled: !!(startDate && savedStatus && groupIDs.length),
  });
};

/**
 * @returns {{profiles: import("./scanning.lib.js").ScanningProfile[] | undefined, status: import("@tanstack/react-query").QueryStatus, error: any | undefined}}
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
