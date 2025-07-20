import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { UserContext } from "../common/common.context.js";
import { QUERY_KEYS } from "../common/common.lib.js";
import {
  addToFavorites,
  fetchFavorites,
  fetchSource,
  fetchSourcePhotometry,
  fetchSourceSpectra,
  removeFromFavorites,
  submitFollowupRequest,
  updateSourceGroups,
} from "./sources.requests.js";
import { fetchSources } from "./sources.requests.js";
import { checkmarkCircleOutline } from "ionicons/icons";
import { useIonToast } from "@ionic/react";
import { useErrorToast, useUserAccessibleGroups } from "../common/common.hooks.js";

/** @typedef {import("../common/common.hooks.js").QueryStatus} QueryStatus */

/**
 * @param {Object} props
 * @param {number} props.page
 * @param {number} props.numPerPage
 * @param {Object.<string, string>} [props.params] - additional parameters to pass to the API
 * @returns {{sources: import("../sources/sources.lib.js").Source[]|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useFetchSources = ({ page, numPerPage, params = {}}) => {
  const { userInfo } = useContext(UserContext);
  const {
    /** @type {import("../sources/sources.lib.js").Source[]} */ data: sources,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.SOURCES, page, numPerPage, params],
    queryFn: () =>
      fetchSources({
        userInfo,
        page,
        numPerPage,
        params
      }),
  });
  return {
    sources,
    status,
    error,
  };
};

/**
 * Fetch a single source by its ID
 * @param {Object} props
 * @param {string} props.sourceId - The ID of the source to fetch
 * @param {Object.<string, string>} [props.params] - additional parameters to pass to the API
 * @returns {{source: import("../sources/sources.lib.js").Source|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useFetchSource = ({ sourceId, params = {} }) => {
  const { userInfo } = useContext(UserContext);
  const {
    data: source,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.SOURCE, sourceId, params],
    queryFn: () =>
      fetchSource({
        userInfo,
        sourceId,
        params
      }),
    enabled: !!sourceId,
  });
  return {
    source,
    status,
    error,
  };
}

/**
 * @param {string} sourceId
 * @param {boolean} [enableFetch=true] - If false, the query will not be executed
 * @returns {{spectraList: import("./sources.lib.js").Spectra[] | undefined, status: import("@tanstack/react-query").QueryStatus, error: any | undefined }}
 */
export const useSourceSpectra = (sourceId, enableFetch = true) => {
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
    enabled: enableFetch && !!sourceId,
  });
  return {
    spectraList,
    status,
    error,
  };
}

/**
 * @param {string} sourceId
 * @param {boolean} [enableFetch=true] - If false, the query will not be executed
 * @returns {{photometry: import("./sources.lib.js").Photometry[] | undefined, status: import("@tanstack/react-query").QueryStatus, error: any | undefined }}
 */
export const useSourcePhotometry = (sourceId, enableFetch = true) => {
  const { userInfo } = useContext(UserContext);
  const {
    data: photometry,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.SOURCE_PHOTOMETRY, sourceId],
    queryFn: async () => {
      if (!sourceId) {
        throw new Error("Missing sourceId");
      }
      return await fetchSourcePhotometry({ userInfo, sourceId });
    },
    enabled: enableFetch && !!sourceId,
  });
  return {
    photometry,
    status,
    error,
  };
}

// Followup request related hooks

export const useSubmitFollowupRequest = () => {
  const { userInfo } = useContext(UserContext);
  const [presentToast] = useIonToast();
  const errorToast = useErrorToast();
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
        errorToast(response.data.message || "Failed to submit request", true);
      }
    },
    onError: () =>
      errorToast("Failed to submit request"),
  });
}

// Favorite sources related hooks

export const useFetchFavoriteSourceIds = () => {
  const { userInfo } = useContext(UserContext);
  const {
    data,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.FAVORITE_SOURCE_IDS],
    queryFn: () =>
      fetchFavorites({
        userInfo,
      }),
  });
  const favoriteSourceIds = Array.isArray(data)
    ? data.map((source) => source.obj_id)
    : [];

  return {
    favoriteSourceIds,
    status,
    error,
  };
}

export const useAddSourceToFavorites = () => {
  const { userInfo } = useContext(UserContext);
  const queryClient = useQueryClient();
  const errorToast = useErrorToast();
  return useMutation({
    /**
     * @param {Object} params
     * @param {string} params.sourceId
     * @returns {Promise<*>}
     */
    mutationFn: ({ sourceId }) =>
      addToFavorites({ userInfo, sourceId }),
    onSuccess: (response) => {
      if (response.status !== 200) {
        errorToast("Failed to add this source to favorites");
      }else{
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAVORITE_SOURCE_IDS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SOURCES] });
      }
    },
    onError: () =>
      errorToast("Failed to add this source to favorites"),
  });
}

export const useRemoveSourceFromFavorites = () => {
  const { userInfo } = useContext(UserContext);
  const queryClient = useQueryClient();
  const errorToast = useErrorToast();
  return useMutation({
    /**
     * @param {Object} params
     * @param {string} params.sourceId
     * @returns {Promise<*>}
     */
    mutationFn: ({ sourceId }) =>
      removeFromFavorites({ userInfo, sourceId }),
    onSuccess: (response) => {
      if (response.status !== 200) {
        errorToast("Failed to remove this source from favorites");
      }else{
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAVORITE_SOURCE_IDS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SOURCES] });
      }
    },
    onError: () =>
      errorToast("Failed to remove this source from favorites"),
  });
}

export const useUpdateSourceGroups = () => {
  const { userInfo } = useContext(UserContext);
  const { userAccessibleGroups } = useUserAccessibleGroups();
  const [presentToast] = useIonToast();
  const errorToast = useErrorToast();

  /** @param {string} groupId */
  const groupName = (groupId) => {
    return userAccessibleGroups?.find((g) => g.id === parseInt(groupId))?.name || groupId;
  };

  return useMutation({
    /**
     * @param {Object} params
     * @param {string} params.sourceId
     * @param {string[]} [params.groupIdsToAdd]
     * @param {string[]} [params.groupIdsToRemove]
     * @returns {Promise<*>}
     */
    mutationFn: ({ sourceId, groupIdsToAdd=[], groupIdsToRemove=[] }) =>
      updateSourceGroups({ userInfo, sourceId, groupIdsToAdd, groupIdsToRemove }),
    onSuccess: (response, { groupIdsToAdd = [], groupIdsToRemove = [] }) => {
      if (response.status !== 200) {
        errorToast("Failed to update source groups: " + response.data?.message || "Unknown error");
        return;
      }

      const added = groupIdsToAdd.length > 0 ? `added to groups: ${groupIdsToAdd.map(groupName).join(", ")}`: "";
      const removed = groupIdsToRemove.length > 0 ? `removed from groups: ${groupIdsToRemove.map(groupName).join(", ")}`: "";
      const message = [added, removed].filter(Boolean).join(" and ");
      presentToast({
        message: `Source ${message}`,
        duration: 2000,
        position: "top",
        color: "success",
        icon: checkmarkCircleOutline,
      });
    },
    onError: () =>
      errorToast("Failed to update source groups"),
  });
}
