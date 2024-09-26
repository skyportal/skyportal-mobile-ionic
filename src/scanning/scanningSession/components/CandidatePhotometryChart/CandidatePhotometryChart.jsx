import "./CandidatePhotometryChart.scss";
import { memo, useContext, useEffect, useRef, useState } from "react";
import embed from "vega-embed";
import { getVegaPlotSpec } from "../../../scanning.lib.js";
import { useBandpassesColors } from "../../../../common/common.hooks.js";
import { IonSkeletonText } from "@ionic/react";
import { fetchSourcePhotometry } from "../../../scanning.requests.js";
import { useMutation } from "@tanstack/react-query";
import { UserContext } from "../../../../common/common.context.js";

/**
 * @param {Object} props
 * @param {string} props.candidateId
 * @param {boolean} props.isInView
 * @returns {JSX.Element}
 */
const CandidatePhotometryChartBase = ({ candidateId, isInView }) => {
  const { userInfo } = useContext(UserContext);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loaderIsHidden, setLoaderIsHidden] = useState(false);
  /** @type {React.MutableRefObject<HTMLDivElement|null>} */
  const container = useRef(null);
  const unmountVega = useRef(() => {});
  const { bandpassesColors } = useBandpassesColors();
  /** @type {React.MutableRefObject<NodeJS.Timeout|undefined>} */
  const revealTimeout = useRef(undefined);

  const mountMutation = useMutation({
    mutationFn: async () => {
      const photometry = await fetchSourcePhotometry({
        sourceId: candidateId,
        userInfo,
      });
      if (!container.current || !bandpassesColors || !photometry) {
        throw new Error("Missing parameters");
      }
      const response = await embed(
        // @ts-ignore
        container.current,
        getVegaPlotSpec({
          photometry,
          titleFontSize: 13,
          labelFontSize: 11,
          // @ts-ignore
          bandpassesColors,
        }),
        {
          actions: false,
        },
      );
      unmountVega.current = response.finalize;
    },
    onSuccess: () => {
      revealTimeout.current = setTimeout(() => {
        setHasLoaded(true);
      }, 300);
    },
  });

  useEffect(() => {
    if (!isInView) {
      if (container.current) {
        const canvas = container.current.getElementsByTagName("canvas")[0];
        if (canvas) {
          canvas.height = 0;
          canvas.width = 0;
          unmountVega.current();
          setHasLoaded(false);
        }
      }
    } else {
      mountMutation.mutate();
    }
    return () => {
      clearTimeout(revealTimeout.current);
    };
  }, [isInView, bandpassesColors]);

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

  return (
    <div className="candidate-photometry-chart">
      <div
        className="canvas-container"
        ref={container}
        style={{ visibility: hasLoaded ? "visible" : "hidden" }}
      />
      <div
        className={`canvas-loading ${hasLoaded ? "loaded" : "loading"}`}
        style={{
          visibility: loaderIsHidden ? "hidden" : "visible",
        }}
      >
        <IonSkeletonText animated />
      </div>
    </div>
  );
};

export const CandidatePhotometryChart = memo(CandidatePhotometryChartBase);
