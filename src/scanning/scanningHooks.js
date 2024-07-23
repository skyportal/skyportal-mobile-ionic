import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../common/constants.js";
import { searchCandidates } from "./scanningRequests.js";
import { useUserInfo } from "../common/hooks.js";

/**
 * @param {Object} props
 * @param {string} props.startDate
 * @param {string|null} [props.endDate=null]
 * @param {import("../common/constants").SavedStatus} props.savedStatus
 * @param {string} props.groupIDs
 * @returns {{candidateSearchResponse: import("./scanningRequests.js").CandidateSearchResponse|undefined, status: import("@tanstack/react-query").QueryStatus, error: any}}
 */
export const useSearchCandidates = ({
  startDate,
  endDate = null,
  savedStatus,
  groupIDs,
}) => {
  const { userInfo } = useUserInfo();
  const {
    /** @type {import("../scanning/scanningLib.js").Candidate[]} */ data: candidateSearchResponse,
    status,
    error,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.CANDIDATES,
      startDate,
      endDate,
      savedStatus,
      groupIDs,
    ],
    queryFn: async () => {
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
      });
    },
    enabled: !!userInfo && !!startDate,
  });
  return {
    candidateSearchResponse,
    status,
    error,
  };
};
