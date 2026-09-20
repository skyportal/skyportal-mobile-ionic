import "./Comments.scss";
import {
  IonButton,
  IonButtons,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonLabel,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { chatbubbleEllipses } from "ionicons/icons";
import { useState } from "react";
import { MAIN_COMMENT_CHANNEL } from "../../sources.lib.js";
import { useCommentChannels } from "../../sources.hooks.js";
import { CommentThread } from "./CommentThread.jsx";

/**
 * Floating button opening the conversations held on a source.
 * @param {Object} props
 * @param {string} props.sourceId - The ID of the source to read the comments of
 * @param {"scanning"} [props.origin] - Workflow the comments are posted from
 * @returns {JSX.Element}
 */
export const CommentsPanel = ({ sourceId, origin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [channel, setChannel] = useState(MAIN_COMMENT_CHANNEL);
  const { channels } = useCommentChannels(sourceId, isOpen);

  return (
    <>
      <IonFab
        className="comments-fab"
        slot="fixed"
        vertical="bottom"
        horizontal="end"
      >
        <IonFabButton onClick={() => setIsOpen(true)}>
          <IonIcon icon={chatbubbleEllipses} />
        </IonFabButton>
      </IonFab>
      <IonModal
        className="comments-modal"
        isOpen={isOpen}
        onDidDismiss={() => setIsOpen(false)}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>{sourceId}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setIsOpen(false)}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
          {channels && channels.length > 0 && (
            <IonToolbar>
              <IonSegment
                scrollable
                value={channel}
                onIonChange={(e) => setChannel(`${e.detail.value}`)}
              >
                {[MAIN_COMMENT_CHANNEL, ...channels].map((name) => (
                  <IonSegmentButton key={name} value={name}>
                    <IonLabel>{name}</IonLabel>
                  </IonSegmentButton>
                ))}
              </IonSegment>
            </IonToolbar>
          )}
        </IonHeader>
        <CommentThread
          key={channel}
          sourceId={sourceId}
          channel={channel === MAIN_COMMENT_CHANNEL ? undefined : channel}
          origin={origin}
          isOpen={isOpen}
        />
      </IonModal>
    </>
  );
};
