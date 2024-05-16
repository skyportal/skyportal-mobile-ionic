import { IonApp, IonButton, IonContent, setupIonicReact } from "@ionic/react";

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
import "./App.scss";

setupIonicReact();

const App = () => (
  <IonApp>
    <IonContent class="content">
      <div className="container">
        <div className="upper">
          <div className="logo-n-text">
            <img src="/images/logo.png" alt="logo" />
            <h1>SkyPortal</h1>
          </div>
          <div className="tagline">
            Welcome to SkyPortal Mobile.
            <br />
            An Astronomical Data Platform.
          </div>
        </div>
        <div className="lower">
          <IonButton shape="round">Log in</IonButton>
        </div>
      </div>
    </IonContent>
  </IonApp>
);

export default App;
