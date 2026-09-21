import { IonContent, IonFooter, IonIcon, IonSpinner, IonText } from "@ionic/react";
import { attach } from "ionicons/icons";
import { Fragment, useEffect, useRef, useState } from "react";
import { getDateDiff } from "../../../common/common.lib.js";
import { useUserProfile } from "../../../common/common.hooks.js";
import { useSourceComments } from "../../sources.hooks.js";
import { CommentAttachmentModal } from "./CommentAttachmentModal.jsx";
import { CommentComposer } from "./CommentComposer.jsx";

/** @typedef {import("../../sources.lib.js").Comment} Comment */

const RUN_GAP_MS = 60 * 60 * 1000;
const MENTION_PATTERN = /(?<!\w)([@#][\w-@]+)/;

/** @param {string} stringUTCDate */
const toTime = (stringUTCDate) => new Date(stringUTCDate + "Z").getTime();

/** @param {Comment["author"]} [author] */
const initialsOf = (author) =>
  `${author?.first_name?.[0] ?? author?.username?.[0] ?? "?"}${author?.last_name?.[0] ?? ""}`;

/**
 * Highlights the mentions and the hashtags of a comment.
 * @param {string} text
 */
const formattedText = (text) =>
  text.split(MENTION_PATTERN).map((part, index) =>
    MENTION_PATTERN.test(part) ? (
      <span key={index} className="highlight">{part}</span>
    ) : (
      part
    ),
  );

/**
 * Pairs every comment with its place in its run of consecutive messages.
 * @param {Comment[]} comments - Comments sorted from the oldest to the newest
 * @param {string} [username] - Username of the reader, whose messages are shown as his own
 */
const toRows = (comments, username) =>
  comments.map((comment, index) => {
    /** @param {Comment} [other] */
    const inSameRun = (other) =>
      !!other &&
      !other.system &&
      other.author?.username === comment.author?.username &&
      Math.abs(toTime(other.created_at) - toTime(comment.created_at)) <= RUN_GAP_MS;
    const previous = comments[index - 1];
    return {
      comment,
      mine: comment.author?.username === username,
      separated:
        !previous ||
        toTime(comment.created_at) - toTime(previous.created_at) > RUN_GAP_MS,
      startsRun: !inSameRun(previous),
      endsRun: !inSameRun(comments[index + 1]),
    };
  });

/**
 * @param {Object} props
 * @param {Comment} props.comment
 * @param {boolean} props.mine
 * @param {boolean} props.startsRun
 * @param {boolean} props.endsRun
 * @param {() => void} props.onAttachmentClick
 * @returns {JSX.Element}
 */
const CommentBubble = ({ comment, mine, startsRun, endsRun, onAttachmentClick }) => (
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
      (endsRun ? (
        <span className="avatar">
          {initialsOf(comment.author)}
          {comment.author?.gravatar_url && (
            <img alt="" src={comment.author.gravatar_url} />
          )}
        </span>
      ) : (
        <span className="avatar-spacer" />
      ))}
    <div className="bubble-column">
      {!mine && startsRun && (
        <div className="author">{comment.author?.username}</div>
      )}
      <div className="bubble">
        {formattedText(comment.text)}
        {comment.attachment_name && (
          <button className="attachment" onClick={onAttachmentClick}>
            <IonIcon icon={attach} />
            {comment.attachment_name}
          </button>
        )}
      </div>
    </div>
  </div>
);

/**
 * @param {Object} props
 * @param {string} props.sourceId - The ID of the source to read the comments of
 * @param {string} [props.channel] - Conversation to read, main one if unset
 * @param {"scanning"} [props.origin] - Workflow the comments are posted from
 * @param {boolean} props.isOpen - Whether the panel holding the thread is open
 * @param {boolean} props.includeBots - Whether comments posted by bots are shown
 * @returns {JSX.Element}
 */
export const CommentThread = ({ sourceId, channel, origin, isOpen, includeBots }) => {
  const [previewed, setPreviewed] = useState(/** @type {Comment|null} */ (null));
  const { userProfile } = useUserProfile();
  const { comments, status } = useSourceComments(sourceId, channel, isOpen);
  /** @type {React.RefObject<HTMLIonContentElement>} */
  const content = useRef(null);

  // The comments endpoint answers in no particular order, the thread is ordered here.
  const rows = toRows(
    [...(comments ?? [])]
      .filter((comment) => includeBots || channel || !comment.bot)
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1)),
    userProfile?.username,
  );

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => content.current?.scrollToBottom());
    return () => cancelAnimationFrame(frame);
  }, [isOpen, rows.length]);

  return (
    <>
      <IonContent ref={content} className="comment-thread">
        {status === "pending" ? (
          <div className="thread-placeholder">
            <IonSpinner />
          </div>
        ) : rows.length === 0 ? (
          <div className="thread-placeholder">
            <IonText color="secondary">
              {channel
                ? "this conversation is only kept once a message is sent..."
                : "no comment yet..."}
            </IonText>
          </div>
        ) : (
          rows.map(({ comment, separated, ...position }) =>
            comment.system ? (
              <div key={comment.id} className="system-comment">
                {comment.text}
              </div>
            ) : (
              <Fragment key={comment.id}>
                {separated && (
                  <div className="thread-separator">
                    {getDateDiff(comment.created_at)}
                  </div>
                )}
                <CommentBubble
                  comment={comment}
                  {...position}
                  onAttachmentClick={() => setPreviewed(comment)}
                />
              </Fragment>
            ),
          )
        )}
      </IonContent>
      <IonFooter className="comment-composer">
        <CommentComposer sourceId={sourceId} channel={channel} origin={origin} />
      </IonFooter>
      <CommentAttachmentModal
        sourceId={sourceId}
        comment={previewed}
        onClose={() => setPreviewed(null)}
      />
    </>
  );
};
