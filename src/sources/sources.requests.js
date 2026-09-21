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
      ...params,
    },
  });
  return response.data.data;
}

/**
 * @param {Object} params
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} params.userInfo
 * @param {string} params.sourceId
 * @param {string} [params.channel] - Conversation to read, main one if unset
 * @returns {Promise<import("./sources.lib.js").Comment[]>}
 */
export const fetchSourceComments = async ({ userInfo, sourceId, channel }) => {
  const response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/sources/${sourceId}/comments`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
    params: channel ? { channel } : {},
  });
  return response.data.data;
};

/**
 * @param {Object} params
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} params.userInfo
 * @param {string} params.sourceId
 * @returns {Promise<string[]>}
 */
export const fetchCommentChannels = async ({ userInfo, sourceId }) => {
  const response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/sources/${sourceId}/comments/channels`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
  });
  return response.data.data;
};

/**
 * @param {Object} params
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} params.userInfo
 * @param {string} params.sourceId
 * @param {string} params.commentId
 * @returns {Promise<{dataUrl: string, contentType: string}>}
 */
export const fetchCommentAttachment = async ({ userInfo, sourceId, commentId }) => {
  const response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/sources/${sourceId}/comments/${commentId}/attachment`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
    params: { preview: "true" },
    responseType: "blob",
  });
  if (response.status !== 200) {
    throw new Error(response.data?.message || "Failed to load the attachment");
  }
  const headers = response.headers ?? {};
  const contentType =
    headers["content-type"] ?? headers["Content-Type"] ?? "application/octet-stream";
  return { dataUrl: `data:${contentType};base64,${response.data}`, contentType };
};

/**
 * @param {Object} params
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} params.userInfo
 * @param {string} params.sourceId
 * @param {import("./sources.lib.js").ThumbnailType[]} [params.types] - Cutouts to generate, the automatic ones if unset
 * @returns {Promise<any>}
 */
export const generateSurveyThumbnails = async ({ userInfo, sourceId, types }) => {
  return await CapacitorHttp.post({
    url: `${userInfo.instance.url}/api/internal/survey_thumbnail`,
    headers: {
      Authorization: `token ${userInfo.token}`,
      "Content-Type": "application/json",
    },
    data: {
      objID: sourceId,
      ...(types ? { types } : {}),
    },
  });
};

/**
 * Post a new comment on a source
 * @param {Object} params
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} params.userInfo
 * @param {string} params.sourceId
 * @param {string} params.text
 * @param {number[]} [params.groupIds] - Groups the comment is restricted to, public if unset
 * @param {string} [params.channel] - Conversation to post to, main one if unset
 * @param {"scanning"} [params.origin] - Workflow the comment is posted from
 * @param {import("./sources.lib.js").CommentAttachment} [params.attachment]
 * @returns {Promise<any>}
 */
export const postSourceComment = async ({ userInfo, sourceId, text, groupIds, channel, origin, attachment }) => {
  return await CapacitorHttp.post({
    url: `${userInfo.instance.url}/api/sources/${sourceId}/comments`,
    headers: {
      Authorization: `token ${userInfo.token}`,
      "Content-Type": "application/json",
    },
    data: {
      text,
      ...(groupIds && groupIds.length > 0 ? { group_ids: groupIds } : {}),
      ...(channel ? { channel } : {}),
      ...(origin ? { origin } : {}),
      ...(attachment ? { attachment } : {}),
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

// Object tags related functions

/**
 * @param {Object} params
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} params.userInfo
 * @returns {Promise<import("./sources.lib.js").TagOption[]>}
 */
export const fetchTagOptions = async ({ userInfo }) => {
  let response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/objtagoption`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
  });
  return response.data.data;
};
