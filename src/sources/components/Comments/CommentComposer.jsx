import {
  IonButton,
  IonChip,
  IonIcon,
  IonSpinner,
  IonTextarea
} from "@ionic/react";
import { attach, closeCircle, people, send } from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import { useInstruments, useUsers } from "../../../common/common.hooks.js";
import { usePostSourceComment } from "../../sources.hooks.js";
import { CommentGroupsModal } from "./CommentGroupsModal.jsx";

const MAX_SUGGESTIONS = 10;

/** @param {File} file */
const readAsDataUrl = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(`${reader.result}`);
    reader.readAsDataURL(file);
  });

/**
 * @param {string} value
 * @param {number} cursor
 */
const wordBeforeCursor = (value, cursor) =>
  value.slice(0, cursor).split(/\s/).pop() ?? "";

/**
 * @param {Object} props
 * @param {string} props.sourceId - The ID of the source to comment on
 * @param {string} [props.channel] - Conversation to post to, main one if unset
 * @param {"scanning"} [props.origin] - Workflow the comment is posted from
 * @returns {JSX.Element}
 */
export const CommentComposer = ({ sourceId, channel, origin }) => {
  const [text, setText] = useState("");
  const [cursor, setCursor] = useState(0);
  const [attachment, setAttachment] = useState(
    /** @type {import("../../sources.lib.js").CommentAttachment|null} */ (null),
  );
  const [groupIds, setGroupIds] = useState(/** @type {number[]} */ ([]));
  const [isPickingGroups, setIsPickingGroups] = useState(false);
  const { users } = useUsers();
  const { instruments } = useInstruments();
  const postComment = usePostSourceComment();
  /** @type {React.MutableRefObject<any>} */
  const textarea = useRef(null);
  /** @type {React.MutableRefObject<HTMLTextAreaElement|null>} */
  const nativeInput = useRef(null);
  /** @type {React.MutableRefObject<HTMLInputElement|null>} */
  const fileInput = useRef(null);

  useEffect(() => {
    textarea.current?.getInputElement().then((/** @type {any} */ element) => {
      nativeInput.current = element;
    });
  }, []);

  const typed = wordBeforeCursor(text, cursor);
  const prefix = typed.slice(1).toLowerCase();
  /** @type {{token: string, name: string, detail: string}[]} */
  let suggestions = [];
  if (typed.startsWith("@")) {
    suggestions = (users ?? [])
      .filter((user) => !user.is_bot)
      .filter((user) =>
        [user.username, user.first_name, user.last_name].some((name) =>
          name?.toLowerCase().startsWith(prefix),
        ),
      )
      .slice(0, MAX_SUGGESTIONS)
      .map((user) => ({
        token: `@${user.username}`,
        name: user.username,
        detail: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
      }));
  } else if (typed.startsWith("#")) {
    suggestions = (instruments ?? [])
      .filter((instrument) =>
        [instrument.name, instrument.telescope?.nickname].some((name) =>
          name?.toLowerCase().startsWith(prefix),
        ),
      )
      .slice(0, MAX_SUGGESTIONS)
      .map((instrument) => ({
        token: `#${instrument.name}`,
        name: instrument.name,
        detail: instrument.telescope?.nickname ?? "",
      }));
  }

  const handleInput = (/** @type {string} */ value) => {
    setText(value);
    setCursor(nativeInput.current?.selectionStart ?? value.length);
  };

  /** @param {string} token */
  const handleSuggestionClick = (token) => {
    const start = cursor - typed.length;
    const moved = start + token.length + 1;
    setText(`${text.slice(0, start)}${token} ${text.slice(cursor)}`);
    setCursor(moved);
    nativeInput.current?.focus();
    requestAnimationFrame(() => nativeInput.current?.setSelectionRange(moved, moved));
  };

  const handleFileChange = async (/** @type {any} */ event) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachment({ name: file.name, body: await readAsDataUrl(file) });
    }
    event.target.value = "";
  };

  const handlePostComment = async () => {
    const value = text.trim();
    if ((!value && !attachment) || postComment.isPending) {
      return;
    }
    const response = await postComment
      .mutateAsync({
        sourceId,
        text: value,
        channel,
        origin,
        attachment: attachment ?? undefined,
        groupIds: groupIds.length > 0 ? groupIds : undefined,
      })
      .catch(() => null);
    if (response?.status === 200) {
      setText("");
      setCursor(0);
      setAttachment(null);
    }
  };

  return (
    <>
      {suggestions.length > 0 && (
        <div className="composer-suggestions">
          {suggestions.map(({ token, name, detail }) => (
            <button
              key={token}
              className="suggestion"
              onClick={() => handleSuggestionClick(token)}
            >
              <span className="suggestion-name">{name}</span>
              {detail && <span className="suggestion-detail">{detail}</span>}
            </button>
          ))}
        </div>
      )}
      {(attachment || groupIds.length > 0) && (
        <div className="composer-extras">
          {attachment && (
            <IonChip onClick={() => setAttachment(null)}>
              <IonIcon icon={attach} />
              {attachment.name}
              <IonIcon icon={closeCircle} />
            </IonChip>
          )}
          {groupIds.length > 0 && (
            <IonChip color="primary" onClick={() => setIsPickingGroups(true)}>
              <IonIcon icon={people} />
              {`${groupIds.length} group${groupIds.length > 1 ? "s" : ""}`}
            </IonChip>
          )}
        </div>
      )}
      <input
        ref={fileInput}
        className="file-input"
        type="file"
        onChange={handleFileChange}
      />
      <div className="composer-row">
        <IonTextarea
          ref={textarea}
          rows={1}
          autoGrow
          placeholder={channel ? `Message ${channel}` : "Message"}
          value={text}
          onIonInput={(e) => handleInput(`${e.detail.value ?? ""}`)}
        />
        <IonButton
          fill="clear"
          shape="round"
          onClick={() => fileInput.current?.click()}
          aria-label="Add an attachment"
        >
          <IonIcon slot="icon-only" icon={attach} />
        </IonButton>
        <IonButton
          fill="clear"
          shape="round"
          color={groupIds.length > 0 ? "primary" : "medium"}
          onClick={() => setIsPickingGroups(true)}
          aria-label="Customize group access"
        >
          <IonIcon slot="icon-only" icon={people} />
        </IonButton>
        <IonButton
          fill="clear"
          shape="round"
          disabled={(!text.trim() && !attachment) || postComment.isPending}
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
      <CommentGroupsModal
        isOpen={isPickingGroups}
        groupIds={groupIds}
        onChange={setGroupIds}
        onClose={() => setIsPickingGroups(false)}
      />
    </>
  );
};
