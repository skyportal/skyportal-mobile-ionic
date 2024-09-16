import { CapacitorHttp } from "@capacitor/core";
import { CANDIDATES_PER_PAGE } from "../common/constants.js";
import { fetchUserProfile } from "../onboarding/auth.js";

/**
 * @typedef {Object} CandidateSearchResponse
 * @property {import("./scanningLib.js").Candidate[]} candidates - The candidates
 * @property {number} totalMatches - The total matches
 * @property {string} queryID - The query ID
 * @property {string} pageNumber - The page number
 */

/**
 * @typedef {{[key: string]: "number"|"string"|null}} AnnotationKeyInfo
 */

/**
 * @typedef {{[key: string]: AnnotationKeyInfo[]}} AnnotationsInfo
 */

/**
 * Returns the candidates from the API
 * @param {Object} params
 * @param {import("../onboarding/auth.js").UserInfo} params.userInfo - The user info
 * @param {string} params.startDate - The start date of the candidates
 * @param {string|null} [params.endDate=null] - The end date of the candidates
 * @param {import("../common/constants").SavedStatus} params.savedStatus - The saved status of the candidates
 * @param {string} params.groupIDs - The group IDs to search for
 * @param {string|null} [params.queryID=null] - The query ID
 * @param {number} params.pageNumber - The page number
 * @param {number} [params.numPerPage] - The number of candidates per page
 * @returns {Promise<CandidateSearchResponse>}
 */
export async function searchCandidates({
  userInfo,
  startDate,
  endDate,
  savedStatus,
  groupIDs,
  queryID = null,
  pageNumber,
  numPerPage = CANDIDATES_PER_PAGE,
}) {
  // example: https://preview.fritz.science/api/candidates?pageNumber=1&numPerPage=50&groupIDs=4&savedStatus=savedToAnySelected&listNameReject=rejected_candidates&startDate=2024-07-01T21%3A27%3A27.232Z
  let response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/candidates`,
    headers: {
      Authorization: `token ${userInfo.token}`,
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
 * @param {import("../onboarding/auth.js").UserInfo} userInfo
 * @returns {Promise<import("./scanningLib.js").GroupsResponse>}
 */
export async function fetchGroups(userInfo) {
  let response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/groups`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
  });
  return response.data.data;
}

/**
 * Fetch the photometry of a source
 * @param {Object} params
 * @param {string} params.sourceId - The source ID
 * @param {import("../onboarding/auth.js").UserInfo} params.userInfo - The user info
 * @param {string} [params.includeOwnerInfo="true"] - Include owner info
 * @param {string} [params.includeStreamInfo="true"] - Include stream info
 * @param {string} [params.includeValidationInfo="true"] - Include validation info
 * @returns {Promise<import("./scanningLib.js").Photometry[]>}
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
 * @param {string} params.sourceId
 * @param {number[]} params.groupIds
 * @param {import("../onboarding/auth.js").UserInfo} params.userInfo
 * @returns {Promise<any>}
 */
export const addSourceToGroup = async ({ sourceId, groupIds, userInfo }) => {
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
 * @param {Object} params
 * @param {import("../onboarding/auth.js").UserInfo} params.userInfo
 * @param {import("../onboarding/auth.js").ScanningProfile} params.profile
 * @returns {Promise<*>}
 */
export const createNewProfile = async ({ userInfo, profile }) => {
  let userProfile = await fetchUserProfile(userInfo);
  let scanningProfiles = userProfile.preferences.scanningProfiles;
  const newScanningProfiles = scanningProfiles.map((p) => ({
    ...p,
    default: false,
  }));
  newScanningProfiles.push(profile);
  let response = await CapacitorHttp.patch({
    url: `${userInfo.instance.url}/api/internal/profile`,
    headers: {
      Authorization: `token ${userInfo.token}`,
      "Content-Type": "application/json",
    },
    data: {
      preferences: {
        scanningProfiles: newScanningProfiles,
      },
    },
  });
  return response.data.data;
};

/**
 * @param {Object} params
 * @param {import("../onboarding/auth.js").UserInfo} params.userInfo
 * @returns {Promise<AnnotationsInfo>}
 */
export const fetchAnnotationInfo = async ({ userInfo }) => {
  let response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/internal/annotations_info`,
    headers: {
      Authorization: `token ${userInfo.token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data.data;
};
