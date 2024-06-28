import { Capacitor, CapacitorHttp } from "@capacitor/core";
import mockSources from "../../mock/sources.json";
import { getPreference } from "../util/preferences.js";
import { PREFERENCES } from "../util/constants.js";

/**
 * Fetch sources from the API
 * @param {number} page - page number
 * @param {number} numPerPage - number of sources per page
 * @returns {Promise<any[]>}
 */
export async function fetchSources(page, numPerPage) {
  if (Capacitor.getPlatform() === "web") {
    return mockSources.data.sources;
  }
  // @ts-ignore
  const { instance, token } = await getPreference({
    key: PREFERENCES.USER_INFO,
  });
  let response = await CapacitorHttp.get({
    url: `${instance.url}/api/sources`,
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
