/** @typedef {import("../common/common.lib.js").User} User */
/** @typedef {import("../common/common.lib.js").Group} Group */
/** @typedef {import("../common/common.lib.js").Instrument} Instrument */
/** @typedef {import("../common/common.lib.js").Allocation} Allocation */
/** @typedef {import("../scanning/scanning.lib.js").Candidate} Candidate */

/**
 * @typedef {"new" | "ref" | "sub" | "sdss" | "ls" | "ps1" | "sm" | "hst" | "chandra" | "jwst"} ThumbnailType
 */

/**
 * @typedef {Object} Source
 * @property {string} id - Source ID
 * @property {number} ra - Right ascension
 * @property {number} dec - Declination
 * @property {string} tns_name - TNS name
 * @property {string} created_at - Created date
 * @property {Thumbnail[]} thumbnails - Thumbnails of the source
 * @property {Comment[]} comments - Comments on the source
 * @property {Group[]} groups - Groups the source belongs to
 * @property {Classification[]} classifications - Classifications of the source
 * @property {FollowupRequest[]} followup_requests - Follow-up requests of the source
 * @property {Annotation[]} annotations - Annotations on the source
 */

/**
 * @typedef {Object} Spectra
 * @property {string} id - Spectra ID
 * @property {string} observed_at - Observed date
 * @property {Instrument} instrument - Instrument details
 * @property {Group[]} groups - Groups the spectra belongs to
 * @property {string} instrument_name - Instrument name
 * @property {User} owner - Owner details
 * @property {User[]} pis - Principal investigators
 * @property {User[]} reducers - Reducers
 * @property {User[]} observers - Observers
 * @property {string} type - Type of the spectra
 */

/**
 * @typedef {Object} FollowupRequest
 * @property {string} id - Follow-up request ID
 * @property {string} created_at - Created date
 * @property {Allocation} allocation - Allocation details
 * @property {FollowupPayload} payload - Payload of the follow-up request
 * @property {User} requester - Requester details
 * @property {string} status - Status of the follow-up request
 */

/**
 * @typedef {Object} FollowupPayload
 * @property {string} request_type - Type of the request
 * @property {string} start_date - Start date of the request
 * @property {string} end_date - End date of the request
 * @property {string[]} filters - Filters of the request
 * @property {string} priority - Priority of the request
 */

/**
 * @typedef {Object} Comment
 * @property {string} id - Comment ID
 * @property {string} text - Comment text
 * @property {User} author - Author of the comment
 * @property {string} created_at - Created date
 */

/**
 * @typedef {Object} Thumbnail
 * @property {number} id - Thumbnail ID
 * @property {ThumbnailType} type - Thumbnail type
 * @property {string} public_url - URL of the thumbnail
 * @property {string} created_at - Created date
 * @property {string|null} survey - Survey the alert cutout comes from
 * @property {boolean} is_grayscale - Whether the image is grayscale
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
 * @typedef {Object} Classification
 * @property {string} modified - Modified date
 * @property {boolean} ml - Is the classification from machine learning
 * @property {number} probability - Probability of the classification
 * @property {string} classification - Classification
 */

/**
 * @typedef {Object} Annotation
 * @property {number} id - Annotation ID
 * @property {string} origin - Annotation origin
 * @property {string} obj_id - Object ID
 * @property {{[key: string]: string|number|Array<any>|undefined}} data - Annotation data
 * @property {number} author_id - Author ID
 * @property {Group[]} [groups] - Groups the annotation belongs to, only on candidates
 */

import { isPlatform, useIonToast } from "@ionic/react";
import { useCallback } from "react";
import { Clipboard } from "@capacitor/clipboard";

/** @type {ThumbnailType[]} */
export const ALERT_THUMBNAIL_TYPES = ["new", "ref", "sub"];

/** @type {ThumbnailType[]} */
export const ARCHIVAL_THUMBNAIL_TYPES = ["sdss", "ls", "ps1"];

/**
 * Cutouts SkyPortal only generates when asked to from the source page.
 * @type {ThumbnailType[]}
 */
export const ON_DEMAND_THUMBNAIL_TYPES = ["sm", "hst", "chandra", "jwst"];

/** @type {ThumbnailType[]} */
export const THUMBNAIL_TYPES = [
  ...ALERT_THUMBNAIL_TYPES,
  ...ARCHIVAL_THUMBNAIL_TYPES,
  ...ON_DEMAND_THUMBNAIL_TYPES,
];

/**
 * @param {string} url
 * @returns {boolean}
 */
const isPlaceholderThumbnail = (url) =>
  !url || url.includes("outside_survey") || url.includes("currently_unavailable");

/**
 * Get the thumbnails to display, in display order: the most recent one of each
 * type, and for alert cutouts the most recent one of each survey, as a source
 * can hold cutouts from several surveys at once.
 * @param {Candidate | Source} source
 * @returns {Thumbnail[]}
 */
export const getDisplayedThumbnails = (source) => {
  const sorted = [...(source.thumbnails ?? [])].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  return THUMBNAIL_TYPES.flatMap((type) => {
    const ofType = sorted.filter(
      (t) => t.type === type && !isPlaceholderThumbnail(t.public_url),
    );
    if (!ALERT_THUMBNAIL_TYPES.includes(type)) {
      return ofType.slice(0, 1);
    }
    /** @type {Map<string, Thumbnail>} */
    const bySurvey = new Map();
    ofType.forEach((t) => {
      if (!bySurvey.has(t.survey ?? "")) {
        bySurvey.set(t.survey ?? "", t);
      }
    });
    return [...bySurvey.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, t]) => t);
  });
};

/**
 * Get the link for the survey and alt text for thumbnail
 * @param {ThumbnailType} name - Thumbnail type
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
      link = `https://skyserver.sdss.org/dr18/VisualTools/navi?opt=G&ra=${ra}&dec=${dec}&scale=0.1`;
      break;
    case "ls":
      alt = "Link to Legacy Survey DR10 Image Access";
      link = `https://www.legacysurvey.org/viewer?ra=${ra}&dec=${dec}&layer=ls-dr10&photoz-dr9&zoom=16&mark=${ra},${dec}`;
      break;
    case "ps1":
      alt = "Link to PanSTARRS-1 Image Access";
      link = `https://ps1images.stsci.edu/cgi-bin/ps1cutouts?pos=${ra}+${dec}&filter=color&filter=g&filter=r&filter=i&filter=z&filter=y&filetypes=stack&auxiliary=data&size=240&output_size=0&verbose=0&autoscale=99.500000&catlist=`;
      break;
    case "sm":
      alt = "Link to SkyMapper Image Access";
      link = `https://api.skymapper.nci.org.au/public/siap/dr4/query?POS=${ra},${dec}&SIZE=0.0167&BAND=g,r,i&FORMAT=GRAPHIC&VERB=3`;
      break;
    case "hst":
      alt = "Link to Hubble Legacy Archive";
      link = `https://hla.stsci.edu/hlaview.html#/HLA/${ra},${dec}`;
      break;
    case "chandra":
      alt = "Link to Chandra Source Catalog";
      link = `https://cda.harvard.edu/chaser/searchGuest.do?ra=${ra}&dec=${dec}`;
      break;
    case "jwst":
      alt = "Link to JWST data in MAST";
      link = `https://mast.stsci.edu/search/ui/#/jwst?ra=${ra}&dec=${dec}&radius=6%20arcsec`;
      break;
    default:
      break;
  }
  return { alt, link };
};

/**
 * Get the header for the thumbnail
 * @param {ThumbnailType} type - Thumbnail type
 * @param {string|null} [survey] - Survey the alert cutout comes from
 * @returns {string}
 */
export const getThumbnailHeader = (type, survey = null) => {
  let header;
  switch (type) {
    case "ls":
      header = "LEGACY SURVEY DR10";
      break;
    case "ps1":
      header = "PANSTARRS DR2";
      break;
    case "sm":
      header = "SKYMAPPER DR4";
      break;
    default:
      header = type.toUpperCase();
      break;
  }
  return survey && ALERT_THUMBNAIL_TYPES.includes(type)
    ? `${survey.toUpperCase()} ${header}`
    : header;
};

/**
 * Get the URL of the thumbnail image
 * @param {string} instanceUrl
 * @param {Thumbnail} thumbnail
 * @returns {string}
 */
export function getThumbnailImageUrl(instanceUrl, thumbnail) {
  let res = thumbnail.public_url;
  if (!res.startsWith("http")) {
    return instanceUrl + res;
  }
  // force https for urls that are not from the instance
  if (!res.startsWith(instanceUrl) && res.startsWith("http:")) {
    res = res.replace(/^http:/, "https:");
  }
  return res;
}

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
    value = value.slice(0, length) + ".."
  }
  return value;
}

/**
 * @param {string|number|Array<any>|undefined} data
 * @param {boolean} withIndentation
 * @returns {string|number|undefined}
 */
export const sanitizeAnnotationData = (data, withIndentation) => {
  if (Array.isArray(data)) {
    data = JSON.stringify(data, null, withIndentation ? 2 : 0);
  }else if (typeof data === "boolean") {
    data = data ? "true" : "false";
  }
  return data;
}

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
        duration: 1000,
        color: "success",
        cssClass: isPlatform('android') ? 'avoid-blocking-page-swipe' : '',
      });
    },
    [present],
  );
};
