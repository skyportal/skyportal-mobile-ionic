import { useInfiniteQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../common/constants.js";
import { searchCandidates } from "./scanningRequests.js";
import { useUserInfo } from "../common/hooks.js";

/**
 * @param {Object} props
 * @param {string} props.startDate
 * @param {string|null} [props.endDate=null]
 * @param {import("../common/constants").SavedStatus} props.savedStatus
 * @param {string} props.groupIDs
 * @param {number} props.numPerPage
 * @returns {import("@tanstack/react-query").UseInfiniteQueryResult<import("@tanstack/react-query").InfiniteData<import("./scanningRequests.js").CandidateSearchResponse, unknown>, Error>}
 */
export const useSearchCandidates = ({
  startDate,
  endDate = null,
  savedStatus,
  groupIDs,
  numPerPage,
}) => {
  const { userInfo } = useUserInfo();
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
        instanceUrl: userInfo?.instance.url ?? "",
        token: userInfo?.token ?? "",
        startDate,
        endDate,
        savedStatus,
        groupIDs,
        numPerPage,
        pageNumber: ctx.pageParam ?? "1",
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.candidates.length < numPerPage) {
        return undefined;
      }
      return +lastPage.pageNumber + 1;
    },
    enabled: !!userInfo && !!startDate,
  });
};
