import {
  IonButton,
  IonContent,
  IonFooter,
  IonIcon,
  IonSpinner,
  IonText,
  IonTextarea,
  IonToolbar
} from "@ionic/react";
import { send } from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import { getDateDiff } from "../../../common/common.lib.js";
import { useUserProfile } from "../../../common/common.hooks.js";
import { usePostSourceComment, useSourceComments } from "../../sources.hooks.js";

const RUN_GAP_MS = 60 * 60 * 1000;

/** @param {string} stringUTCDate */
const toTime = (stringUTCDate) => new Date(stringUTCDate + "Z").getTime();

/**
 * Formats the text to highlight mentions and hashtags.
 * @param {string} text - The text to format.
 */
const formattedText = (text) => {
  const parts = text.split(/(?<!\w)([@#][\w-@]+)/g);

  return parts.map((part, index) =>
    part.match(/(?<!\w)([@#][\w-@]+)/) ? (
      <span key={index} className="highlight">{part}</span>
    ) : (
      part
    ),
  );
};

/**
 * @param {Object} props
 * @param {string} props.sourceId - The ID of the source to read the comments of
 * @param {string} [props.channel] - Conversation to read, main one if unset
 * @param {"scanning"} [props.origin] - Workflow the comments are posted from
 * @param {boolean} props.isOpen - Whether the panel holding the thread is open
 * @returns {JSX.Element}
 */
export const CommentThread = ({ sourceId, channel, origin, isOpen }) => {
  const [text, setText] = useState("");
  const { userProfile } = useUserProfile();
  const { comments, status } = useSourceComments(sourceId, channel, isOpen);
  const postComment = usePostSourceComment();
  /** @type {React.MutableRefObject<any>} */
  const content = useRef(null);

  // The comments endpoint returns no particular order, the thread is built here.
  const ordered = [...(comments ?? [])].sort((a, b) =>
    a.created_at < b.created_at ? -1 : 1
  );

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => content.current?.scrollToBottom());
    return () => cancelAnimationFrame(frame);
  }, [isOpen, ordered.length]);

  const handlePostComment = async () => {
    const value = text.trim();
    if (!value || postComment.isPending) {
      return;
    }
    const response = await postComment
      .mutateAsync({ sourceId, text: value, channel, origin })
      .catch(() => null);
    if (response?.status === 200) {
      setText("");
    }
  };

  return (
    <>
      <IonContent ref={content} className="comment-thread">
        {status === "pending" ? (
          <div className="thread-placeholder">
            <IonSpinner />
          </div>
        ) : ordered.length === 0 ? (
          <div className="thread-placeholder">
            <IonText color="secondary">
              {channel
                ? "this conversation is only kept once a message is sent..."
                : "no comment yet..."}
            </IonText>
          </div>
        ) : (
          ordered.map((comment, index) => {
            const previous = ordered[index - 1];
            const next = ordered[index + 1];
            const separated =
              !previous ||
              toTime(comment.created_at) - toTime(previous.created_at) > RUN_GAP_MS;

            if (comment.system) {
              return (
                <div key={comment.id} className="system-comment">
                  {comment.text}
                </div>
              );
            }

            const mine = comment.author?.username === userProfile?.username;
            const sameAs = (/** @type {typeof comment} */ other) =>
              !!other && !other.system &&
              other.author?.username === comment.author?.username;
            const startsRun = separated || !sameAs(previous);
            const endsRun =
              !sameAs(next) ||
              toTime(next.created_at) - toTime(comment.created_at) > RUN_GAP_MS;

            return (
              <React.Fragment key={comment.id}>
                {separated && (
                  <div className="thread-separator">
                    {getDateDiff(comment.created_at)}
                  </div>
                )}
                <div
                  className={[
                    "message",
                    mine ? "mine" : "theirs",
                    startsRun ? "run-start" : "",
                    endsRun ? "run-end" : "",
                    comment.bot ? "bot" : "",
                  ].filter(Boolean).join(" ")}
                >
                  {!mine &&
                    (endsRun && comment.author?.gravatar_url ? (
                      <img className="avatar" alt="" src={comment.author.gravatar_url} />
                    ) : (
                      <span className="avatar" />
                    ))}
                  <div className="bubble-column">
                    {!mine && startsRun && (
                      <div className="author">{comment.author?.username}</div>
                    )}
                    <div className="bubble">{formattedText(comment.text)}</div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
      </IonContent>
      <IonFooter className="comment-composer">
        <IonToolbar>
          <div className="composer-row">
            <IonTextarea
              rows={1}
              autoGrow
              placeholder={channel ? `Message ${channel}` : "Message"}
              value={text}
              onIonInput={(e) => setText(`${e.detail.value ?? ""}`)}
            />
            <IonButton
              fill="clear"
              shape="round"
              disabled={!text.trim() || postComment.isPending}
              onClick={handlePostComment}
              aria-label="Post comment"
            >
              {postComment.isPending ? (
                <IonSpinner name="crescent" />
              ) : (
                <IonIcon slot="icon-only" icon={send} />
              )}
            </IonButton>
          </div>
        </IonToolbar>
      </IonFooter>
    </>
  );
};
