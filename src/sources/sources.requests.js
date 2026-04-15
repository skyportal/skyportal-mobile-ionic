import { CapacitorHttp } from "@capacitor/core";

/**
 * Fetch sources from the API
 * @param {Object} props
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} props.userInfo - User info
 * @param {number} props.page - page number
 * @param {number} props.numPerPage - number of sources per page
 * @param {Object.<string, string>} [props.params] - additional parameters to pass to the API
 * @returns {Promise<import("./sources.lib.js").Source[]>}
 */
export async function fetchSources({ userInfo, page, numPerPage, params = {} }) {
  let response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/sources`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
    params: {
      pageNumber: `${page}`,
      numPerPage: `${numPerPage}`,
      ...params,
    },
  });
  return response.data.data.sources;
}

/**
 * Fetch one source by its ID
 * @param {Object} props
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} props.userInfo - User info
 * @param {string} props.sourceId - The source ID
 * @param {Object.<string, string>} [props.params] - additional parameters to pass to the API
 * @returns {Promise<import("./sources.lib.js").Source>}
 */
export async function fetchSource({ userInfo, sourceId, params = {} }) {
  let response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/sources/${sourceId}`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
    params: {
      includeColorMagnitude: "true",
      includeThumbnails: "true",
      includeDetectionStats: "true",
      includeLabellers: "true",
      includeHosts: "true",
      includeComments: "true",
      ...params,
    },
  });
  return response.data.data;
}

/**
 * Post a new comment on a source
 * @param {Object} params
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} params.userInfo
 * @param {string} params.sourceId
 * @param {string} params.text
 * @param {number[]} [params.groupIds]
 * @returns {Promise<any>}
 */
export const postSourceComment = async ({ userInfo, sourceId, text, groupIds }) => {
  return await CapacitorHttp.post({
    url: `${userInfo.instance.url}/api/sources/${sourceId}/comments`,
    headers: {
      Authorization: `token ${userInfo.token}`,
      "Content-Type": "application/json",
    },
    data: {
      text,
      ...(groupIds && groupIds.length > 0 ? { group_ids: groupIds } : {}),
    },
  });
};

/**
 * @param {Object} params
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} params.userInfo
 * @param {string} params.sourceId
 * @param {string[]} params.groupIdsToAdd
 * @param {string[]} params.groupIdsToRemove
 * @returns {Promise<any>}
 */
export const updateSourceGroups = async ({ userInfo, sourceId, groupIdsToAdd, groupIdsToRemove }) => {
  return await CapacitorHttp.post({
    url: `${userInfo.instance.url}/api/source_groups`,
    headers: {
      Authorization: `token ${userInfo.token}`,
      "Content-Type": "application/json",
    },
    data: {
      objId: sourceId,
      inviteGroupIds: groupIdsToAdd,
      unsaveGroupIds: groupIdsToRemove,
    },
  });
};

/**
 * Fetch all spectra for a source
 * @param {Object} params
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} params.userInfo
 * @param {string} params.sourceId - The source ID
 * @returns {Promise<import("../sources/sources.lib.js").Spectra[]>}
 */
export const fetchSourceSpectra = async ({ userInfo, sourceId }) => {
  let response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/sources/${sourceId}/spectra`,
    headers: {
      Authorization: `token ${userInfo.token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data.data?.spectra;
}

/**
 * Fetch the photometry of a source
 * @param {Object} params
 * @param {string} params.sourceId - The source ID
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} params.userInfo - The user info
 * @param {string} [params.includeOwnerInfo="true"] - Include owner info
 * @param {string} [params.includeStreamInfo="true"] - Include stream info
 * @param {string} [params.includeValidationInfo="true"] - Include validation info
 * @returns {Promise<import("./sources.lib.js").Photometry[]>}
 */
export const fetchSourcePhotometry = async ({
                                              sourceId,
                                              userInfo,
                                              includeOwnerInfo = "true",
                                              includeStreamInfo = "true",
                                              includeValidationInfo = "true",
                                            }) => {
  let response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/sources/${sourceId}/photometry`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
    params: {
      includeOwnerInfo,
      includeStreamInfo,
      includeValidationInfo,
    },
  });
  return response.data.data;
};

// Followup requests related functions

/**
 * Fetch the followup requests for a source
 * @param {Object} params
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} params.userInfo
 * @param {string} params.sourceId
 */
export const fetchFollowupRequest = async ({ userInfo, sourceId }) => {
  let response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/followup_request`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
    params: {
      sourceID: sourceId,
    },
  });
  return response.data.data;
}

/**
 * Submit a followup request
 * @param {Object} params
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} params.userInfo
 * @param {string} params.sourceId
 * @param {number} params.allocationId
 * @param {number[]} params.groupIds
 * @param {Object} params.payload
 * @returns {Promise<any>}
 */
export const submitFollowupRequest = async ({ userInfo,
                                              sourceId,
                                              allocationId,
                                              groupIds,
                                              payload }) => {
  return CapacitorHttp.post({
    url: `${userInfo.instance.url}/api/followup_request`,
    headers: {
      Authorization: `token ${userInfo.token}`,
      "Content-Type": "application/json",
    },
    data: {
      obj_id: sourceId,
      allocation_id: allocationId,
      target_group_ids: groupIds,
      payload: payload
    },
  });
};

// Favorite sources related functions

/**
 * Fetch the favorites list
 * @param {Object} params
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} params.userInfo - The user info
 * @return {Promise<{ obj_id: string }[]>} - The favorites list
 */
export const fetchFavorites = async ({ userInfo }) => {
  let response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/listing`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
    params: {
      listName: "favorites",
    },
  });
  return response.data.data;
}

/**
 * Add a source to the favorites list
 * @param {Object} params
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} params.userInfo - The user info
 * @param {string} params.sourceId - The source ID
 * @returns {Promise<any>}
 */
export const addToFavorites = async ({ userInfo, sourceId }) => {
  return CapacitorHttp.post({
    url: `${userInfo.instance.url}/api/listing`,
    headers: {
      Authorization: `token ${userInfo.token}`,
      "Content-Type": "application/json",
    },
    data: {
      list_name: "favorites",
      obj_id: sourceId,
    },
  });
}

/**
 * Remove a source from the favorites list
 * @param {Object} params
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} params.userInfo - The user info
 * @param {string} params.sourceId - The source ID
 * @returns {Promise<any>}
 */
export const removeFromFavorites = async ({ userInfo, sourceId }) => {
  return CapacitorHttp.delete({
    url: `${userInfo.instance.url}/api/listing`,
    headers: {
      Authorization: `token ${userInfo.token}`,
      "Content-Type": "application/json",
    },
    data: {
      list_name: "favorites",
      obj_id: sourceId,
    },
  });
}
