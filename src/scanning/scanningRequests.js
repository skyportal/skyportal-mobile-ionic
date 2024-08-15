import { CapacitorHttp } from "@capacitor/core";

/**
 * @typedef {Object} CandidateSearchResponse
 * @property {import("./scanningLib.js").Candidate[]} candidates - The candidates
 * @property {number} totalMatches - The total matches
 * @property {string} queryID - The query ID
 * @property {string} pageNumber - The page number
 */

/**
 * Returns the candidates from the API
 * @param {Object} params
 * @param {string} params.instanceUrl - The URL of the instance
 * @param {string} params.token - The token to use to fetch the candidates
 * @param {string} params.startDate - The start date of the candidates
 * @param {string|null} [params.endDate=null] - The end date of the candidates
 * @param {import("../common/constants").SavedStatus} params.savedStatus - The saved status of the candidates
 * @param {string} params.groupIDs - The group IDs to search for
 * @param {string|null} [params.queryID=null] - The query ID
 * @param {number} params.pageNumber - The page number
 * @param {number} params.numPerPage - The number of candidates per page
 * @returns {Promise<CandidateSearchResponse>}
 */
export async function searchCandidates({
  instanceUrl,
  token,
  startDate,
  endDate,
  savedStatus,
  groupIDs,
  queryID = null,
  pageNumber,
  numPerPage,
}) {
  // example: https://preview.fritz.science/api/candidates?pageNumber=1&numPerPage=50&groupIDs=4&savedStatus=savedToAnySelected&listNameReject=rejected_candidates&startDate=2024-07-01T21%3A27%3A27.232Z
  let response = await CapacitorHttp.get({
    url: `${instanceUrl}/api/candidates`,
    headers: {
      Authorization: `token ${token}`,
    },
    params: {
      pageNumber: pageNumber.toString(),
      numPerPage: numPerPage.toString(),
      groupIDs,
      savedStatus,
      listNameReject: "rejected_candidates",
      startDate,
      endDate: endDate || "",
      queryID: queryID || "",
    },
  });
  return {
    candidates: response.data.data.candidates,
    totalMatches: response.data.data.totalMatches,
    queryID: response.data.data.queryID,
    pageNumber: response.data.data.pageNumber,
  };
}

/**
 * @param {Object} params
 * @param {string} params.instanceUrl
 * @param {string} params.token
 * @returns {Promise<import("./scanningLib.js").GroupsResponse>}
 */
export async function fetchGroups({ instanceUrl, token }) {
  let response = await CapacitorHttp.get({
    url: `${instanceUrl}/api/groups`,
    headers: {
      Authorization: `token ${token}`,
    },
  });
  return response.data.data;
}

/**
 * Fetch the photometry of a source
 * @param {Object} params
 * @param {string} params.sourceId - The source ID
 * @param {string} params.instanceUrl - The URL of the instance
 * @param {string} params.token - The token to use to fetch the photometry
 * @param {string} [params.includeOwnerInfo="true"] - Include owner info
 * @param {string} [params.includeStreamInfo="true"] - Include stream info
 * @param {string} [params.includeValidationInfo="true"] - Include validation info
 * @returns {Promise<import("./scanningLib.js").Photometry[]>}
 */
export const fetchSourcePhotometry = async ({
  sourceId,
  instanceUrl,
  token,
  includeOwnerInfo = "true",
  includeStreamInfo = "true",
  includeValidationInfo = "true",
}) => {
  let response = await CapacitorHttp.get({
    url: `${instanceUrl}/api/sources/${sourceId}/photometry`,
    headers: {
      Authorization: `token ${token}`,
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
 * @param {string} params.sourceId
 * @param {number[]} params.groupIds
 * @param {string} params.instanceUrl
 * @param {string} params.token
 * @returns {Promise<any>}
 */
export const addSourceToGroup = async ({
  sourceId,
  groupIds,
  instanceUrl,
  token,
}) => {
  let response = await CapacitorHttp.post({
    url: `${instanceUrl}/api/source_groups`,
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    },
    data: {
      objId: sourceId,
      inviteGroupIds: groupIds,
    },
  });
  return response.data.data;
};
