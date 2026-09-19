import "./Comments.scss"
import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTextarea
} from "@ionic/react";
import { send } from "ionicons/icons";
import { useState } from "react";
import { getDateDiff } from "../../../common/common.lib.js";
import { MAIN_COMMENT_CHANNEL } from "../../sources.lib.js";
import {
  useCommentChannels,
  usePostSourceComment,
  useSourceComments
} from "../../sources.hooks.js";

/**
 * @param {Object} props
 * @param {string} props.sourceId - The ID of the source to read the comments of
 * @param {boolean} [props.isInView] - Whether the component is currently in view
 * @param {"scanning"} [props.origin] - Workflow the comments are posted from
 * @returns {JSX.Element}
 */
export const Comments = ({ sourceId, isInView = true, origin }) => {
  const [channel, setChannel] = useState(MAIN_COMMENT_CHANNEL);
  const [text, setText] = useState("");
  const { channels } = useCommentChannels(sourceId, isInView);
  const { comments } = useSourceComments(
    sourceId,
    channel === MAIN_COMMENT_CHANNEL ? undefined : channel,
    isInView,
  );
  const postComment = usePostSourceComment();

  const sortedComments = [...(comments ?? [])].sort((a, b) =>
    a.created_at < b.created_at ? 1 : -1
  );

  /**
   * Formats the text to highlight mentions and hashtags.
   * @param {string} text - The text to format.
   */
  const formattedText = (text) =>{
    const parts = text.split(/(?<!\w)([@#][\w-@]+)/g);

    return parts.map((part, index) => {
      if (part.match(/(?<!\w)([@#][\w-@]+)/)) {
        return (
          <span key={index} className="highlight">
          {part}
        </span>
        );
      }
      return part;
    });
  }

  const handlePostComment = async () => {
    const value = text.trim();
    if (!value || postComment.isPending) {
      return;
    }
    const response = await postComment
      .mutateAsync({
        sourceId,
        text: value,
        channel: channel === MAIN_COMMENT_CHANNEL ? undefined : channel,
        origin,
      })
      .catch(() => null);
    if (response?.status === 200) {
      setText("");
    }
  };

  return (
    <div className="comments section">
      <div className="section-title section-padding">
        Comments
      </div>
      {channels && channels.length > 0 && (
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
      )}
      <IonAccordionGroup>
        {sortedComments.length > 0 ? (
          <IonAccordion value="first">
            {sortedComments.map((comment, index) => (
              <IonItem key={comment.id} color="light" slot={index > 0 ? "content" : "header"}>
              <div className="comment">
                  <IonLabel color="primary">
                    {comment.author?.username}
                    <span className="date">{" - " + getDateDiff(comment.created_at)}</span>
                  </IonLabel>
                  <div className="text">
                    {formattedText(comment.text)}
                  </div>
                </div>
              </IonItem>
            ))}
        </IonAccordion>
        ) : (
          <div className="no-comments">
            <IonText color="secondary">
              no comments found...
            </IonText>
          </div>
        )}
      </IonAccordionGroup>
      <div className="new-comment section-padding">
        <IonTextarea
          rows={1}
          autoGrow
          fill="outline"
          placeholder={
            channel === MAIN_COMMENT_CHANNEL
              ? "Add a comment"
              : `Comment on ${channel}`
          }
          value={text}
          onIonInput={(e) => setText(`${e.detail.value ?? ""}`)}
        />
        <IonButton
          fill="clear"
          disabled={!text.trim() || postComment.isPending}
          onClick={handlePostComment}
        >
          <IonIcon slot="icon-only" icon={send} />
        </IonButton>
      </div>
    </div>
  );
}
