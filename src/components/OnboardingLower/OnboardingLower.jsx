import { IonButton, IonIcon, IonSelect, IonSelectOption } from "@ionic/react";
import "./OnboardingLower.scss";
import { INSTANCES } from "../../lib/constants.js";
import { useContext } from "react";
import { qrCode } from "ionicons/icons";
import { AppContext } from "../../lib/context.js";
import { CapacitorBarcodeScanner } from "@capacitor/barcode-scanner";
import { Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useHistory } from "react-router";

const OnboardingLower = ({ page, setPage }) => {
  const history = useHistory();
  const { userInfo, setUserInfo } = useContext(AppContext);
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
    history.push(`/check-creds?token=${token}`);
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
            onIonChange={(e) =>
              setUserInfo({ ...userInfo, instance: e.detail.value })
            }
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
            disabled={userInfo.instance === null}
            strong
          >
            <IonIcon slot="start" icon={qrCode}></IonIcon>
            Scan QR code
          </IonButton>
          <IonButton shape="round" disabled={userInfo.instance === null} strong>
            Log in with token
          </IonButton>
        </div>
      </div>
    );
};

export default OnboardingLower;
