import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../common/constants.js";
import { searchCandidates } from "./scanningRequests.js";
import { fetchUserProfile } from "../onboarding/auth.js";

/**
 * @param {Object} props
 * @param {string} props.startDate
 * @param {string|null} [props.endDate=null]
 * @param {import("../common/constants").SavedStatus} props.savedStatus
 * @param {string} props.groupIDs
 * @param {number} props.numPerPage
 * @param {string|null} [props.queryID=null]
 * @param {import("../onboarding/auth.js").UserInfo} props.userInfo
 * @returns {import("@tanstack/react-query").UseInfiniteQueryResult<import("@tanstack/react-query").InfiniteData<import("./scanningRequests.js").CandidateSearchResponse, unknown>, Error>}
 */
export const useSearchCandidates = ({
  startDate,
  endDate = null,
  savedStatus,
  groupIDs,
  numPerPage,
  queryID = null,
  userInfo,
}) => {
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
        numPerPage,
        pageNumber: ctx.pageParam ?? "1",
        queryID,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.candidates.length < numPerPage) {
        return undefined;
      }
      return +lastPage.pageNumber + 1;
    },
  });
};

/**
 * @param {import("../onboarding/auth.js").UserInfo} userInfo
 * @returns {{profiles: import("../onboarding/auth.js").ScanningProfile[] | undefined, status: import("@tanstack/react-query").QueryStatus, error: any | undefined}}
 */
export const useScanningProfiles = (userInfo) => {
  const {
    data: profiles,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.SCANNING_PROFILES],
    queryFn: () =>
      fetchUserProfile(userInfo).then(
        (userProfile) => userProfile.preferences.scanningProfiles,
      ),
  });
  return {
    profiles,
    status,
    error,
  };
};
