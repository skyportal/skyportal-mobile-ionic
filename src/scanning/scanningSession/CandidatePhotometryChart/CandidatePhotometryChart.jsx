import "./CandidatePhotometryChart.scss";
import { useEffect, useRef, useState } from "react";
import embed from "vega-embed";
import { vegaPlotSpec } from "../../scanning.js";
import { useSourcePhotometry } from "../../../common/hooks.js";
import { IonSpinner } from "@ionic/react";

/**
 * @param {Object} props
 * @param {import("../../scanning.js").Candidate} props.candidate
 * @returns {JSX.Element}
 */
export const CandidatePhotometryChart = ({ candidate }) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loaderIsHidden, setLoaderIsHidden] = useState(false);
  /** @type {React.MutableRefObject<HTMLDivElement|null>} */
  const container = useRef(null);
  const { photometry, status } = useSourcePhotometry({
    sourceId: candidate.id,
  });

  useEffect(() => {
    /**@type {any} */
    let hideTimeout;
    if (hasLoaded && !loaderIsHidden) {
      hideTimeout = setTimeout(() => setLoaderIsHidden(true), 300);
    }
    return () => {
      clearTimeout(hideTimeout);
    };
  }, [hasLoaded, loaderIsHidden]);

  useEffect(() => {
    /**@type {() => void } */
    let finalize = () => {};
    /**@type {any} */
    let revealTimeout;
    const run = async () => {
      if (!container.current || !photometry) return;
      const response = await embed(
        container.current,
        vegaPlotSpec({
          photometry,
          titleFontSize: 13,
          labelFontSize: 11,
        }),
        {
          actions: false,
        },
      );
      finalize = response.finalize;
      revealTimeout = setTimeout(() => {
        setHasLoaded(true);
      }, 300);
    };
    run();
    return () => {
      finalize();
      clearTimeout(revealTimeout);
    };
  }, [container, status]);
  return (
    <>
      <div
        className="canvas-container"
        ref={container}
        style={{ visibility: hasLoaded ? "visible" : "hidden" }}
      />
      <div
        className={`canvas-loading ${hasLoaded ? "loaded" : "loading"}`}
        style={{ visibility: loaderIsHidden ? "hidden" : "visible" }}
      >
        <IonSpinner color="primary" />
      </div>
    </>
  );
};
