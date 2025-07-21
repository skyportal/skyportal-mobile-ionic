/** @typedef {import("../common/common.lib.js").Group} Group */
/** @typedef {import("../sources/sources.lib.js").Source} Source */
/** @typedef {import("../sources/sources.lib.js").FollowupRequest} FollowupRequest */
/** @typedef {import("../sources/sources.lib.js").Comment} Comment */
/** @typedef {import("../sources/sources.lib.js").Thumbnail} Thumbnail */
/** @typedef {import("../sources/sources.lib.js").Spectra} Spectra */
/** @typedef {import("../sources/sources.lib.js").Photometry} Photometry */
/** @typedef {import("../sources/sources.lib.js").Classification} Classification */
/** @typedef {import("../sources/sources.lib.js").Annotation} Annotation */

/**
 * @typedef {Object} ScanningProfile
 * @property {string} name - The name of the scanning profile
 * @property {boolean} default - Whether the profile is the default one
 * @property {number[]} groupIDs - The IDs of the groups that the profile is associated with
 * @property {string} timeRange - The time range of the profile
 * @property {string} [sortingKey] - The key to use to sort the profile
 * @property {SavedStatus} savedStatus - The status of the profile
 * @property {string} [sortingOrder] - The order to use to sort the profile
 * @property {string} [sortingOrigin] - The origin of the sorting
 * @property {string} rejectedStatus - The status of the rejected
 * @property {string} [redshiftMaximum] - The maximum redshift
 * @property {string} [redshiftMinimum] - The minimum redshift
 */

/**
 * @typedef {Object} Candidate
 * @property {number} ra - Right ascension
 * @property {number} dec - Declination
 * @property {string} id - Source id
 * @property {Thumbnail[]} thumbnails - Thumbnails of the candidate
 * @property {Annotation[]} annotations - Annotations of the candidate
 * @property {boolean} is_source - Is the candidate has been saved
 * @property {Group[]} saved_groups - Groups the candidate has been saved to
 * @property {Classification[]} classifications - Classifications of the candidate
 * @property {FollowupRequest[]} followup_requests - Follow-up requests
 * @property {Comment[]} comments - Comments on the follow-up request
 * @property {string} tns_name - TNS name
 * @property {Spectra[]} spectra - Spectra of the candidate
 */

/**
 * @typedef {"specific"|"all"|"ask"} DiscardBehavior
 */

/**
 * @typedef {Object} ScanningConfig
 * @property {string} startDate
 * @property {string} endDate
 * @property {SavedStatus} savedStatus
 * @property {number[]} saveGroupIds
 * @property {Group[]} saveGroups
 * @property {number[]} junkGroupIDs
 * @property {Group[]} junkGroups
 * @property {DiscardBehavior} discardBehavior
 * @property {number|null} discardGroup - Group to discard candidates to, if discardBehavior is "specific"
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

/**
 * @typedef {"all" | "savedToAllSelected" | "savedToAnySelected" | "savedToAnyAccessible" | "notSavedToAnyAccessible" | "notSavedToAnySelected" | "notSavedToAllSelected"} SavedStatus
 */

import config from "../config.js";
import moment from "moment-timezone";

/**
 * @type {Object.<SavedStatus, string>}
 */
export const SAVED_STATUS = {
  ALL: "all",
  SAVED_TO_ALL_SELECTED: "savedToAllSelected",
  SAVED_TO_ANY_SELECTED: "savedToAnySelected",
  SAVED_TO_ANY_ACCESSIBLE: "savedToAnyAccessible",
  NOT_SAVED_TO_ANY_ACCESSIBLE: "notSavedToAnyAccessible",
  NOT_SAVED_TO_ANY_SELECTED: "notSavedToAnySelected",
  NOT_SAVED_TO_ALL_SELECTED: "notSavedToAllSelected",
};
export const CANDIDATES_PER_PAGE = 10;

/**
 * @param {Object} params
 * @param {Photometry[]} params.photometry
 * @param {number} params.titleFontSize
 * @param {number} params.labelFontSize
 * @param {import("../common/common.requests.js").BandpassesColors} params.bandpassesColors
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
    $schema: "https://vega.github.io/schema/vega-lite/v6.json",
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
 * @param {import("./scanning.lib.js").ScanningProfile} scanningProfile
 * @returns {string}
 */
export const getStartDate = (scanningProfile) => {
  return moment()
    .subtract(parseInt(scanningProfile.timeRange), "hours")
    .format();
};

/**
 * @param {import("./scanning.lib.js").ScanningProfile} scanningProfile
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
 * @returns {SavedStatus}
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
