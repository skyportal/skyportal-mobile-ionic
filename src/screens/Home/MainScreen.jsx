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
import { SourceListScreen } from "../SourceList/SourceListScreen.jsx";
import { CandidateListScreen } from "../CandidateList/CandidateListScreen.jsx";
import { EventListScreen } from "../EventList/EventListScreen.jsx";
import { compassOutline, list, radioOutline } from "ionicons/icons";

export const MainScreen = () => {
  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Redirect exact path="/app" to="/app/source-list" />
          <Route path="/app/source-list">
            <SourceListScreen />
          </Route>
          <Route path="/app/candidate-list">
            <CandidateListScreen />
          </Route>
          <Route path="/app/event-list">
            <EventListScreen />
          </Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="source-list" href="/app/source-list">
            <IonIcon icon={list} />
            <IonLabel>Source</IonLabel>
          </IonTabButton>

          <IonTabButton tab="candidate-list" href="/app/candidate-list">
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
