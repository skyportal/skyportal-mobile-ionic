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
 * @typedef {"specific"|"all"|"ask"} DiscardBehavior
 */

/**
 * @typedef {"new" | "ref" | "sub" | "sdss" | "ls" | "ps1"} ThumbnailType
 */

/**
 * @typedef {Object} ScanningConfig
 * @property {string} startDate
 * @property {string} endDate
 * @property {import("../common/constants").SavedStatus} savedStatus
 * @property {DiscardBehavior} discardBehavior
 * @property {number[]} saveGroupIds
 * @property {Group[]} saveGroups
 * @property {number[]} junkGroupIds
 * @property {Group[]} junkGroups
 * @property {number} numPerPage
 * @property {string} queryID
 */

/**
 * @typedef {Object} ScanningRecap
 * @property {string} queryId
 * @property {number} totalMatches
 * @property {Candidate[]} assigned
 * @property {Candidate[]} notAssigned
 */

import { Clipboard } from "@capacitor/clipboard";
import { useIonToast } from "@ionic/react";
import { useCallback } from "react";
import { getPreference } from "../common/preferences.js";
import { QUERY_KEYS } from "../common/constants.js";
import { searchCandidates } from "./scanningRequests.js";

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
 * @param {Photometry[]} params.photometry
 * @param {number} params.titleFontSize
 * @param {number} params.labelFontSize
 * @param {import("../common/requests").BandpassesColors} params.bandpassesColors
 * @returns {import("vega-embed").VisualizationSpec}
 */
export const getVegaPlotSpec = ({
  photometry,
  titleFontSize,
  labelFontSize,
  bandpassesColors,
}) => {
  /** @type {{domain: string[], range: string[]}} */
  const colorScale = { domain: [], range: [] };
  new Set(photometry.map((p) => p.filter)).forEach((f) => {
    colorScale.domain.push(f);
    colorScale.range.push(`rgb(${bandpassesColors[f].join(",")})`);
  });
  const isDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
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
              titleColor: isDarkMode ? "white" : "black",
              labelColor: isDarkMode ? "white" : "black",
            },
          },
          color: {
            field: "filter",
            type: "nominal",
            scale: colorScale,
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
              titleColor: isDarkMode ? "white" : "black",
              labelColor: isDarkMode ? "white" : "black",
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
              titleColor: isDarkMode ? "white" : "black",
              labelColor: isDarkMode ? "white" : "black",
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

export const useCopyAnnotationLineOnClick = () => {
  const [present] = useIonToast();
  return useCallback(
    /**
     * @param {string} key
     * @param {string|number|undefined} value
     */
    async (key, value) => {
      if (value === undefined) {
        return;
      }
      await Clipboard.write({
        string: `${key}: ${value}`,
      });
      await present({
        message: "Annotation copied to clipboard!",
        duration: 2000,
      });
    },
    [present],
  );
};

/**
 * Parse a string of integers separated by commas
 * @param {string} intListString
 * @returns {number[]}
 */
export const parseIntList = (intListString) =>
  intListString
    .split(",")
    .filter((/** @type {string} **/ id) => id !== "")
    .map((/** @type {string} **/ id) => parseInt(id));

/**
 * @param {Object} params
 * @param {string} params.groupIDs
 * @param {import("../common/constants").SavedStatus} params.savedStatus
 * @param {string} params.startDate
 * @param {string} params.endDate
 * @param {number} params.pageNumber
 * @returns {Promise<import("./scanningRequests.js").CandidateSearchResponse>}
 */
export const initialSearchRequest = async ({
  groupIDs,
  savedStatus,
  startDate,
  endDate,
  pageNumber,
}) => {
  /** @type {import("../onboarding/auth.js").UserInfo} */
  const userInfo = await getPreference({ key: QUERY_KEYS.USER_INFO });
  return searchCandidates({
    instanceUrl: userInfo.instance.url,
    token: userInfo.token,
    groupIDs,
    savedStatus,
    startDate,
    endDate,
    pageNumber,
  });
};

/**
 * @typedef {"MORE"|"REQUEST_OBSERVING_RUN"|"REQUEST_FOLLOW_UP"|"ADD_REDSHIFT"|"SHOW_SURVEYS"|"SAVE"|"DISCARD"} ScanningToolbarAction
 */

/**
 * @type {Object<ScanningToolbarAction, ScanningToolbarAction>}
 */
export const SCANNING_TOOLBAR_ACTION = {
  MORE: "MORE",
  REQUEST_FOLLOW_UP: "REQUEST_FOLLOW_UP",
  REQUEST_OBSERVING_RUN: "REQUEST_OBSERVING_RUN",
  ADD_REDSHIFT: "ADD_REDSHIFT",
  SHOW_SURVEYS: "SHOW_SURVEYS",
  SAVE: "SAVE",
  DISCARD: "DISCARD",
};
