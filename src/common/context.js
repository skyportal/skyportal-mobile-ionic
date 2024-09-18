import { createContext } from "react";

/** @type {React.Context<import("../onboarding/auth").UserInfo>} */
// @ts-ignore
export const UserContext = createContext({
  instance: { name: "", url: "" },
  token: "",
});

export const AppContext = createContext({
  darkMode: "auto",
  /** @type {React.Dispatch<import("./util").DarkMode>} */
  updateDarkMode: (newDarkMode) => {},
});
