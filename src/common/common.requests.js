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
 * @property {boolean} assistantEnabled - Whether the instance has an assistant configured
 */

/**
 * @typedef {Object} AssistantMessage
 * @property {number} id - Message ID
 * @property {string} text - Message body
 * @property {boolean} system - Whether the assistant wrote it, the user otherwise
 * @property {string|null} channel - Conversation the message belongs to
 * @property {string} created_at - Created date
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

/**
 * Fetch the users of the instance, with just what is needed to name them
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} userInfo
 * @returns {Promise<import("./common.lib.js").SlimUser[]>}
 */
export async function fetchUsers(userInfo) {
  let response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/user`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
    params: { slim: "true" },
  });
  return response.data.data.users;
}

/**
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} userInfo
 * @returns {Promise<import("./common.lib.js").Instrument[]>}
 */
export async function fetchInstruments(userInfo) {
  let response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/instrument`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
  });
  return response.data.data;
}

/**
 * Fetch the names of the conversations the user holds with the assistant
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} userInfo
 * @returns {Promise<string[]>}
 */
export async function fetchAssistantConversations(userInfo) {
  const response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/assistant/conversations`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
  });
  return response.data.data;
}

/**
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} userInfo
 * @param {string} channel - Conversation to read
 * @returns {Promise<AssistantMessage[]>}
 */
export async function fetchAssistantMessages(userInfo, channel) {
  const response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/assistant/messages`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
    params: { channel },
  });
  return response.data.data;
}

/**
 * Ask the assistant something. The answer lands in the conversation out of band.
 * @param {Object} params
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} params.userInfo
 * @param {string} params.text
 * @param {string} params.channel - Conversation to ask in
 * @param {string} [params.contextType] - Kind of resource the user is looking at
 * @param {string} [params.contextId] - ID of the resource the user is looking at
 * @returns {Promise<any>}
 */
export async function postAssistantMessage({ userInfo, text, channel, contextType, contextId }) {
  return await CapacitorHttp.post({
    url: `${userInfo.instance.url}/api/assistant/messages`,
    headers: {
      Authorization: `token ${userInfo.token}`,
      "Content-Type": "application/json",
    },
    data: {
      text,
      channel,
      ...(contextType ? { context_type: contextType } : {}),
      ...(contextId ? { context_id: contextId } : {}),
    },
  });
}

/**
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} userInfo
 * @param {string} channel - Conversation to delete
 * @returns {Promise<any>}
 */
export async function deleteAssistantConversation(userInfo, channel) {
  return await CapacitorHttp.delete({
    url: `${userInfo.instance.url}/api/assistant/conversations`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
    params: { channel },
  });
}
