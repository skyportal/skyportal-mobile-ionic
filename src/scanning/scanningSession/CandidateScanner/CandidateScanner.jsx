import "./CandidateScanner.scss";
import { getThumbnailImageUrl, THUMBNAIL_TYPES } from "../../scanning.js";
import { Thumbnail } from "../Thumbnail/Thumbnail.jsx";
import { CandidateAnnotations } from "../CandidateAnnotations/CandidateAnnotations.jsx";
import { IonButton, IonIcon } from "@ionic/react";
import { useState } from "react";
import { useQueryParams, useSearchCandidates } from "../../../common/hooks.js";
import { arrowForward, checkmark, trashBin } from "ionicons/icons";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

export const CandidateScanner = () => {
  const params = useQueryParams();
  const { candidates } = useSearchCandidates({
    startDate: params.startDate,
    endDate: params.endDate,
    savedStatus: params.savedStatus,
    groupIDs: params.groupIDs,
  });
  if (candidates?.length === 0) {
    return <p>No candidates found</p>;
  }
  /** @type {ReturnType<typeof useState<any>>} */
  const [swiper, setSwiper] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * @param {import("swiper/types").Swiper} swiper
   */
  const handleSwiper = (swiper) => {
    setSwiper(swiper);
  };

  /**
   * @param {import("swiper/types").Swiper} swiper
   */
  const handleNextSlide = (swiper) => {
    setCurrentIndex(swiper.activeIndex);
  };

  return (
    <div className="candidate-scanner">
      <Swiper
        // @ts-ignore
        lazy="true"
        navigation={true}
        onSwiper={handleSwiper}
        onSlideChange={handleNextSlide}
        modules={[Navigation]}
      >
        {candidates?.map((candidate) => (
          <SwiperSlide key={candidate.id}>
            <div className="scanning-card">
              <div className="candidate-name">
                <h1>{candidate.id}</h1>
                <div className="pagination-indicator">
                  {currentIndex + 1}/{candidates.length}
                </div>
              </div>
              <div className="thumbnails-container">
                {Object.keys(THUMBNAIL_TYPES).map((type) => (
                  <Thumbnail
                    key={type}
                    name={type}
                    ra={candidate.ra}
                    dec={candidate.dec}
                    url={getThumbnailImageUrl(candidate, type)}
                  />
                ))}
              </div>
              <CandidateAnnotations candidate={candidate} />
              <div className="plot-container"></div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="action-buttons-container">
        <IonButton shape="round" size="large" color="danger" fill="outline">
          <IonIcon icon={trashBin} slot="icon-only" />
        </IonButton>
        <IonButton shape="round" size="large" color="success" fill="outline">
          <IonIcon icon={checkmark} slot="icon-only" />
        </IonButton>
        <IonButton
          shape="round"
          size="large"
          color="secondary"
          fill="outline"
          onClick={() => swiper.slideNext()}
        >
          <IonIcon icon={arrowForward} slot="icon-only" />
        </IonButton>
      </div>
    </div>
  );
};
