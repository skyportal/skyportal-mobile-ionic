import {
  IonButton,
  IonChip,
  IonIcon,
  IonSpinner,
  IonTextarea
} from "@ionic/react";
import { attach, closeCircle, people, send } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { useInstruments, useUsers } from "../../../common/common.hooks.js";
import { usePostSourceComment } from "../../sources.hooks.js";
import { CommentGroupsModal } from "./CommentGroupsModal.jsx";

const MAX_SUGGESTIONS = 10;

/** @param {File} file */
const readAsDataUrl = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });

/**
 * @param {string} typed
 * @param {import("../../../common/common.lib.js").SlimUser[]} users
 * @param {import("../../../common/common.lib.js").Instrument[]} instruments
 * @returns {{token: string, name: string, detail: string}[]}
 */
const suggestionsFor = (typed, users, instruments) => {
  const prefix = typed.slice(1).toLowerCase();
  /** @param {(string|null|undefined)[]} names */
  const matches = (names) =>
    names.some((name) => name?.toLowerCase().startsWith(prefix));
  if (typed.startsWith("@")) {
    return users
      .filter(
        (user) =>
          !user.is_bot &&
          matches([user.username, user.first_name, user.last_name]),
      )
      .slice(0, MAX_SUGGESTIONS)
      .map((user) => ({
        token: `@${user.username}`,
        name: user.username,
        detail: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
      }));
  }
  if (typed.startsWith("#")) {
    return instruments
      .filter((instrument) =>
        matches([instrument.name, instrument.telescope?.nickname]),
      )
      .slice(0, MAX_SUGGESTIONS)
      .map((instrument) => ({
        token: `#${instrument.name}`,
        name: instrument.name,
        detail: instrument.telescope?.nickname ?? "",
      }));
  }
  return [];
};

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
  const [caretToRestore, setCaretToRestore] = useState(
    /** @type {number|null} */ (null),
  );
  const [attachment, setAttachment] = useState(
    /** @type {import("../../sources.lib.js").CommentAttachment|undefined} */ (undefined),
  );
  const [groupIds, setGroupIds] = useState(/** @type {number[]} */ ([]));
  const [isPickingGroups, setIsPickingGroups] = useState(false);
  const { users } = useUsers();
  const { instruments } = useInstruments();
  const postComment = usePostSourceComment();
  /** @type {React.RefObject<HTMLIonTextareaElement>} */
  const textarea = useRef(null);
  /** @type {React.RefObject<HTMLInputElement>} */
  const fileInput = useRef(null);

  // The value only reaches the DOM on commit, so the caret can only be moved from an effect.
  useEffect(() => {
    if (caretToRestore === null) return;
    setCaretToRestore(null);
    textarea.current?.getInputElement().then((native) => {
      native.focus();
      native.setSelectionRange(caretToRestore, caretToRestore);
    });
  }, [caretToRestore]);

  const typed = text.slice(0, cursor).split(/\s/).pop() ?? "";
  const suggestions = suggestionsFor(typed, users ?? [], instruments ?? []);

  /** @param {import("@ionic/core").TextareaCustomEvent<import("@ionic/core").TextareaInputEventDetail>} event */
  const handleInput = ({ detail }) => {
    const value = String(detail.value ?? "");
    const native = /** @type {HTMLTextAreaElement|null} */ (detail.event?.target ?? null);
    setText(value);
    setCursor(native?.selectionStart ?? value.length);
  };

  /** @param {string} token */
  const handleSuggestionClick = (token) => {
    const start = cursor - typed.length;
    const moved = start + token.length + 1;
    setText(`${text.slice(0, start)}${token} ${text.slice(cursor)}`);
    setCursor(moved);
    setCaretToRestore(moved);
  };

  /** @param {React.ChangeEvent<HTMLInputElement>} event */
  const handleFileChange = async ({ target }) => {
    const file = target.files?.[0];
    if (file) {
      setAttachment({ name: file.name, body: await readAsDataUrl(file) });
    }
    target.value = "";
  };

  const handlePostComment = () =>
    postComment.mutate(
      { sourceId, text: text.trim(), channel, origin, attachment, groupIds },
      {
        onSuccess: (response) => {
          if (response.status !== 200) return;
          setText("");
          setCursor(0);
          setAttachment(undefined);
        },
      },
    );

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
            <IonChip onClick={() => setAttachment(undefined)}>
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
          onIonInput={handleInput}
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
