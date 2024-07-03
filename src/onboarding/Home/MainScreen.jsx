import "./MainScreen.scss";
import { IonReactRouter } from "@ionic/react-router";
import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { Redirect, Route } from "react-router";
import { SourceListScreen } from "../../sources/SourceList/SourceListScreen.jsx";
import { EventListScreen } from "../../events/EventList/EventListScreen.jsx";
import { compassOutline, list, radioOutline } from "ionicons/icons";
import { ScanningOptionsScreen } from "../../scanning/scanningOptions/ScanningOptionsScreen/ScanningOptionsScreen.jsx";
import { MainScanningScreen } from "../../scanning/scanningSession/MainScanningScreen/MainScanningScreen.jsx";

export const MainScreen = () => {
  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Redirect exact path="/app" to="/app/source-list" />
          <Route path="/app/source-list">
            <SourceListScreen />
          </Route>
          <Route exact path="/app/scanning">
            <ScanningOptionsScreen />
          </Route>
          <Route path="/app/event-list">
            <EventListScreen />
          </Route>
          <Route path="/app/scanning/options">
            <ScanningOptionsScreen />
          </Route>
          <Route path="/app/scanning/main">
            <MainScanningScreen />
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
    </IonReactRouter>
  );
};
