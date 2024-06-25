import { CapacitorHttp } from "@capacitor/core";
import { mockCandidates, mockSources } from "../../config.js";

/**
 * Fetch sources from the API
 * @param {number} page - page number
 * @param {number} numPerPage - number of sources per page
 * @param {string} instanceUrl - SkyPortal instance URL
 * @param {string} token - SkyPortal token
 * @param {string} platform - Platform
 * @returns {Promise<any[]>}
 */
export async function fetchSources(
  page,
  numPerPage,
  instanceUrl,
  token,
  platform,
) {
  if (platform === "web") {
    return mockSources;
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