import { Capacitor, CapacitorHttp } from "@capacitor/core";
import mockCandidates from "../../mock/candidates.json";

/**
 * Returns the candidates from the API
 * @param {Object} params
 * @param {string} params.instanceUrl - The URL of the instance
 * @param {string} params.token - The token to use to fetch the candidates
 * @param {string} params.startDate - The start date of the candidates
 * @param {string|null} [params.endDate=null] - The end date of the candidates
 * @param {import("../common/constants").SavedStatus} params.savedStatus - The saved status of the candidates
 * @param {string} params.groupIDs - The group IDs to search for
 * @returns {Promise<import("./scanningLib.js").Candidate[]>}
 */
export async function searchCandidates({
  instanceUrl,
  token,
  startDate,
  endDate,
  savedStatus,
  groupIDs,
}) {
  // example: https://preview.fritz.science/api/candidates?pageNumber=1&numPerPage=50&groupIDs=4&savedStatus=savedToAnySelected&listNameReject=rejected_candidates&startDate=2024-07-01T21%3A27%3A27.232Z
  if (Capacitor.getPlatform() === "web") {
    return mockCandidates.data.candidates;
  }
  let response = await CapacitorHttp.get({
    url: `${instanceUrl}/api/candidates`,
    headers: {
      Authorization: `token ${token}`,
    },
    params: {
      pageNumber: "1",
      numPerPage: "50",
      groupIDs,
      savedStatus,
      listNameReject: "rejected_candidates",
      startDate,
      endDate: endDate || "",
    },
  });
  return response.data.data.candidates;
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
