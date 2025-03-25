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
 * @property {{[key: string]: string|number|Array<any>|undefined}} data - Annotation data
 * @property {number} author_id - Author ID
 * @property {Group[]} groups - Groups the annotation belongs to
 */

/**
 * @typedef {Object} CandidateClassification
 * @property {string} modified - Modified date
 * @property {boolean} ml - Is the classification from machine learning
 * @property {number} probability - Probability of the classification
 * @property {string} classification - Classification
 */

/**
 * @typedef {Object} Candidate
 * @property {number} ra - Right ascension
 * @property {number} dec - Declination
 * @property {string} id - Source id
 * @property {CandidateThumbnail[]} thumbnails - Thumbnails of the candidate
 * @property {CandidateAnnotation[]} annotations - Annotations of the candidate
 * @property {boolean} is_source - Is the candidate has been saved
 * @property {Group[]} saved_groups - Groups the candidate has been saved to
 * @property {CandidateClassification[]} classifications - Classifications of the candidate
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
 * @property {import("../common/common.lib.js").SavedStatus} savedStatus
 * @property {DiscardBehavior} discardBehavior
 * @property {number[]} saveGroupIds
 * @property {Group[]} saveGroups
 * @property {number[]} junkGroupIDs
 * @property {Group[]} junkGroups
 * @property {string[]} pinnedAnnotations
 * @property {string} queryID
 * @property {number} totalMatches
 */

/**
 * @typedef {Object} ScanningRecap
 * @property {string} queryId
 * @property {number} totalMatches
 * @property {Candidate[]} assigned
 * @property {Candidate[]} notAssigned
 */

import config from "../config.js";
import { Clipboard } from "@capacitor/clipboard";
import { useIonToast } from "@ionic/react";
import { useCallback } from "react";
import moment from "moment-timezone";

import { SAVED_STATUS } from "../common/common.lib.js";

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
 * @param {string} instanceUrl - Instance URL
 * @param {string} name - Thumbnail type
 * @param {number} ra - Right ascension
 * @param {number} dec - Declination
 * @returns {{alt: string, link: string}}
 */
export const getThumbnailAltAndSurveyLink = (instanceUrl, name, ra, dec) => {
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
      link = `${instanceUrl}/static/images/outside_survey.png`;
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
 * @param {string} instanceUrl
 * @param {Candidate} candidate
 * @param {string} type
 * @returns {string|null}
 */
export function getThumbnailImageUrl(instanceUrl, candidate, type) {
  let thumbnail = candidate.thumbnails.find((t) => t.type === type);
  if (!thumbnail) {
    return null;
  }
  let res = thumbnail.public_url;
  if (type === "new" || type === "ref" || type === "sub") {
    res = instanceUrl + res;
  }
  if (res.startsWith("http:")) {  // force https
    res = res.replace(/^http:/, "https:");
  }
  return res;
}

/**
 * @param {Object} params
 * @param {Photometry[]} params.photometry
 * @param {number} params.titleFontSize
 * @param {number} params.labelFontSize
 * @param {import("../common/common.requests.js").BandpassesColors} params.bandpassesColors
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
export const parseIntList = (intListString) => {
  try {
    return intListString
      .split(",")
      .filter((/** @type {string} **/ id) => id !== "")
      .map((/** @type {string} **/ id) => parseInt(id));
  } catch (e) {
    return [];
  }
};

/**
 *
 * @param {import("../onboarding/onboarding.lib.js").ScanningProfile} scanningProfile
 * @returns {string}
 */
export const getStartDate = (scanningProfile) => {
  return moment()
    .subtract(parseInt(scanningProfile.timeRange), "hours")
    .format();
};

/**
 * @param {import("../onboarding/onboarding.lib.js").ScanningProfile} scanningProfile
 */
export const getFiltering = (scanningProfile) => {
  switch (scanningProfile.savedStatus) {
    case SAVED_STATUS.ALL:
      return {
        filterCandidates: false,
        filteringType: "include",
        filteringAnyOrAll: "all",
      };
    case SAVED_STATUS.SAVED_TO_ALL_SELECTED:
      return {
        filterCandidates: true,
        filteringType: "include",
        filteringAnyOrAll: "all",
      };
    case SAVED_STATUS.SAVED_TO_ANY_SELECTED:
      return {
        filterCandidates: true,
        filteringType: "include",
        filteringAnyOrAll: "any",
      };
    case SAVED_STATUS.NOT_SAVED_TO_ALL_SELECTED:
      return {
        filterCandidates: true,
        filteringType: "exclude",
        filteringAnyOrAll: "all",
      };
    case SAVED_STATUS.NOT_SAVED_TO_ANY_SELECTED:
      return {
        filterCandidates: true,
        filteringType: "exclude",
        filteringAnyOrAll: "any",
      };
    default:
      throw new Error("Invalid savedStatus");
  }
};

/**
 * @param {Object} data
 * @param {boolean} data.filterCandidates
 * @param {string} data.filteringType
 * @param {string} data.filteringAnyOrAll
 * @returns {import("../common/common.lib.js").SavedStatus}
 */
export const computeSavedStatus = ({
  filterCandidates,
  filteringType,
  filteringAnyOrAll,
}) => {
  if (!filterCandidates) {
    return SAVED_STATUS.ALL;
  }
  if (filteringType === "include" && filteringAnyOrAll === "all") {
    return SAVED_STATUS.SAVED_TO_ALL_SELECTED;
  }
  if (filteringType === "include" && filteringAnyOrAll === "any") {
    return SAVED_STATUS.SAVED_TO_ANY_SELECTED;
  }
  if (filteringType === "exclude" && filteringAnyOrAll === "all") {
    return SAVED_STATUS.NOT_SAVED_TO_ALL_SELECTED;
  }
  if (filteringType === "exclude" && filteringAnyOrAll === "any") {
    return SAVED_STATUS.NOT_SAVED_TO_ANY_SELECTED;
  }
  throw new Error(
    "Invalid filterCandidates, filteringType, or filteringAnyOrAll",
  );
};

export const getDefaultValues = () => ({
  startDate: config.SCANNING_START_DATE || moment().format(),
  endDate: moment().format(),
  filterCandidates: false,
  filteringType: "include",
  filteringAnyOrAll: "all",
  selectedGroups: [],
  junkGroups: [],
  discardBehavior: "specific",
  discardGroup: null,
  pinnedAnnotations: [],
});

/**
 * @typedef {"REQUEST_OBSERVING_RUN"|"REQUEST_FOLLOW_UP"|"ADD_REDSHIFT"|"SHOW_SURVEYS"|"SAVE"|"DISCARD"|"EXIT"} ScanningToolbarAction
 */

/**
 * @type {Object<ScanningToolbarAction, ScanningToolbarAction>}
 */
export const SCANNING_TOOLBAR_ACTION = {
  REQUEST_FOLLOW_UP: "REQUEST_FOLLOW_UP",
  REQUEST_OBSERVING_RUN: "REQUEST_OBSERVING_RUN",
  ADD_REDSHIFT: "ADD_REDSHIFT",
  SHOW_SURVEYS: "SHOW_SURVEYS",
  SAVE: "SAVE",
  DISCARD: "DISCARD",
  EXIT: "EXIT",
};

/**
 * @param {string} group
 * @param {string} annotationKey
 * @returns {`${string}/${string}`}
 */
export const getAnnotationId = (group, annotationKey) =>
  `${group}/${annotationKey}`;

/**
 * @param {string} annotationId
 * @returns {{key: string, origin: string}}
 */
export const extractAnnotationOriginAndKey = (annotationId) => {
  const lastIndexOfSlash = annotationId.lastIndexOf("/");
  const origin = annotationId.slice(0, lastIndexOfSlash);
  const key = annotationId.slice(lastIndexOfSlash + 1);
  return { origin, key };
};


/**
 * @param {string|number|undefined} value
 * @param {number} length
 * @returns {string|number|undefined}
 */
export const concat = (value, length) => {
  if (typeof value === "string" && value.length > length) {
    value = value.slice(0, length) + "..."
  }
  return value;
}

/**
 * @param {string|number|Array<any>|undefined} data
 * @returns {string|number|undefined}
 */
export const sanitizeAnnotationData = (data) => {
  if (Array.isArray(data)) {
    data = JSON.stringify(data, null, 2)
  }
  return data;
}
