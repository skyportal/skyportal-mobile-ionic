import "./FollowupRequests.scss";
import { IonItem, IonLabel, IonList, IonListHeader } from "@ionic/react";
import { formatDateTime } from "../../../../common/common.lib.js";

/**
 * @param {Object} props
 * @param {import("../../../scanning.lib.js").Candidate} props.candidate
 * @param {string} [props.requestType="triggered"]
 * @returns {JSX.Element | null}
 */
export const FollowupRequests = ({candidate, requestType = "triggered"}) => {
  const requestsByInstrument = candidate.followup_requests?.reduce((
    /** @type {Record<string, import("../../../scanning.lib.js").FollowupRequest[]>} */ acc,
    followupRequest) => {
    const { payload, allocation } = followupRequest;

    if ( (payload?.request_type && payload.request_type === requestType) ||
      (allocation?.types && allocation.types.includes(requestType))) {
      const instrument_name = allocation?.instrument?.name;
      if (instrument_name) {
        acc[instrument_name] ??= [];
        acc[instrument_name].push(followupRequest);
      }
    }

    return acc;
  }, {});


  return (
    <div className="followup-requests">
      <div className="section-title">Followup Requests</div>
      {requestsByInstrument &&
        Object.entries(requestsByInstrument).map(
          ([instrumentName, followupRequests]) => (
            <IonList inset key={instrumentName}>
              <IonListHeader>
                <h6>
                  <IonLabel>{instrumentName}</IonLabel>
                </h6>
              </IonListHeader>
              {followupRequests.map((/** @type {import("../../../scanning.lib.js").FollowupRequest} */ followupRequest) => (
                  <IonItem key={followupRequest.id}>
                    <div className="followup-request">
                      <div className="created">
                        {formatDateTime(followupRequest.created_at)}
                      </div>
                      <div className="username">
                        {followupRequests[0]?.requester?.username}
                      </div>
                    </div>
                  </IonItem>
                ),
              )}
            </IonList>
          ),
        )}
    </div>
  );
};
