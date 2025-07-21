/** @typedef {import("../common/common.lib.js").User} User */
/** @typedef {import("../common/common.lib.js").Group} Group */
/** @typedef {import("../common/common.lib.js").Instrument} Instrument */
/** @typedef {import("../common/common.lib.js").Allocation} Allocation */
/** @typedef {import("../scanning/scanning.lib.js").Candidate} Candidate */

/**
 * @typedef {"new" | "ref" | "sub" | "sdss" | "ls" | "ps1"} ThumbnailType
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
 * @property {string} type - Thumbnail type
 * @property {string} public_url - URL of the thumbnail
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
 * @property {Group[]} groups - Groups the annotation belongs to
 */

import { isPlatform, useIonToast } from "@ionic/react";
import { useCallback } from "react";
import { Clipboard } from "@capacitor/clipboard";

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
 * @param {Candidate | Source} source
 * @param {string} type
 * @returns {string|null}
 */
export function getThumbnailImageUrl(instanceUrl, source, type) {
  let thumbnail = source.thumbnails.find((t) => t.type === type);
  if (!thumbnail) {
    return null;
  }
  let res = thumbnail.public_url;
  if (type === "new" || type === "ref" || type === "sub") {
    res = instanceUrl + res;
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
