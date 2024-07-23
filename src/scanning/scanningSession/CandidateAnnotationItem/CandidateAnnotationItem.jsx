import "./CandidateAnnotationItem.scss";
import {
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  useIonToast,
} from "@ionic/react";
import { Clipboard } from "@capacitor/clipboard";
import { useCallback } from "react";

/**
 * @param {Object} props
 * @param {import("../../scanningLib.js").CandidateAnnotation} props.annotation
 * @returns {JSX.Element}
 */
export const CandidateAnnotationItem = ({ annotation }) => {
  const [present] = useIonToast();
  const handleTextCopied = useCallback(
    async (
      /** @type {string} */ key,
      /** @type {string|number|undefined} */ value,
    ) => {
      await Clipboard.write({
        string: `${key}: ${value}`,
      });
      await present({
        message: "Text copied to clipboard!",
        duration: 2000,
      });
    },
    [present],
  );

  return (
    <div className="candidate-annotation-item">
      <IonList lines="full">
        <IonListHeader>
          <h6>
            <IonLabel>{annotation.origin}</IonLabel>
          </h6>
        </IonListHeader>
        {Object.entries(annotation.data)
          .slice(0, 3)
          .map(([key, value]) => (
            <IonItem
              key={key}
              onClick={() => handleTextCopied(key, value)}
              button
            >
              {key}: {value}
            </IonItem>
          ))}
      </IonList>
    </div>
  );
};
