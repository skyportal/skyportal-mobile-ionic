import { CapacitorHttp } from "@capacitor/core";

/**
 * @typedef {Object} Source
 * @property {string} id - Source ID
 * @property {number} ra - Right ascension
 * @property {number} dec - Declination
 */

/**
 * Fetch sources from the API
 * @param {Object} props
 * @param {import("../onboarding/auth.js").UserInfo} props.userInfo - User info
 * @param {number} props.page - page number
 * @param {number} props.numPerPage - number of sources per page
 * @returns {Promise<import("../sources/sources.js").Source[]>}
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
