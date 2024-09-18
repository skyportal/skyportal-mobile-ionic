import {
  IonApp,
  IonIcon,
  IonLabel,
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
/* import '@ionic/react/css/palettes/dark.always.css'; */
import "@ionic/react/css/palettes/dark.class.css";
// import "@ionic/react/css/palettes/dark.system.css";
/* Theme variables */
import "./theme/variables.scss";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router";
import OnboardingScreen from "./onboarding/OnboardingScreen/OnboardingScreen.jsx";
import React, { useEffect, useState } from "react";
import CheckQRCodeScreen from "./onboarding/CheckQRCodeScreen/CheckQRCodeScreen.jsx";
import { LoginOkScreen } from "./onboarding/LoginOk/LoginOkScreen.jsx";
import { useAppStart } from "./common/hooks.js";
import { ScanningOptionsScreen } from "./scanning/scanningOptions/ScanningOptionsScreen/ScanningOptionsScreen.jsx";
import { MainScanningScreen } from "./scanning/scanningSession/MainScanningScreen/MainScanningScreen.jsx";
import { SourceListScreen } from "./sources/SourceListScreen/SourceListScreen.jsx";
import {
  compassOutline,
  listOutline,
  personCircleOutline,
} from "ionicons/icons";
import { ScanningRecap } from "./scanning/scanningSession/ScanningRecap/ScanningRecap.jsx";
import { AppContext, UserContext } from "./common/context.js";
import { ScanningHome } from "./scanning/scanningOptions/ScanningHome/ScanningHome.jsx";
import { ScanningNewProfileScreen } from "./scanning/scanningOptions/ScanningNewProfileScreen/ScanningNewProfileScreen.jsx";
import { ScanningProfiles } from "./scanning/scanningOptions/ScanningProfiles/ScanningProfiles.jsx";
import { UserProfileScreen } from "./userProfile/UserProfileScreen/UserProfileScreen.jsx";
import { setDarkModeInDocument } from "./common/util.js";

setupIonicReact();

/**
 * @param {Object} props
 * @param {import("./common/util").DarkMode} props.darkMode
 * @returns {React.JSX.Element}
 */
const App = ({ darkMode: initialDarkMode }) => {
  const { data } = useAppStart();
  /** @type {[import("./common/util").DarkMode, React.Dispatch<import("./common/util").DarkMode>]} */
  const [darkMode, setDarkMode] = useState(initialDarkMode);

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

  return (
    <AppContext.Provider
      value={{ darkMode: darkMode ?? "auto", updateDarkMode: setDarkMode }}
    >
      <UserContext.Provider
        value={
          data.userInfo ?? {
            instance: { name: "", url: "" },
            token: "",
          }
        }
      >
        <IonApp>
          <IonReactRouter>
            <IonRouterOutlet>
              <Route exact path="/onboarding">
                {
                  /* If the user is logged in, redirect them to the app */
                  data.userInfo !== null ? (
                    <Redirect to="/app" />
                  ) : (
                    <OnboardingScreen />
                  )
                }
              </Route>
              <Route path="/check-creds">
                <CheckQRCodeScreen />
              </Route>
              <Route path="/login-ok">
                <LoginOkScreen />
              </Route>

              <Route path="/app">
                {data.userInfo === null ? (
                  <Redirect to="/onboarding" />
                ) : (
                  <>
                    <Route path="/scanning/profiles">
                      <ScanningProfiles />
                    </Route>
                    <Route path="/scanning/new-profile">
                      <ScanningNewProfileScreen />
                    </Route>
                    <Route path="/scanning/options">
                      <ScanningOptionsScreen />
                    </Route>
                    <Route path="/scanning/main">
                      <MainScanningScreen />
                    </Route>
                    <Route path="/scanning/recap">
                      <ScanningRecap />
                    </Route>
                    <Route exact path="/scanning">
                      <ScanningOptionsScreen />
                    </Route>
                  </>
                )}
              </Route>

              <Route exact path="/">
                <Redirect to="/onboarding" />
              </Route>

              <Route path="/app">
                {data.userInfo === null ? (
                  <Redirect to="/onboarding" />
                ) : (
                  <IonTabs>
                    <IonRouterOutlet>
                      <Redirect exact path="/app" to="/app/source-list" />
                      <Route path="/app/source-list">
                        <SourceListScreen />
                      </Route>
                      <Route path="/app/scanning">
                        <ScanningHome />
                      </Route>
                      <Route path="/app/profile">
                        <UserProfileScreen />
                      </Route>
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
                )}
              </Route>
            </IonRouterOutlet>
          </IonReactRouter>
        </IonApp>
      </UserContext.Provider>
    </AppContext.Provider>
  );
};

export default App;
