import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { PREFERENCES, QUERY_KEYS } from "./constants.js";
import {
  fetchGroups,
  fetchSourcePhotometry,
  searchCandidates,
} from "../scanning/scanning.js";
import { fetchSources } from "../sources/sources.js";
import { getPreference, setPreference } from "./preferences.js";
import config from "../config.js";
import { checkTokenAndFetchUser } from "../onboarding/auth.js";
import { useState } from "react";

/**
 * @typedef {"success" | "error" | "pending"} QueryStatus
 */

/**
 * @template T
 * Custom hook to get a preference from the preferences
 * @param {string} key
 * @returns {{data:T|undefined, status: QueryStatus, error: any|undefined}}
 */
const usePreference = (key) => {
  return useSuspenseQuery({
    queryKey: [key],
    queryFn: () => getPreference({ key }),
  });
};

/**
 * Custom hook to get the user from the preferences
 * @returns {{user: import("../onboarding/auth.js").User|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useUser = () => {
  const res = usePreference(PREFERENCES.USER);
  return {
    user: res.data,
    status: res.status,
    error: res.error,
  };
};

/**
 * Custom hook to get the user info from the preferences
 * @returns {{userInfo: import("../onboarding/auth.js").UserInfo|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useUserInfo = () => {
  const res = usePreference(PREFERENCES.USER_INFO);
  return {
    userInfo: res.data,
    status: res.status,
    error: res.error,
  };
};

/**
 * @param {Object} props
 * @param {string} props.startDate
 * @param {string|null} [props.endDate=null]
 * @param {import("../common/constants").SavedStatus} props.savedStatus
 * @param {string} props.groupIDs
 * @returns {{candidates: import("../scanning/scanning.js").Candidate[]|undefined, status: QueryStatus, error: any}}
 */
export const useSearchCandidates = ({
  startDate,
  endDate = null,
  savedStatus,
  groupIDs,
}) => {
  const { userInfo } = useUserInfo();
  const {
    /** @type {import("../scanning/scanning.js").Candidate[]} */ data: candidates,
    status,
    error,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.CANDIDATES,
      startDate,
      endDate,
      savedStatus,
      groupIDs,
    ],
    queryFn: async () => {
      if (!startDate || !endDate || !savedStatus || !groupIDs) {
        throw new Error("Missing parameters");
      }
      return await searchCandidates({
        instanceUrl: userInfo?.instance.url ?? "",
        token: userInfo?.token ?? "",
        startDate,
        endDate,
        savedStatus,
        groupIDs,
      });
    },
    enabled: !!userInfo && !!startDate,
  });
  return {
    candidates,
    status,
    error,
  };
};

/**
 * @param {Object} props
 * @param {number} props.page
 * @param {number} props.numPerPage
 * @returns {{sources: import("../sources/sources.js").Source[]|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useFetchSources = ({ page, numPerPage }) => {
  const { userInfo } = useUserInfo();
  const {
    /** @type {import("../sources/sources.js").Source[]} */ data: sources,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.SOURCES, page, numPerPage],
    queryFn: () =>
      fetchSources({
        instanceUrl: userInfo?.instance.url ?? "",
        token: userInfo?.token ?? "",
        page,
        numPerPage,
      }),
    enabled: !!userInfo,
    // @ts-ignore
    suspense: true,
  });
  return {
    sources,
    status,
    error,
  };
};

/** @typedef {{user: null|import("../onboarding/auth.js").User, status: QueryStatus, error: any}} SkipOnboardingState */

export const useSkipOnboarding = () => {
  const [state, setState] =
    /** @type {ReturnType<typeof useState<SkipOnboardingState>>} */ useState({
      user: null,
      status: "pending",
      error: undefined,
    });
  const queryClient = useQueryClient();
  const appStarted = async () => {
    if (config.CLEAR_AUTH) {
      await setPreference({ key: PREFERENCES.USER_INFO, value: null });
      await setPreference({ key: PREFERENCES.USER, value: null });
    }
    let user = await getPreference({ key: PREFERENCES.USER });
    if (user) {
      return user;
    }
    if (!config.SKIP_ONBOARDING) {
      return null;
    }
    if (
      config.SKIP_ONBOARDING &&
      (!config.INSTANCE_URL || !config.INSTANCE_NAME || !config.TOKEN)
    ) {
      return null;
    }
    user = await checkTokenAndFetchUser({
      token: config.TOKEN,
      instanceUrl: config.INSTANCE_URL,
    });
    queryClient.setQueryData([QUERY_KEYS.USER], user);
    await setPreference({ key: PREFERENCES.USER, value: user });
    const userInfo = {
      token: config.TOKEN,
      instance: { url: config.INSTANCE_URL, name: config.INSTANCE_NAME },
    };
    queryClient.setQueryData([QUERY_KEYS.USER_INFO], userInfo);
    await setPreference({ key: PREFERENCES.USER_INFO, value: userInfo });
    setState({ user, status: "success", error: state.error });
  };
  return useQuery({
    // @ts-ignore
    suspense: true,
    queryKey: ["appStart"],
    queryFn: appStarted,
    enabled: true,
  });
};

/**
 * @returns {{userAccessibleGroups: import("../scanning/scanning.js").Group[]|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useUserAccessibleGroups = () => {
  const { userInfo } = useUserInfo();
  const {
    /** @type {import("../scanning/scanning.js").GroupsResponse} */ data: groups,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.GROUPS],
    queryFn: () =>
      fetchGroups({
        instanceUrl: userInfo?.instance.url ?? "",
        token: userInfo?.token ?? "",
      }),
    enabled: !!userInfo,
    // @ts-ignore
    suspense: true,
  });
  return {
    userAccessibleGroups: groups?.user_accessible_groups,
    status,
    error,
  };
};

/**
 * @returns {{[key: string]: any}}
 */
export const useQueryParams = () => {
  const params = new URLSearchParams(location.search);
  const paramsObject = {};
  for (const [key, value] of params) {
    // @ts-ignore
    paramsObject[key] = value;
  }
  return paramsObject;
};

/**
 * @param {Object} props
 * @param {string} props.sourceId
 * @returns {{photometry: import("../scanning/scanning.js").Photometry[]|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useSourcePhotometry = ({ sourceId }) => {
  const { userInfo } = useUserInfo();
  const {
    /** @type {import("../scanning/scanning.js").Photometry[]} */ data: photometry,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.SOURCE_PHOTOMETRY, sourceId],
    queryFn: () =>
      fetchSourcePhotometry({
        sourceId,
        instanceUrl: userInfo?.instance.url ?? "",
        token: userInfo?.token ?? "",
      }),
    enabled: !!userInfo,
  });
  return {
    photometry,
    status,
    error,
  };
};
