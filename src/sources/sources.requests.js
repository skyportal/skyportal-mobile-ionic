import { CapacitorHttp } from "@capacitor/core";

/**
 * Fetch sources from the API
 * @param {Object} props
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} props.userInfo - User info
 * @param {number} props.page - page number
 * @param {number} props.numPerPage - number of sources per page
 * @returns {Promise<import("./sources.lib.js").Source[]>}
 */
export async function fetchSources({ userInfo, page, numPerPage }) {
  let response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/sources`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
    params: {
      pageNumber: `${page}`,
      numPerPage: `${numPerPage}`,
      includeColorMagnitude: "true",
      includeThumbnails: "true",
      includeDetectionStats: "true",
      includeLabellers: "true",
      includeHosts: "true",
    },
  });
  return response.data.data.sources;
}

/**
 * @param {Object} params
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} params.userInfo
 * @param {string} params.sourceId
 * @param {number[]} params.groupIds
 * @returns {Promise<any>}
 */
export const addSourceToGroups = async ({ userInfo, sourceId, groupIds }) => {
  let response = await CapacitorHttp.post({
    url: `${userInfo.instance.url}/api/source_groups`,
    headers: {
      Authorization: `token ${userInfo.token}`,
      "Content-Type": "application/json",
    },
    data: {
      objId: sourceId,
      inviteGroupIds: groupIds,
    },
  });
  return response.data.data;
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

/**
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