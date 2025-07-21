import {
  IonApp,
  IonIcon,
  IonLabel,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */
import "@ionic/react/css/palettes/dark.class.css";
/* Theme variables */
import "./global.scss";
import "./theme/variables.scss";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router";
import OnboardingScreen from "./onboarding/screens/OnboardingScreen/OnboardingScreen.jsx";
import React, { useEffect, useState } from "react";
import { LoginOkScreen } from "./onboarding/screens/LoginOkScreen/LoginOkScreen.jsx";
import { useAppStart } from "./common/common.hooks.js";
import { ScanningOptionsScreen } from "./scanning/scanningOptions/screens/ScanningOptionsScreen/ScanningOptionsScreen.jsx";
import { CandidateListScreen } from "./scanning/scanningSession/screens/CandidateListScreen/CandidateListScreen.jsx";
import { SourceListTab } from "./sources/screens/SourceListTab/SourceListTab.jsx";
import {
  compassOutline,
  listOutline,
  personCircleOutline,
} from "ionicons/icons";
import { ScanningRecapScreen } from "./scanning/scanningSession/screens/ScanningRecapScreen/ScanningRecapScreen.jsx";
import { AppContext, UserContext } from "./common/common.context.js";
import { ScanningHomeTab } from "./scanning/scanningOptions/screens/ScanningHomeTab/ScanningHomeTab.jsx";
import { ScanningNewProfileScreen } from "./scanning/scanningOptions/screens/ScanningNewProfileScreen/ScanningNewProfileScreen.jsx";
import { ScanningProfilesScreen } from "./scanning/scanningOptions/screens/ScanningProfilesScreen/ScanningProfilesScreen.jsx";
import { UserProfileTab } from "./userProfile/screens/UserProfileScreen/UserProfileTab.jsx";
import { setDarkModeInDocument } from "./common/common.lib.js";
import { Source } from "./sources/screens/Source/Source";
import { SafeArea } from "capacitor-plugin-safe-area";

setupIonicReact();

// Set CSS variables for the safe area insets using the SafeArea plugin
// to fix capacitor safe area issues on android
SafeArea.getSafeAreaInsets().then((data) => {
  const { insets } = data;
  document.body.style.setProperty("--ion-safe-area-top", `${insets.top}px`);
  document.body.style.setProperty(
    "--ion-safe-area-right",
    `${insets.right}px`
  );
  document.body.style.setProperty(
    "--ion-safe-area-bottom",
    `${insets.bottom}px`
  );
  document.body.style.setProperty(
    "--ion-safe-area-left",
    `${insets.left}px`
  );
});

/**
 * @param {Object} props
 * @param {import("./common/common.lib.js").DarkMode} props.darkMode
 * @returns {React.JSX.Element}
 */
const App = ({ darkMode: initialDarkMode }) => {
  const { data } = useAppStart();
  /** @type {[import("./common/common.lib.js").DarkMode, React.Dispatch<import("./common/common.lib.js").DarkMode>]} */
  const [darkMode, setDarkMode] = useState(initialDarkMode);
  const [userInfo, setUserInfo] = useState({
    instance: { name: "", url: "" },
    token: "",
  });

  useEffect(() => {
    if (data?.userInfo) {
      setUserInfo(data.userInfo);
    }
  }, [data]);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    /**
     * @param {MediaQueryListEvent} mediaQuery
     */
    const setDarkPaletteFromMediaQuery = (mediaQuery) => {
      setDarkModeInDocument(darkMode, mediaQuery.matches);
    };
    prefersDark.addEventListener("change", setDarkPaletteFromMediaQuery);
    return () => {
      prefersDark.removeEventListener("change", setDarkPaletteFromMediaQuery);
    };
  }, [darkMode]);

  /**
   * @param {React.PropsWithChildren<import("react-router").RouteProps>} props
   * @returns {JSX.Element}
   */
  const PrivateRoute = ({ children, ...rest }) => {
    /* If the user is not logged in, redirect to the onboarding screen */
    return(
      <Route {...rest}>
        {userInfo.token === "" ? <Redirect to="/onboarding" /> : children}
      </Route>
    )
  }

  return (
    <AppContext.Provider
      value={{ darkMode: darkMode ?? "auto", updateDarkMode: setDarkMode }}
    >
      <UserContext.Provider value={{ userInfo, updateUserInfo: setUserInfo }}>
        <IonApp>
          <IonReactRouter>
            <IonRouterOutlet>
              <Route path="/onboarding" render={() =>
                userInfo.token === "" ? <OnboardingScreen /> : <Redirect to="/app" />
              } />
              <Redirect exact from="/" to="/onboarding" />

              {/* Login success route */}
              <Route path="/login-ok" component={LoginOkScreen} />

              {/* Scanning routes */}
              <PrivateRoute path="/scanning">
                <IonPage>
                  <IonRouterOutlet>
                    <Route path="/scanning/profiles" component={ScanningProfilesScreen} />
                    <Route path="/scanning/new-profile" component={ScanningNewProfileScreen} />
                    <Route path="/scanning/options" component={ScanningOptionsScreen} />
                    <Route path="/scanning/result" component={CandidateListScreen} />
                    <Route path="/scanning/recap" component={ScanningRecapScreen} />
                    <Route exact path="/scanning" component={ScanningOptionsScreen} />
                  </IonRouterOutlet>
                </IonPage>
              </PrivateRoute>

              {/* Source details route */}
              <PrivateRoute path="/source">
                <Route path="/source/:sourceId" component={Source} />
              </PrivateRoute>

              {/* Main app route, containing the tabs */}
              <PrivateRoute path="/app">
                <IonTabs>
                  <IonRouterOutlet>
                    <Redirect exact from="/app" to="/app/source-list" />
                    <Route path="/app/source-list" component={SourceListTab} />
                    <Route path="/app/scanning" component={ScanningHomeTab} />
                    <Route path="/app/profile" component={UserProfileTab} />
                  </IonRouterOutlet>

                  <IonTabBar slot="bottom">
                    <IonTabButton tab="source-list" href="/app/source-list">
                      <IonIcon icon={listOutline} />
                      <IonLabel>Source</IonLabel>
                    </IonTabButton>

                    <IonTabButton tab="scanning" href="/app/scanning">
                      <IonIcon icon={compassOutline} />
                      <IonLabel>Candidates</IonLabel>
                    </IonTabButton>

                    <IonTabButton tab="profile" href="/app/profile">
                      <IonIcon icon={personCircleOutline} />
                      <IonLabel>Profile</IonLabel>
                    </IonTabButton>
                  </IonTabBar>
                </IonTabs>
              </PrivateRoute>
            </IonRouterOutlet>
          </IonReactRouter>
        </IonApp>
      </UserContext.Provider>
    </AppContext.Provider>
  );
};

export default App;
