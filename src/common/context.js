import { createContext } from "react";

export const UserContext = createContext({
  /** @type {import("../onboarding/auth").UserInfo} */
  userInfo: { instance: { name: "", url: "" }, token: "" },
  /** @type {React.Dispatch<import("../onboarding/auth").UserInfo>} */
  updateUserInfo: (userInfo) => {},
});

export const AppContext = createContext({
  /** @type {import("./util").DarkMode} */
  darkMode: "auto",
  /** @type {React.Dispatch<import("./util").DarkMode>} */
  updateDarkMode: (newDarkMode) => {},
});
