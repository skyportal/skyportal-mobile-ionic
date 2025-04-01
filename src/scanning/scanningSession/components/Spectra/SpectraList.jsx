import "./SpectraList.scss";
import {
  IonItem, IonList,
  IonText
} from "@ionic/react";
import { formatDateTime } from "../../../../common/common.lib.js";
import { SpectraModal } from "./SpectraModal.jsx";
import { useState } from "react";
import { useSourceSpectra } from "../../../scanning.hooks.js";

/** @typedef {import("../../../scanning.lib.js").Spectra} Spectra */
/** @typedef {import("../../../scanning.lib.js").Candidate} Candidate */


/**
 * @param {Object} props
 * @param {Candidate} props.candidate
 * @returns {JSX.Element | null}
 */
export const SpectraList = ({candidate}) => {
  const { spectraList } = useSourceSpectra(candidate.id);
  /** @type {[Spectra | null, React.Dispatch<React.SetStateAction<Spectra | null>>]} */
  // @ts-ignore
  const [openSpectra, setOpenSpectra] = useState(null);

  const handleSpectraClick = (/** @type {string} */ spectraId) => {
    if (!spectraList) return;
    setOpenSpectra(spectraList.find((/** @type {Spectra} */ spectra) => spectra.id === spectraId) || null);
  }


  return (
    <div className="spectra-list section">
      <div className="section-title section-padding">
        Spectra
      </div>
      {candidate.spectra && candidate.spectra.length > 0 ? (
        <IonList lines="full" color="light">
          {candidate.spectra.map((/** @type {import("../../../scanning.lib.js").Spectra} */ spectra) => (
            <IonItem key={spectra.id}
                     onClick={() => handleSpectraClick(spectra.id)}
                     color="light">
              <div className="spectra">
                <div className="instrument-name">
                  {spectra.instrument?.name}
                </div>
                <div className="observed-at">
                  {formatDateTime(spectra.observed_at)}
                </div>
              </div>
            </IonItem>
          ))}
        </IonList>
      ) : (
        <div className="no-spectra">
          <IonText color="secondary">
            no spectra found...
          </IonText>
        </div>
      )}
      <SpectraModal spectra={openSpectra} setOpenSpectra={setOpenSpectra} />
    </div>
  );
};
