import "./FollowupRequests.scss";
import {
  IonAccordion,
  IonAccordionGroup,
  IonItem,
  IonLabel,
  IonText
} from "@ionic/react";
import { formatDateTime } from "../../../common/common.lib.js";
import { FollowupRequestDetailsModal } from "./FollowupRequestDetailsModal.jsx";
import { useState } from "react";

/** @typedef {import("../../../scanning/scanning.lib.js").Candidate} Candidate */
/** @typedef {import("../../sources.lib.js").FollowupRequest} FollowupRequest */
/** @typedef {import("../../sources.lib.js").Source} Source */


/**
 * @param {Object} props
 * @param {Candidate | Source} props.source
 * @param {string} [props.requestType="triggered"]
 * @returns {JSX.Element | null}
 */
export const FollowupRequests = ({source, requestType = "triggered"}) => {
  /** @type {[FollowupRequest | null, React.Dispatch<React.SetStateAction<FollowupRequest | null>>]} */
  // @ts-ignore
  const [openFollowupRequest, setOpenFollowupRequest] = useState(null);

  const requestsByInstrument = source.followup_requests?.reduce((
    /** @type {Record<string, FollowupRequest[]>} */ acc,
    followupRequest) => {
    const { payload, allocation, status } = followupRequest;

    if (status === "deleted") return acc;

    if ((payload?.request_type && payload.request_type === requestType) ||
      (allocation?.types && allocation.types.includes(requestType))) {
      const instrument_name = allocation?.instrument?.name;
      if (instrument_name) {
        acc[instrument_name] ??= [];
        acc[instrument_name].push(followupRequest);
      }
    }

    return acc;
  }, {});

  const handleFollowupRequestClick = (/** @type {FollowupRequest} */ followupRequest) => {
    setOpenFollowupRequest(followupRequest);
  }


  return (
    <div className="followup-requests section">
      <div className="section-title section-padding">
        { requestType === "forced_photometry" ? "Forced Photometry": "Follow-up Requests"}
      </div>
      <IonAccordionGroup multiple>
        {requestsByInstrument && Object.keys(requestsByInstrument).length > 0 ?
          Object.entries(requestsByInstrument).map(([instrumentName, followupRequests]) => (
            <IonAccordion key={instrumentName} value={instrumentName}>
              <IonItem slot="header" color="light">
                <h6>
                  <IonLabel className="instrument-name">{instrumentName}</IonLabel>
                </h6>
              </IonItem>
              {followupRequests.map((/** @type {FollowupRequest} */ followupRequest) => (
                  <IonItem key={followupRequest.id}
                           onClick={() => handleFollowupRequestClick(followupRequest)}
                       slot="content">
                    <div className="followup-request">
                      <div className="created">
                        {formatDateTime(followupRequest.created_at)}
                      </div>
                      <div className="username">
                        {followupRequest.requester?.username}
                      </div>
                    </div>
                  </IonItem>
                ),
              )}
            </IonAccordion>
          )) : (
            <div className="no-followup-requests">
              <IonText color="secondary">
                no followup requests found...
              </IonText>
            </div>
          )}
      </IonAccordionGroup>
      <FollowupRequestDetailsModal followupRequest={openFollowupRequest} setOpenFollowupRequest={setOpenFollowupRequest} />
    </div>
  );
};
