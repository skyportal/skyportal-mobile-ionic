import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import config from "../config.js";
import { fetchUserProfile } from "../onboarding/onboarding.lib.js";
import {
  deleteAssistantConversation,
  fetchAssistantConversations,
  fetchAssistantMessages,
  fetchConfig,
  fetchGroups,
  fetchAllocationsApiClassname,
  fetchInstrumentForms,
  fetchInstruments,
  fetchUsers,
  postAssistantMessage
} from "./common.requests.js";
import { useContext } from "react";
import { UserContext } from "./common.context.js";
import { clearPreference, getPreference, QUERY_KEYS, setPreference } from "./common.lib.js";
import { warningOutline } from "ionicons/icons";
import { useIonAlert, useIonToast } from "@ionic/react";

/**
 * @typedef {"success" | "error" | "pending"} QueryStatus
 */

/**
 * @typedef {Object} AppPreferences
 * @property {"auto"|"light"|"dark"} darkMode
 */

/**
 * Custom hook to show error toast with optional infinite duration.
 * @returns {(message: string, isInfinite?: boolean) => void}
 */
export const useErrorToast = () => {
  const [presentToast] = useIonToast();
  /**
   * Display an error toast message
   * @param {string} message - The error message to display.
   * @param {boolean} [isInfinite=false] - Whether the toast should stay until manually dismissed.
   */
  return (message, isInfinite = false) => {
    presentToast({
      message,
      position: "top",
      color: "danger",
      icon: warningOutline,
      duration: isInfinite ? 0 : 2000,
      buttons: isInfinite
        ? [
          {
            text: "Close",
            role: "cancel",
          },
        ]
        : undefined,
    }).then();
  };
};

/**
 * Custom hook to show a confirmation alert
 * @returns {(message: string) => Promise<boolean>}
 */
export const useConfirmAlert = () => {
  const [presentAlert] = useIonAlert();

  /**
   * Prompt a confirmation alert
   * @param {string} message - The message to display in the alert.
   * @return {Promise<boolean>} - Resolves to true if confirmed, false if cancelled.
   */
  return (message) => new Promise((resolve) => {
    presentAlert({
      header: "Are you sure?",
      message: message,
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: () => resolve(false),
        },
        {
          text: "Confirm",
          role: "destructive",
          handler: () => resolve(true),
        },
      ],
    });
  });
};

/**
 * @returns {{data: {userInfo: import("../onboarding/onboarding.lib.js").UserInfo|null, userProfile: import("../onboarding/onboarding.lib.js").UserProfile|null}, status: QueryStatus, error: any|undefined}}
 */
export const useAppStart = () => {
  const queryClient = useQueryClient();

  const appStarted = async () => {
    // Clear saved credentials if needed
    if (config.CLEAR_AUTH) {
      await clearPreference(QUERY_KEYS.USER_INFO);
    }

    // Try getting user info from preferences
    let userInfo = await getPreference(QUERY_KEYS.USER_INFO);
    // If user info is found, fetch user profile and login
    if (userInfo) {
      try {
        const userProfile = await fetchUserProfile(userInfo);
        return { userInfo, userProfile };
      } catch (error) {
        // If an error occurs, clear the user info and go to onboarding
        await clearPreference(QUERY_KEYS.USER_INFO);
        return { userInfo: null, userProfile: null };
      }
    }

    // If no user info is found and onboarding is not skipped, go to onboarding
    if (!config.SKIP_ONBOARDING) {
      return { userInfo: null, userProfile: null };
    }
    // If onboarding is skipped, but some credentials are missing, go to onboarding anyway
    if (
      config.SKIP_ONBOARDING &&
      (!config.INSTANCE_URL || !config.INSTANCE_NAME || !config.TOKEN)
    ) {
      return { userInfo: null, userProfile: null };
    }

    // If onboarding is skipped and all credentials are present, fetch user profile and login
    userInfo = {
      token: config.TOKEN,
      instance: { url: config.INSTANCE_URL, name: config.INSTANCE_NAME },
    };
    try {
      let userProfile = await fetchUserProfile(userInfo);
      // Persist user info
      queryClient.setQueryData([QUERY_KEYS.USER_INFO], userInfo);
      await setPreference(QUERY_KEYS.USER_INFO, userInfo);
      return { userInfo, userProfile };
    } catch (error) {
      // If an error occurs, clear the user info and go to onboarding
      await setPreference(QUERY_KEYS.USER_INFO, null);
      return { userInfo: null, userProfile: null };
    }
  };
  return useQuery({
    // @ts-ignore
    suspense: true,
    queryKey: [QUERY_KEYS.APP_START],
    queryFn: appStarted,
  });
};

/**
 * @returns {{userAccessibleGroups: import("../scanning/scanning.lib.js").Group[]|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useUserAccessibleGroups = () => {
  const { userInfo } = useContext(UserContext);
  const {
    /** @type {import("../scanning/scanning.lib.js").GroupsResponse} */ data: groups,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.GROUPS],
    queryFn: () => fetchGroups(userInfo),
  });
  return {
    userAccessibleGroups: groups?.user_accessible_groups,
    status,
    error,
  };
};

/**
 * @returns {{config: import("./common.requests.js").SkyPortalConfig|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useInstanceConfig = () => {
  const { userInfo } = useContext(UserContext);
  const { data, status, error } = useQuery({
    queryKey: [QUERY_KEYS.CONFIG],
    queryFn: () => fetchConfig(userInfo),
  });
  return {
    config: data,
    status,
    error,
  };
};

/**
 *
 * @returns {{bandpassesColors: import("./common.requests.js").BandpassesColors|undefined,status: QueryStatus, error: any|undefined}}
 */
export const useBandpassesColors = () => {
  const { config, status, error } = useInstanceConfig();
  return {
    bandpassesColors: config?.bandpassesColors,
    status,
    error,
  };
};

/**
 * @returns {{userProfile: import("../onboarding/onboarding.lib.js").UserProfile|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useUserProfile = () => {
  const { userInfo } = useContext(UserContext);
  const { data, status, error } = useQuery({
    queryKey: [QUERY_KEYS.USER_PROFILE],
    queryFn: () => fetchUserProfile(userInfo),
  });
  return {
    userProfile: data,
    status,
    error,
  };
};

/**
 * @returns {{allocationsApiClassname: import("./common.lib.js").AllocationApiClassname[]|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useAllocationsApiClassname = () => {
  const { userInfo } = useContext(UserContext);
  const { data, status, error } = useQuery({
    queryKey: [QUERY_KEYS.ALLOCATIONS_API_CLASSNAME],
    queryFn: () => fetchAllocationsApiClassname(userInfo),
  });
  return {
    allocationsApiClassname: data,
    status,
    error,
  };
}

export const useInstrumentForms = () => {
  const { userInfo } = useContext(UserContext);
  const { data, status, error } = useQuery({
    queryKey: [QUERY_KEYS.INSTRUMENT_FORMS],
    queryFn: () => fetchInstrumentForms(userInfo),
  });
  return {
    instrumentForms: data,
    status,
    error,
  };
}

/**
 * @returns {{users: import("./common.lib.js").SlimUser[]|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useUsers = () => {
  const { userInfo } = useContext(UserContext);
  const { data, status, error } = useQuery({
    queryKey: [QUERY_KEYS.USERS],
    queryFn: () => fetchUsers(userInfo),
  });
  return {
    users: data,
    status,
    error,
  };
}

/**
 * @returns {{instruments: import("./common.lib.js").Instrument[]|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useInstruments = () => {
  const { userInfo } = useContext(UserContext);
  const { data, status, error } = useQuery({
    queryKey: [QUERY_KEYS.INSTRUMENTS],
    queryFn: () => fetchInstruments(userInfo),
  });
  return {
    instruments: data,
    status,
    error,
  };
}

/**
 * @param {boolean} [enableFetch=true] - If false, the query will not be executed
 * @returns {{conversations: string[]|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useAssistantConversations = (enableFetch = true) => {
  const { userInfo } = useContext(UserContext);
  const { data, status, error } = useQuery({
    queryKey: [QUERY_KEYS.ASSISTANT_CONVERSATIONS],
    queryFn: () => fetchAssistantConversations(userInfo),
    enabled: enableFetch,
  });
  return {
    conversations: data,
    status,
    error,
  };
}

/**
 * @param {string} channel - Conversation to read
 * @param {boolean} [enableFetch=true] - If false, the query will not be executed
 * @returns {{messages: import("./common.requests.js").AssistantMessage[]|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useAssistantMessages = (channel, enableFetch = true) => {
  const { userInfo } = useContext(UserContext);
  const { data, status, error } = useQuery({
    queryKey: [QUERY_KEYS.ASSISTANT_MESSAGES, channel],
    queryFn: () => fetchAssistantMessages(userInfo, channel),
    enabled: enableFetch && !!channel,
    // The answer is written back out of band and no socket announces it here.
    refetchInterval: ({ state }) =>
      state.data?.length && !state.data[state.data.length - 1].system ? 2000 : false,
  });
  return {
    messages: data,
    status,
    error,
  };
}

export const useAskAssistant = () => {
  const { userInfo } = useContext(UserContext);
  const queryClient = useQueryClient();
  const errorToast = useErrorToast();
  return useMutation({
    /**
     * @param {Object} params
     * @param {string} params.text
     * @param {string} params.channel
     * @param {string} [params.contextType]
     * @param {string} [params.contextId]
     * @returns {Promise<*>}
     */
    mutationFn: (params) => postAssistantMessage({ userInfo, ...params }),
    onSuccess: (response, { channel }) => {
      if (response.status !== 200) {
        errorToast(response.data?.message || "The assistant is not responding right now");
        return;
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSISTANT_MESSAGES, channel] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSISTANT_CONVERSATIONS] });
    },
    onError: () => errorToast("The assistant is not responding right now"),
  });
}

export const useDeleteAssistantConversation = () => {
  const { userInfo } = useContext(UserContext);
  const queryClient = useQueryClient();
  const errorToast = useErrorToast();
  return useMutation({
    /** @param {string} channel */
    mutationFn: (channel) => deleteAssistantConversation(userInfo, channel),
    onSuccess: (response) => {
      if (response.status !== 200) {
        errorToast(response.data?.message || "Failed to delete the conversation");
        return;
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSISTANT_CONVERSATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSISTANT_MESSAGES] });
    },
    onError: () => errorToast("Failed to delete the conversation"),
  });
}
