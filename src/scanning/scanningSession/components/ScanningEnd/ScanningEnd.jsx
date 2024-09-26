import "./ScanningEnd.scss";
import { IonButton } from "@ionic/react";
import { useHistory } from "react-router";

/**
 * @param {Object} props
 * @param {React.MutableRefObject<import("../../../scanning.lib.js").ScanningRecap>} props.recap
 * @returns {JSX.Element}
 */
export const ScanningEnd = ({ recap }) => {
  const history = useHistory();
  const handleButtonClick = () => {
    history.replace("/scanning/recap", { recap: recap.current });
  };
  return (
    <div className="scanning-end">
      <h3 className="hint">You reached the end of the candidate list!</h3>

      <IonButton expand="block" shape="round" onClick={handleButtonClick}>
        Show recap
      </IonButton>
    </div>
  );
};
