import { CapacitorHttp } from "@capacitor/core";

/**
 * @typedef {[r:number, g:number, b:number]} BandpassColors
 */

/**
 * @typedef {{[bandpass: string]: BandpassColors}} BandpassesColors
 */

/**
 * @typedef {Object} SkyPortalConfig
 * @property {BandpassesColors} bandpassesColors
 */

/**
 * Fetch the configuration from the server
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} userInfo - The user info
 * @returns {Promise<SkyPortalConfig>}
 */
export const fetchConfig = async (userInfo) => {
  const response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/config`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
  });
  return response.data.data;
};

/**
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} userInfo
 * @returns {Promise<import("./common.lib.js").GroupsResponse>}
 */
export async function fetchGroups(userInfo) {
  let response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/groups`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
  });
  return response.data.data;
}

/**
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} userInfo
 * @param {Record<string, string>} params
 */
export async function fetchAllocationsApiClassname(userInfo, params = {}) {
  const apiQueryDefaults = { apiType: "api_classname" };
  let response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/allocation`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
    params: { ...apiQueryDefaults, ...params },
  });
  return response.data.data;
}

/**
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} userInfo
 * @param {string} apiType
 */
export async function fetchInstrumentForms(userInfo, apiType= "api_classname") {
  let response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/internal/instrument_forms`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
    params: {
      apiType: apiType
    }
  });
  return response.data.data;
}
