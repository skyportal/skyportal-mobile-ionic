import "./ScanningToolbar.scss";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  useIonPopover,
} from "@ionic/react";
import {
  bookmarkOutline,
  ellipsisHorizontal,
  ellipsisHorizontalOutline,
  exitOutline,
  locateOutline,
  planetOutline,
  telescopeOutline,
  trashBinOutline,
} from "ionicons/icons";
import { SCANNING_TOOLBAR_ACTION } from "../../scanningLib.js";
import { useState } from "react";

/**
 * @param {Object} props
 * @param {(action: import("../../scanningLib").ScanningToolbarAction) => void} props.onAction
 * @returns {JSX.Element}
 */
export const ScanningToolbar = ({ onAction }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [present, dismiss] = useIonPopover(
    <IonContent>
      <IonList>
        <IonItem
          detail={false}
          onClick={() => onAction(SCANNING_TOOLBAR_ACTION.EXIT)}
          button
        >
          <IonIcon
            color="danger"
            slot="start"
            icon={exitOutline}
            size="small"
          />
          <IonLabel color="danger">Exit</IonLabel>
        </IonItem>
        <IonItem detail={false} button>
          <IonIcon slot="start" icon={trashBinOutline} size="small" />
          <IonLabel>Discard</IonLabel>
        </IonItem>
      </IonList>
    </IonContent>,
    {
      onDismiss: (/** @type {any} */ data, /** @type {string} */ role) =>
        dismiss(data, role),
    },
  );

  return (
    <>
      <div className="scanning-toolbar">
        <IonButton
          fill="clear"
          color="secondary"
          onClick={(e) =>
            present({
              // @ts-ignore
              event: e,
              onWillDismiss: () => setIsMenuOpen(false),
              dismissOnSelect: true,
            })
          }
        >
          <IonIcon
            slot="icon-only"
            icon={isMenuOpen ? ellipsisHorizontal : ellipsisHorizontalOutline}
          />
        </IonButton>

        <IonButton
          fill="clear"
          color="secondary"
          onClick={() =>
            onAction(SCANNING_TOOLBAR_ACTION.REQUEST_OBSERVING_RUN)
          }
        >
          <IonIcon slot="icon-only" icon={telescopeOutline} />
        </IonButton>
        <IonButton
          fill="clear"
          color="secondary"
          onClick={() => onAction(SCANNING_TOOLBAR_ACTION.ADD_REDSHIFT)}
        >
          <IonIcon slot="icon-only" icon={locateOutline} />
        </IonButton>
        <IonButton fill="clear" color="secondary">
          <IonIcon
            slot="icon-only"
            icon={planetOutline}
            onClick={() => onAction(SCANNING_TOOLBAR_ACTION.SHOW_SURVEYS)}
          />
        </IonButton>
        <IonButton fill="clear" color="success">
          <IonIcon
            slot="icon-only"
            icon={bookmarkOutline}
            onClick={() => onAction(SCANNING_TOOLBAR_ACTION.SAVE)}
          />
        </IonButton>
      </div>
    </>
  );
};
