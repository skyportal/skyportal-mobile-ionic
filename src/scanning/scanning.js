import mockCandidates from "../../mock/candidates.json";
import { Capacitor, CapacitorHttp } from "@capacitor/core";

/**
 * @typedef {Object} CandidateThumbnail
 * @property {string} type - Thumbnail type
 * @property {string} public_url - URL of the thumbnail
 */

/**
 * @typedef {Object} Group
 * @property {number} id - Group ID
 * @property {string|null} [nickname] - Group nickname
 * @property {string} name - Group name
 * @property {string|null} [description] - Group description
 * @property {boolean} private - Is the group private
 * @property {boolean} single_user_group - Is the group a single user group
 */

/**
 * @typedef {Object} CandidateAnnotation
 * @property {number} id - Annotation ID
 * @property {string} origin - Annotation origin
 * @property {string} obj_id - Object ID
 * @property {{[key: string]: string|number|undefined}} data - Annotation data
 * @property {number} author_id - Author ID
 * @property {Group[]} groups - Groups the annotation belongs to
 */

/**
 * @typedef {Object} Candidate
 * @property {number} ra - Right ascension
 * @property {number} dec - Declination
 * @property {string} id - Source id
 * @property {CandidateThumbnail[]} thumbnails - Thumbnails of the candidate
 * @property {CandidateAnnotation[]} annotations - Annotations of the candidate
 */

/**
 * @typedef {Object} GroupsResponse - Response from the /groups endpoint
 * @property {Group[]} user_groups - User groups
 * @property {Group[]} user_accessible_groups - User accessible groups
 * @property {Group[]} all_groups - All groups
 */

/**
 * @typedef {Object} Photometry
 * @property {number} id - Photometry ID
 * @property {string} obj_id - Object ID
 * @property {string} instrument_id - Instrument ID
 * @property {string} filter - Filter
 * @property {number} mjd - Modified Julian Date
 * @property {number} mag - Magnitude
 * @property {number} magerr - Magnitude error
 * @property {string} limiting_mag - Limiting magnitude
 * @property {string} magsys - Magnitude system
 * @property {string} origin - Origin
 * @property {string|null} ra - Right ascension
 * @property {string|null} dec - Declination
 * @property {string|null} altdata - Alternative data
 * @property {string|null} ra_unc - Right ascension uncertainty
 * @property {string|null} dec_unc - Declination uncertainty
 */

/**
 * @typedef {"new" | "ref" | "sub" | "sdss" | "ls" | "ps1"} ThumbnailType
 */

/**
 * @type {Object<ThumbnailType, ThumbnailType>}
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
 * Get the link for the survey and alt text for thumbnail
 * @param {string} name - Thumbnail type
 * @param {number} ra - Right ascension
 * @param {number} dec - Declination
 * @returns {{alt: string, link: string}}
 */
export const getThumbnailAltAndSurveyLink = (name, ra, dec) => {
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
 * @param {string} type - Thumbnail type
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
 * @param {string} params.startDate - The start date of the candidates
 * @param {string|null} [params.endDate=null] - The end date of the candidates
 * @param {import("../common/constants").SavedStatus} params.savedStatus - The saved status of the candidates
 * @param {string} params.groupIDs - The group IDs to search for
 * @returns {Promise<Candidate[]>}
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
 * @returns {Promise<GroupsResponse>}
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
 * @param {Object} params
 * @param {Photometry[]} params.photometry
 * @param {number} params.titleFontSize
 * @param {number} params.labelFontSize
 * @returns {import("vega-embed").VisualizationSpec}
 */
export const vegaPlotSpec = ({ photometry, titleFontSize, labelFontSize }) => {
  const mjdNow = Date.now() / 86400000.0 + 40587.0;
  return /** @type {any} */ ({
    $schema: "https://vega.github.io/schema/vega-lite/v5.2.0.json",
    background: "transparent",
    width: "container",
    height: "container",
    data: {
      values: photometry,
    },
    layer: [
      {
        selection: {
          filterMags: {
            type: "multi",
            fields: ["filter"],
            bind: "legend",
          },
          grid: {
            type: "interval",
            bind: "scales",
          },
        },
        mark: {
          type: "point",
          shape: "circle",
          filled: "true",
          size: 24,
        },
        transform: [
          {
            calculate:
              "join([format(datum.mag, '.2f'), ' ± ', format(datum.magerr, '.2f'), ' (', datum.magsys, ')'], '')",
            as: "magAndErr",
          },
          { calculate: `${mjdNow} - datum.mjd`, as: "daysAgo" },
        ],
        encoding: {
          x: {
            field: "daysAgo",
            type: "quantitative",
            scale: {
              zero: false,
              reverse: true,
            },
            axis: {
              title: "days ago",
              titleFontSize,
              labelFontSize,
            },
          },
          y: {
            field: "mag",
            type: "quantitative",
            scale: {
              zero: false,
              reverse: true,
            },
            axis: {
              title: "mag",
              titleFontSize,
              labelFontSize,
            },
          },
          color: {
            field: "filter",
            type: "nominal",
            legend: {
              titleAnchor: "start",
              offset: 5,
            },
          },
          tooltip: [
            { field: "magAndErr", title: "mag", type: "nominal" },
            { field: "filter", type: "ordinal" },
            { field: "mjd", type: "quantitative" },
            { field: "daysAgo", type: "quantitative" },
            { field: "limiting_mag", type: "quantitative", format: ".2f" },
          ],
          opacity: {
            condition: { selection: "filterMags", value: 1 },
            value: 0,
          },
        },
      },

      // Render error bars
      {
        selection: {
          filterErrBars: {
            type: "multi",
            fields: ["filter"],
            bind: "legend",
          },
        },
        transform: [
          { filter: "datum.mag != null && datum.magerr != null" },
          { calculate: "datum.mag - datum.magerr", as: "magMin" },
          { calculate: "datum.mag + datum.magerr", as: "magMax" },
          { calculate: `${mjdNow} - datum.mjd`, as: "daysAgo" },
        ],
        mark: {
          type: "rule",
          size: 0.5,
        },
        encoding: {
          x: {
            field: "daysAgo",
            type: "quantitative",
            scale: {
              zero: false,
              reverse: true,
              padding: 0,
            },
            axis: {
              title: "days ago",
              titleFontSize,
              labelFontSize,
            },
          },
          y: {
            field: "magMin",
            type: "quantitative",
            scale: {
              zero: false,
              reverse: true,
            },
          },
          y2: {
            field: "magMax",
            type: "quantitative",
            scale: {
              zero: false,
              reverse: true,
            },
          },
          color: {
            field: "filter",
            type: "nominal",
            legend: {
              orient: "bottom",
              titleFontSize,
              labelFontSize,
            },
          },
          opacity: {
            condition: { selection: "filterErrBars", value: 1 },
            value: 0,
          },
        },
      },

      // Render limiting mags
      {
        transform: [
          { filter: "datum.mag == null" },
          { calculate: `${mjdNow} - datum.mjd`, as: "daysAgo" },
        ],
        selection: {
          filterLimitingMags: {
            type: "multi",
            fields: ["filter"],
            bind: "legend",
          },
        },
        mark: {
          type: "point",
          shape: "triangle-down",
        },
        encoding: {
          x: {
            field: "daysAgo",
            type: "quantitative",
            scale: {
              zero: false,
              reverse: true,
            },
            axis: {
              title: "days ago",
              titleFontSize,
              labelFontSize,
            },
          },
          y: {
            field: "limiting_mag",
            type: "quantitative",
          },
          color: {
            field: "filter",
            type: "nominal",
          },
          opacity: {
            condition: { selection: "filterLimitingMags", value: 0.3 },
            value: 0,
          },
        },
      },
    ],
  });
};

/**
 * Fetch the photometry of a source
 * @param {Object} params
 * @param {string} params.sourceId - The source ID
 * @param {string} params.instanceUrl - The URL of the instance
 * @param {string} params.token - The token to use to fetch the photometry
 * @param {string} [params.includeOwnerInfo="true"] - Include owner info
 * @param {string} [params.includeStreamInfo="true"] - Include stream info
 * @param {string} [params.includeValidationInfo="true"] - Include validation info
 * @returns {Promise<Photometry[]>}
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
