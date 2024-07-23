import { IonButton, IonIcon, IonSelect, IonSelectOption } from "@ionic/react";
import "./OnboardingLower.scss";
import { INSTANCES, QUERY_PARAMS } from "../../common/constants.js";
import { useState } from "react";
import { qrCode } from "ionicons/icons";
import { CapacitorBarcodeScanner } from "@capacitor/barcode-scanner";
import { Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useHistory } from "react-router";
import { navigateWithParams } from "../../common/util.js";

/**
 * The lower part of the onboarding screen
 * @param {Object} props
 * @param {string} props.page - The current page of the onboarding screen
 * @param {Function} props.setPage - The function to set the current page of the onboarding screen
 * @returns {JSX.Element}
 */
const OnboardingLower = ({ page, setPage }) => {
  const history = useHistory();
  const [instance, setInstance] = useState(null);
  let token = "test";
  async function handleScanQRCode() {
    try {
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: Html5QrcodeSupportedFormats.QR_CODE,
      });
      token = result.ScanResult;
    } catch (error) {
      console.error(error);
    }
    navigateWithParams(history, "/check-creds", {
      params: {
        [QUERY_PARAMS.TOKEN]: token,
        [QUERY_PARAMS.INSTANCE]: JSON.stringify(instance),
      },
      replace: true,
    });
  }

  if (page === "welcome")
    return (
      <div className="lower">
        <IonButton
          shape="round"
          size="large"
          onClick={() => setPage("login")}
          strong
        >
          Log in
        </IonButton>
      </div>
    );
  else
    return (
      <div className="lower">
        <div className="instance-container">
          <IonSelect
            class="select"
            label={"Instance"}
            placeholder="Select an instance"
            onIonChange={(e) => setInstance(e.detail.value)}
          >
            {INSTANCES.map((instance) => (
              <IonSelectOption key={instance.name} value={instance}>
                {instance.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </div>
        <div className="login-methods">
          <IonButton
            onClick={() => handleScanQRCode()}
            shape="round"
            disabled={instance === null}
            strong
          >
            <IonIcon slot="start" icon={qrCode}></IonIcon>
            Scan QR code
          </IonButton>
          <IonButton shape="round" disabled={instance === null} strong>
            Log in with token
          </IonButton>
        </div>
      </div>
    );
};

export default OnboardingLower;
