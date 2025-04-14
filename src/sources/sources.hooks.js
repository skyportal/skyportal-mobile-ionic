import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { UserContext } from "../common/common.context.js";
import { QUERY_KEYS } from "../common/common.lib.js";
import { fetchSourceSpectra, submitFollowupRequest } from "./sources.requests.js";
import { fetchSources } from "./sources.requests.js";
import { checkmarkCircleOutline, warningOutline } from "ionicons/icons";
import { useIonToast } from "@ionic/react";

/** @typedef {import("../common/common.hooks.js").QueryStatus} QueryStatus */

/**
 * @param {Object} props
 * @param {number} props.page
 * @param {number} props.numPerPage
 * @returns {{sources: import("../sources/sources.lib.js").Source[]|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useFetchSources = ({ page, numPerPage }) => {
  const { userInfo } = useContext(UserContext);

  const {
    /** @type {import("../sources/sources.lib.js").Source[]} */ data: sources,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.SOURCES, page, numPerPage],
    queryFn: () =>
      fetchSources({
        userInfo,
        page,
        numPerPage,
      }),
    // @ts-ignore
    suspense: true,
  });
  return {
    sources,
    status,
    error,
  };
};

/**
 * @param {string} sourceId
 * @returns {{spectraList: import("./sources.lib.js").Spectra[] | undefined, status: import("@tanstack/react-query").QueryStatus, error: any | undefined }}
 */
export const useSourceSpectra = (sourceId) => {
  const { userInfo } = useContext(UserContext);
  const {
    data: spectraList,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.SOURCE_SPECTRA, sourceId],
    queryFn: async () => {
      if (!sourceId) {
        throw new Error("Missing sourceId");
      }
      return await fetchSourceSpectra({ userInfo, sourceId });
    },
    enabled: !!sourceId,
  });
  return {
    spectraList,
    status,
    error,
  };
}

export const useSubmitFollowupRequest = () => {
  const { userInfo } = useContext(UserContext);
  const [presentToast] = useIonToast();
  return useMutation({
    /**
     * @param {Object} params
     * @param {string} params.sourceId
     * @param {number} params.allocationId
     * @param {number[]} params.groupIds
     * @param {Object} params.payload
     * @returns {Promise<*>}
     */
    mutationFn: ({ sourceId, allocationId, groupIds, payload }) =>
      submitFollowupRequest({ userInfo, sourceId, allocationId, groupIds, payload }),
    onSuccess: (response) => {
      if (response.status === 200) {
        presentToast({
          message: response.data?.data?.request_status || "Request submitted",
          duration: 3000,
          position: "top",
          color: "success",
          icon: checkmarkCircleOutline
        }).then()
      }else{
        presentToast({
          message: response.data.message,
          position: "top",
          color: "danger",
          icon: warningOutline,
          buttons: [
            {
              text: "Close",
              role: "cancel"
            }
          ]
        }).then()
      }
    },
    onError: () =>
      presentToast({
        message: "Failed to submit request",
        duration: 2000,
        position: "top",
        color: "danger",
        icon: warningOutline,
      }),
  });
}