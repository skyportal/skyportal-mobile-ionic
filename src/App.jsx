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
/* import '@ionic/react/css/palettes/dark.class.css'; */
// import '@ionic/react/css/palettes/dark.system.css';
/* Theme variables */
import "./theme/variables.scss";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router";
import OnboardingScreen from "./onboarding/OnboardingScreen/OnboardingScreen.jsx";
import React from "react";
import CheckQRCodeScreen from "./onboarding/CheckQRCodeScreen/CheckQRCodeScreen.jsx";
import { LoginOkScreen } from "./onboarding/LoginOk/LoginOkScreen.jsx";
import { useAppStart } from "./common/hooks.js";
import { ScanningOptionsScreen } from "./scanning/scanningOptions/ScanningOptionsScreen/ScanningOptionsScreen.jsx";
import { MainScanningScreen } from "./scanning/scanningSession/MainScanningScreen/MainScanningScreen.jsx";
import { SourceListScreen } from "./sources/SourceListScreen/SourceListScreen.jsx";
import { EventListScreen } from "./events/EventList/EventListScreen.jsx";
import { compassOutline, list, radioOutline } from "ionicons/icons";
import { ScanningHome } from "./scanning/ScanningHome/ScanningHome.jsx";

setupIonicReact();

const App = () => {
  const { data: user } = useAppStart();
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/onboarding">
            {
              /* If the user is logged in, redirect them to the app */
              user !== null ? <Redirect to="/app" /> : <OnboardingScreen />
            }
          </Route>
          <Route path="/check-creds">
            <CheckQRCodeScreen />
          </Route>
          <Route path="/login-ok">
            <LoginOkScreen />
          </Route>

          <Route path="/scanning/options">
            <ScanningOptionsScreen />
          </Route>
          <Route path="/scanning/main">
            <MainScanningScreen />
          </Route>
          <Route exact path="/scanning">
            <ScanningOptionsScreen />
          </Route>
          <Route exact path="/">
            <Redirect to="/onboarding" />
          </Route>

          <Route path="/app">
            <IonTabs>
              <IonRouterOutlet>
                <Redirect exact path="/app" to="/app/source-list" />
                <Route path="/app/source-list">
                  <SourceListScreen />
                </Route>
                <Route path="/app/event-list">
                  <EventListScreen />
                </Route>
                <Route path="/app/scanning">
                  <ScanningHome />
                </Route>
              </IonRouterOutlet>

              <IonTabBar slot="bottom">
                <IonTabButton tab="source-list" href="/app/source-list">
                  <IonIcon icon={list} />
                  <IonLabel>Source</IonLabel>
                </IonTabButton>

                <IonTabButton tab="scanning" href="/app/scanning">
                  <IonIcon icon={compassOutline} />
                  <IonLabel>Candidates</IonLabel>
                </IonTabButton>

                <IonTabButton tab="event-list" href="/app/event-list">
                  <IonIcon icon={radioOutline} />
                  <IonLabel>Events</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
