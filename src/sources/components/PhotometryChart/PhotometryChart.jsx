import "./PhotometryChart.scss";
import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
// @ts-ignore
import embed from "vega-embed";
import { getVegaPlotSpec } from "../../../scanning/scanning.lib.js";
import { useBandpassesColors } from "../../../common/common.hooks.js";
import { IonSkeletonText } from "@ionic/react";
import { useSourcePhotometry } from "../../sources.hooks.js";
import { AppContext } from "../../../common/common.context.js";
import { isActuallyDarkMode } from "../../../common/common.lib.js";

/**
 * @param {Object} props
 * @param {string} props.sourceId
 * @param {boolean} [props.isInView]
 * @returns {JSX.Element}
 */
const PhotometryChartBase = ({ sourceId, isInView = true }) => {
  const { darkMode } = useContext(AppContext);
  const { photometry, status } = useSourcePhotometry(sourceId, isInView);
  const [hasLoaded, setHasLoaded] = useState(false);
  /** @type {React.MutableRefObject<HTMLDivElement|null>} */
  const container = useRef(null);
  const unmountVega = useRef(() => {});
  const { bandpassesColors } = useBandpassesColors();
  /** @type {React.MutableRefObject<NodeJS.Timeout|undefined>} */
  const revealTimeout = useRef();

  const clearVega = () => {
    unmountVega.current();
    unmountVega.current = () => {};
    clearTimeout(revealTimeout.current);
    setHasLoaded(false);
  };

  const renderVega = useCallback(async () => {
    if (!photometry || !container.current || !bandpassesColors) return;

    clearVega();

    const result = await embed(
      container.current,
      getVegaPlotSpec({
        photometry,
        titleFontSize: 13,
        labelFontSize: 11,
        bandpassesColors,
        isDarkMode: isActuallyDarkMode(darkMode),
      }),
      { actions: false }
    );

    unmountVega.current = result.finalize;
    revealTimeout.current = setTimeout(() => setHasLoaded(true), 300);
  }, [photometry, bandpassesColors]);

  useEffect(() => {
    if (!isInView) {
      clearVega();
      return;
    }
    if (status !== "success" || !container.current || !bandpassesColors || !photometry) return;

    const observer = new ResizeObserver(() => {
      if (container.current && container.current.offsetWidth > 0) {
        renderVega();
      }
    });

    observer.observe(container.current);
    return () => {
      observer.disconnect();
      clearVega();
    };
  }, [isInView, status, photometry, bandpassesColors, renderVega]);

  return (
    <div className="photometry-chart">
      <div ref={container} className="canvas-container" />
      {!hasLoaded && (
        <div className="canvas-loading">
          <IonSkeletonText animated />
        </div>
      )}
    </div>
  );
};

export const PhotometryChart = memo(PhotometryChartBase);
