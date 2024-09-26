import "./SourceListItem.scss";
import { IonIcon } from "@ionic/react";
import { starOutline } from "ionicons/icons";

/**
 * @param {Object} props
 * @param {import("../../sources.lib.js").Source} props.source
 * @returns {JSX.Element}
 */
export const SourceListItem = ({ source }) => {
  return (
    <div className="source-list-item">
      <div className="header">
        <div className="ids">
          <div className="sky-id">{source.id}</div>
          <div className="tns-name">{source.tns_name}</div>
        </div>
        <IonIcon className="icon" icon={starOutline} />
      </div>
      <div className="created">
        <div className="label">Created:</div>
        <div className="value">
          {new Date(source.created_at).toLocaleString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            timeZoneName: "short",
          })}
        </div>
      </div>
      <div className="coords">
        <div className="ra">
          <div className="label">RA:</div>
          <div className="value">{source.ra}</div>
        </div>
        <div className="dec">
          <div className="label">DEC:</div>
          <div className="value">{source.dec}</div>
        </div>
      </div>
    </div>
  );
};
