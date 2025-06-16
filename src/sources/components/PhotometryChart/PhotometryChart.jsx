import "./PhotometryChart.scss";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import embed from "vega-embed";
import { getVegaPlotSpec } from "../../../scanning/scanning.lib.js";
import { useBandpassesColors } from "../../../common/common.hooks.js";
import { IonSkeletonText } from "@ionic/react";
import { useSourcePhotometry } from "../../sources.hooks.js";

/**
 * @param {Object} props
 * @param {string} props.sourceId
 * @param {boolean} [props.isInView]
 * @returns {JSX.Element}
 */
const PhotometryChartBase = ({ sourceId, isInView = true }) => {
  const { photometry, status } = useSourcePhotometry(sourceId, isInView);
  const [hasLoaded, setHasLoaded] = useState(false);
  /** @type {React.MutableRefObject<HTMLDivElement|null>} */
  const container = useRef(null);
  const unmountVega = useRef(() => {});
  const { bandpassesColors } = useBandpassesColors();
  /** @type {React.MutableRefObject<NodeJS.Timeout|undefined>} */
  const revealTimeout = useRef(undefined);

  const renderVega = useCallback(async () => {
    if (!photometry || !container.current || !bandpassesColors) return;

    const result = await embed(
      // @ts-ignore
      container.current,
      getVegaPlotSpec({
        photometry,
        titleFontSize: 13,
        labelFontSize: 11,
        // @ts-ignore
        bandpassesColors,
      }),
      { actions: false }
    );

    unmountVega.current = result.finalize;
    revealTimeout.current = setTimeout(() => setHasLoaded(true), 300);
  }, [photometry, bandpassesColors]);

  useEffect(() => {
    if (!isInView) {
      if (unmountVega.current) unmountVega.current();
      setHasLoaded(false);
      if (container.current) {
        const canvas = container.current.getElementsByTagName("canvas")[0];
        if (canvas) {
          canvas.height = 0;
          canvas.width = 0;
        }
      }
    } else if (status === "success" && !hasLoaded) {
      renderVega();
    }
    return () => {
      clearTimeout(revealTimeout.current);
    };
  }, [isInView, status, renderVega]);

  return (
    <div className="photometry-chart">
      <div
        className="canvas-container"
        ref={container}
        style={{ visibility: hasLoaded ? "visible" : "hidden" }}
      />
      <div
        className={`canvas-loading ${hasLoaded ? "loaded" : "loading"}`}
        style={{
          visibility: hasLoaded ? "hidden" : "visible",
        }}
      >
        <IonSkeletonText animated />
      </div>
    </div>
  );
};

export const PhotometryChart = memo(PhotometryChartBase);
