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

export const THUMBNAIL_TYPES = {
  new: "new",
  ref: "ref",
  sub: "sub",
  sdss: "sdss",
  ls: "ls",
  ps1: "ps1",
};

/**
 * @typedef {"new" | "ref" | "sub" | "sdss" | "ls" | "ps1"} ThumbnailType
 */

/**
 * Get the link for the survey and alt text for thumbnail
 * @param {ThumbnailType} name - Thumbnail type
 * @param {number} ra - Right ascension
 * @param {number} dec - Declination
 * @returns {{alt: string, link: string}}
 */
export const getThumbnailAltAndLink = (name, ra, dec) => {
  let alt = "";
  let link = "";
  switch (name) {
    case "new":
      alt = `discovery image`;
      break;
    case "ref":
      alt = `pre-discovery (reference) image`;
      break;
    case "sub":
      alt = `subtracted image`;
      break;
    case "sdss":
      alt = "Link to SDSS Navigate tool";
      link = `https://skyserver.sdss.org/dr16/en/tools/chart/navi.aspx?opt=G&ra=${ra}&dec=${dec}&scale=0.25`;
      break;
    case "ls":
      alt = "Link to Legacy Survey DR9 Image Access";
      link = `https://www.legacysurvey.org/viewer?ra=${ra}&dec=${dec}&layer=ls-dr9&photoz-dr9&zoom=16&mark=${ra},${dec}`;
      break;
    case "ps1":
      alt = "Link to PanSTARRS-1 Image Access";
      link = `https://ps1images.stsci.edu/cgi-bin/ps1cutouts?pos=${ra}+${dec}&filter=color&filter=g&filter=r&filter=i&filter=z&filter=y&filetypes=stack&auxiliary=data&size=240&output_size=0&verbose=0&autoscale=99.500000&catlist=`;
      break;
    default:
      link = "https://fritz.science//static/images/outside_survey.png";
      break;
  }
  return { alt, link };
};
/**
 * Get the header for the thumbnail
 * @param {ThumbnailType} type - Thumbnail type
 * @returns {string}
 */
export const getThumbnailHeader = (type) => {
  switch (type) {
    case "ls":
      return "LEGACY SURVEY DR9";
    case "ps1":
      return "PANSTARRS DR2";
    default:
      return type.toUpperCase();
  }
};

export async function searchCandidates() {
  return mockCandidates.data.candidates;
}

export function getThumbnailImageUrl(candidate, type) {
  let res = candidate.thumbnails.find((t) => t.type === type).public_url;
  if (type === "new" || type === "ref" || type === "sub") {
    res = "https://preview.fritz.science" + res;
  }
  return res;
}
