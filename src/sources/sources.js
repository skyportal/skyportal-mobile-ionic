import { Capacitor, CapacitorHttp } from "@capacitor/core";
import mockSources from "../../mock/sources.json";
import { getPreference } from "../util/preferences.js";
import { PREFERENCES } from "../util/constants.js";

/**
 * @typedef {Object} Source
 * @property {string} id - Source ID
 * @property {number} ra - Right ascension
 * @property {number} dec - Declination
 */

/**
 * Fetch sources from the API
 * @param {Object} props
 * @param {string} props.instanceUrl - URL of the SkyPortal instance
 * @param {string} props.token - User token
 * @param {number} props.page - page number
 * @param {number} props.numPerPage - number of sources per page
 * @returns {Promise<import("../sources/sources.js").Source[]>}
 */
export async function fetchSources({ instanceUrl, token, page, numPerPage }) {
  if (Capacitor.getPlatform() === "web") {
    return mockSources.data.sources;
  }
  let response = await CapacitorHttp.get({
    url: `${instanceUrl}/api/sources`,
    headers: {
      Authorization: `token ${token}`,
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
