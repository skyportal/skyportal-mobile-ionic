import mockCandidates from "../../mock/candidates.json";
import { Capacitor, CapacitorHttp } from "@capacitor/core";

/**
 * @typedef {Object} CandidateThumbnail
 * @property {string} type - Thumbnail type
 * @property {string} public_url - URL of the thumbnail
 */

/**
 * @typedef {Object} Candidate
 * @property {CandidateThumbnail[]} thumbnails - Thumbnails of the candidate
 * @property {number} ra - Right ascension
 * @property {number} dec - Declination
 */

/**
 * @typedef {Object} Group
 * @property {number} id - Group ID
 * @property {string} [nickname] - Group nickname
 * @property {string} name - Group name
 * @property {string} [description] - Group description
 * @property {boolean} private - Is the group private
 * @property {boolean} single_user_group - Is the group a single user group
 */

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

/**
 * Returns the candidates from the API
 * @param {Object} params
 * @param {string} params.instanceUrl - The URL of the instance
 * @param {string} params.token - The token to use to fetch the candidates
 * @returns {Promise<Candidate[]>}
 */
export async function searchCandidates({ instanceUrl, token }) {
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
      groupIDs: "4",
      savedStatus: "all",
      listNameReject: "rejected_candidates",
      startDate: "2022-07-27T00:27:30.000Z",
    },
  });
  return response.data.data.candidates;
}

/**
 * Get the URL of the thumbnail image
 * @param {Candidate} candidate
 * @param {string} type
 * @returns {string}
 */
export function getThumbnailImageUrl(candidate, type) {
  let thumbnail = candidate.thumbnails.find((t) => t.type === type);
  if (!thumbnail) {
    throw new Error(`No thumbnail of type ${type} found`);
  }
  let res = thumbnail.public_url;
  if (type === "new" || type === "ref" || type === "sub") {
    res = "https://preview.fritz.science" + res;
  }
  return res;
}

/**
 * @param {Object} params
 * @param {string} params.instanceUrl
 * @param {string} params.token
 * @returns {Promise<{user_groups: Group[], user_accessible_groups: Group[], all_groups: Group[]}>}
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
