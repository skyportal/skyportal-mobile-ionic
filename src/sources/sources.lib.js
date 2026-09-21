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
 * @property {Group[]} groups - Groups the source belongs to
 * @property {Classification[]} classifications - Classifications of the source
 * @property {FollowupRequest[]} followup_requests - Follow-up requests of the source
 * @property {Annotation[]} annotations - Annotations on the source
 * @property {Tag[]} tags - Tags attached to the source
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
 * @typedef {Object} CommentAuthor
 * @property {string} id - Author ID
 * @property {string} username - Username
 * @property {string|null} first_name - First name
 * @property {string|null} last_name - Last name
 * @property {string} gravatar_url - Url of the gravatar profile of the author
 */

/**
 * @typedef {Object} CommentAttachment
 * @property {string} name - File name
 * @property {string} body - File contents as a base64 data URL
 */

/**
 * @typedef {Object} Comment
 * @property {string} id - Comment ID
 * @property {string} text - Comment text
 * @property {CommentAuthor} author - Author of the comment
 * @property {string} created_at - Created date
 * @property {string|null} channel - Conversation the comment belongs to
 * @property {"scanning"|null} origin - Workflow the comment was created from
 * @property {boolean} bot - Whether the comment was posted by a bot
 * @property {boolean} system - Whether the comment was emitted by SkyPortal itself
 * @property {string|null} attachment_name - File name of the attachment, if any
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
 * @typedef {Object} TagOption
 * @property {number} id - Tag option ID
 * @property {string} name - Tag name
 * @property {string|null} color - Color of the tag chip
 */

/**
 * @typedef {Object} Tag
 * @property {number} id - Tag ID
 * @property {string} name - Tag name
 * @property {number} objtagoption_id - ID of the tag option it comes from
 * @property {string} [obj_id] - Object the tag is attached to
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

export const MAIN_COMMENT_CHANNEL = "Comments";

export const DEFAULT_TAG_COLOR = "#dddfe2";

/**
 * Get the text color readable over the given background color
 * @param {string} hexColor
 * @returns {string}
 */
export const getContrastColor = (hexColor) => {
  if (hexColor.length !== 7) return "#000000";
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? "#000000" : "#ffffff";
};

/** @type {ThumbnailType[]} */
export const ALERT_THUMBNAIL_TYPES = ["new", "ref", "sub"];

/** @type {ThumbnailType[]} */
export const ARCHIVAL_THUMBNAIL_TYPES = ["sdss", "ls", "ps1"];

/**
 * Cutouts SkyPortal only generates when asked to from the source page.
 * @type {ThumbnailType[]}
 */
export const ON_DEMAND_THUMBNAIL_TYPES = ["sm", "hst", "chandra", "jwst"];

/**
 * Cutouts whose "no coverage" answer can only be told apart by fetching them.
 * @type {ThumbnailType[]}
 */
export const FETCHED_THUMBNAIL_TYPES = ["ls", "sdss"];

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
 * The most recent cutout of each type, and of each survey for the alert ones.
 * @param {Candidate | Source} source
 * @returns {Thumbnail[]}
 */
export const getDisplayedThumbnails = (source) => {
  const sorted = [...(source.thumbnails ?? [])]
    .filter((t) => !isPlaceholderThumbnail(t.public_url))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return THUMBNAIL_TYPES.flatMap((type) => {
    const ofType = sorted.filter((t) => t.type === type);
    if (!ALERT_THUMBNAIL_TYPES.includes(type)) return ofType.slice(0, 1);
    return ofType
      .filter((t, index) => ofType.findIndex((o) => o.survey === t.survey) === index)
      .sort((a, b) => (a.survey ?? "").localeCompare(b.survey ?? ""));
  });
};

/**
 * @type {Partial<Record<ThumbnailType, {alt: string, link?: (ra: number, dec: number) => string}>>}
 */
const THUMBNAIL_SURVEYS = {
  new: { alt: "discovery image" },
  ref: { alt: "pre-discovery (reference) image" },
  sub: { alt: "subtracted image" },
  sdss: {
    alt: "Link to SDSS Navigate tool",
    link: (ra, dec) =>
      `https://skyserver.sdss.org/dr18/VisualTools/navi?opt=G&ra=${ra}&dec=${dec}&scale=0.1`,
  },
  ls: {
    alt: "Link to Legacy Survey DR10 Image Access",
    link: (ra, dec) =>
      `https://www.legacysurvey.org/viewer?ra=${ra}&dec=${dec}&layer=ls-dr10&photoz-dr9&zoom=16&mark=${ra},${dec}`,
  },
  ps1: {
    alt: "Link to PanSTARRS-1 Image Access",
    link: (ra, dec) =>
      `https://ps1images.stsci.edu/cgi-bin/ps1cutouts?pos=${ra}+${dec}&filter=color&filter=g&filter=r&filter=i&filter=z&filter=y&filetypes=stack&auxiliary=data&size=240&output_size=0&verbose=0&autoscale=99.500000&catlist=`,
  },
  sm: {
    alt: "Link to SkyMapper Image Access",
    link: (ra, dec) =>
      `https://api.skymapper.nci.org.au/public/siap/dr4/query?POS=${ra},${dec}&SIZE=0.0167&BAND=g,r,i&FORMAT=GRAPHIC&VERB=3`,
  },
  hst: {
    alt: "Link to Hubble Legacy Archive",
    link: (ra, dec) => `https://hla.stsci.edu/hlaview.html#/HLA/${ra},${dec}`,
  },
  chandra: {
    alt: "Link to Chandra Source Catalog",
    link: (ra, dec) =>
      `https://cda.harvard.edu/chaser/searchGuest.do?ra=${ra}&dec=${dec}`,
  },
  jwst: {
    alt: "Link to JWST data in MAST",
    link: (ra, dec) =>
      `https://mast.stsci.edu/search/ui/#/jwst?ra=${ra}&dec=${dec}&radius=6%20arcsec`,
  },
};

/** @type {Partial<Record<ThumbnailType, string>>} */
const THUMBNAIL_HEADERS = {
  ls: "LEGACY SURVEY DR10",
  ps1: "PANSTARRS DR2",
  sm: "SKYMAPPER DR4",
};

/**
 * @param {ThumbnailType} name - Thumbnail type
 * @param {number} ra - Right ascension
 * @param {number} dec - Declination
 * @returns {{alt: string, link: string}}
 */
export const getThumbnailAltAndSurveyLink = (name, ra, dec) => {
  const survey = THUMBNAIL_SURVEYS[name];
  return { alt: survey?.alt ?? "", link: survey?.link?.(ra, dec) ?? "" };
};

/**
 * @param {ThumbnailType} type - Thumbnail type
 * @param {string|null} [survey] - Survey the alert cutout comes from
 * @returns {string}
 */
export const getThumbnailHeader = (type, survey = null) => {
  const header = THUMBNAIL_HEADERS[type] ?? type.toUpperCase();
  return survey && ALERT_THUMBNAIL_TYPES.includes(type)
    ? `${survey.toUpperCase()} ${header}`
    : header;
};

/**
 * @param {string} instanceUrl
 * @param {Thumbnail} thumbnail
 * @returns {string}
 */
export function getThumbnailImageUrl(instanceUrl, thumbnail) {
  const url = thumbnail.public_url;
  if (!url.startsWith("http")) return instanceUrl + url;
  // force https for urls that are not from the instance
  return url.startsWith(instanceUrl) ? url : url.replace(/^http:/, "https:");
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
 * @param {any} data
 * @param {boolean} withIndentation
 * @returns {string|number|undefined}
 */
export const sanitizeAnnotationData = (data, withIndentation) => {
  if (data !== null && typeof data === "object") {
    data = JSON.stringify(data, null, withIndentation ? 2 : 0);
  } else if (typeof data === "boolean") {
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
