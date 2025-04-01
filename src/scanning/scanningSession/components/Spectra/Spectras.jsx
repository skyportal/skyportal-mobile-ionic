import "./Spectras.scss";
import {
  IonItem, IonList,
  IonText
} from "@ionic/react";
import { formatDateTime } from "../../../../common/common.lib.js";
import { SpectraModal } from "./SpectraModal.jsx";
import { useState } from "react";

/** @typedef {import("../../../scanning.lib.js").Spectra} Spectra */
/** @typedef {import("../../../scanning.lib.js").Candidate} Candidate */


/**
 * @param {Object} props
 * @param {Candidate} props.candidate
 * @returns {JSX.Element | null}
 */
export const Spectras = ({candidate}) => {
  /** @type {[Spectra | null, React.Dispatch<React.SetStateAction<Spectra | null>>]} */
  // @ts-ignore
  const [openSpectra, setOpenSpectra] = useState(null);

  const handleSpectraClick = (/** @type {import("../../../scanning.lib.js").Spectra} */ spectra) => {
    setOpenSpectra(spectra);
  }


  return (
    <div className="spectras section">
      <div className="section-title section-padding">
        Spectra
      </div>
      <IonList lines="full" color="light">
        {candidate.spectra ? candidate.spectra.map((/** @type {import("../../../scanning.lib.js").Spectra} */ spectra) => (
          <IonItem key={spectra.id}
                   onClick={() => handleSpectraClick(spectra)}
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
          )) : (
            <div className="no-spectra">
              <IonText color="secondary">
                no spectra found...
              </IonText>
            </div>
          )}
      </IonList>
      <SpectraModal spectra={openSpectra} setOpenSpectra={setOpenSpectra} />
    </div>
  );
};
