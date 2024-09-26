import { createContext } from "react";

export const UserContext = createContext({
  /** @type {import("../onboarding/common.onboarding.js").UserInfo} */
  userInfo: { instance: { name: "", url: "" }, token: "" },
  /** @type {React.Dispatch<import("../onboarding/common.onboarding.js").UserInfo>} */
  updateUserInfo: (userInfo) => {},
});

export const AppContext = createContext({
  /** @type {import("./common.lib.js").DarkMode} */
  darkMode: "auto",
  /** @type {React.Dispatch<import("./common.lib.js").DarkMode>} */
  updateDarkMode: (newDarkMode) => {},
});
