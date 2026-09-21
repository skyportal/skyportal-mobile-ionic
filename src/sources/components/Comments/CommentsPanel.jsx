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
import { add, hardwareChip, hardwareChipOutline, trashOutline } from "ionicons/icons";
import chatIcon from "./icons/chat.svg";
import assistantIcon from "./icons/smart-toy.svg";
import { useState } from "react";
import { MAIN_COMMENT_CHANNEL } from "../../sources.lib.js";
import { useCommentChannels } from "../../sources.hooks.js";
import {
  useAssistantConversations,
  useConfirmAlert,
  useDeleteAssistantConversation,
  useInstanceConfig,
  useUserProfile
} from "../../../common/common.hooks.js";
import { AssistantThread } from "./AssistantThread.jsx";
import { CommentThread } from "./CommentThread.jsx";

const FIRST_CHAT = "Chat 1";

/** @param {string[]} chats */
const nextChatName = (chats) => {
  let index = 1;
  while (chats.includes(`Chat ${index}`)) index += 1;
  return `Chat ${index}`;
};

/**
 * @param {Object} props
 * @param {string} props.sourceId
 * @param {boolean} props.isOpen - Whether the panel holding the segment is open
 * @param {string} props.channel
 * @param {(channel: string) => void} props.onChange
 * @returns {JSX.Element|null}
 */
const CommentChannels = ({ sourceId, isOpen, channel, onChange }) => {
  const { channels } = useCommentChannels(sourceId, isOpen);

  if (!channels?.length) return null;
  return (
    <IonToolbar>
      <IonSegment
        className="channel-segment"
        scrollable
        value={channel}
        onIonChange={(e) => onChange(String(e.detail.value))}
      >
        {[MAIN_COMMENT_CHANNEL, ...channels].map((name) => (
          <IonSegmentButton key={name} value={name}>
            <IonLabel>{name}</IonLabel>
          </IonSegmentButton>
        ))}
      </IonSegment>
    </IonToolbar>
  );
};

/**
 * Floating button opening the conversations held on a source and the assistant.
 * @param {Object} props
 * @param {string} [props.sourceId] - Source to read the comments of, assistant only if unset
 * @param {"scanning"} [props.origin] - Workflow the comments are posted from
 * @returns {JSX.Element|null}
 */
export const CommentsPanel = ({ sourceId, origin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAssistant, setIsAssistant] = useState(false);
  const [channel, setChannel] = useState(MAIN_COMMENT_CHANNEL);
  const [chat, setChat] = useState(FIRST_CHAT);
  const [addedChats, setAddedChats] = useState(/** @type {string[]} */ ([]));
  const [botsToggle, setBotsToggle] = useState(/** @type {boolean|null} */ (null));
  const { config } = useInstanceConfig();
  const { userProfile } = useUserProfile();
  const assistantEnabled = config?.assistantEnabled === true;
  const { conversations } = useAssistantConversations(isOpen && assistantEnabled);
  const deleteConversation = useDeleteAssistantConversation();
  const confirmAlert = useConfirmAlert();

  const bothSpaces = !!sourceId && assistantEnabled;
  const showAssistant = assistantEnabled && (isAssistant || !sourceId);
  const isMainChannel = channel === MAIN_COMMENT_CHANNEL;
  const includeBots = botsToggle ?? !!userProfile?.preferences?.showBotComments;
  const chats = [...new Set([...(conversations ?? []), ...addedChats, FIRST_CHAT])];
  const openedChat = chats.includes(chat) ? chat : chats[0];

  const addChat = () => {
    const name = nextChatName(chats);
    setAddedChats([...addedChats, name]);
    setChat(name);
  };

  const removeChat = async () => {
    if (!(await confirmAlert(`This will delete "${openedChat}" and everything in it.`))) return;
    setAddedChats(addedChats.filter((name) => name !== openedChat));
    setChat(FIRST_CHAT);
    if (conversations?.includes(openedChat)) deleteConversation.mutate(openedChat);
  };

  if (!sourceId && !assistantEnabled) return null;
  return (
    <>
      <IonFab
        className="comments-fab"
        slot="fixed"
        vertical="bottom"
        horizontal="end"
      >
        <IonFabButton onClick={() => setIsOpen(true)}>
          {bothSpaces ? (
            <span className="split-icon">
              <IonIcon src={chatIcon} />
              <IonIcon src={assistantIcon} />
            </span>
          ) : (
            <IonIcon className="fab-icon" src={sourceId ? chatIcon : assistantIcon} />
          )}
        </IonFabButton>
      </IonFab>
      <IonModal
        className="comments-modal"
        isOpen={isOpen}
        onDidDismiss={() => setIsOpen(false)}
      >
        <IonHeader>
          {bothSpaces && (
            <IonToolbar className="space-tabs">
              <IonSegment
                mode="md"
                value={showAssistant ? "assistant" : "comments"}
                onIonChange={(e) => setIsAssistant(e.detail.value === "assistant")}
              >
                <IonSegmentButton value="comments">
                  <IonLabel>Comments</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="assistant">
                  <IonLabel>Assistant</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </IonToolbar>
          )}
          <IonToolbar>
            <IonButtons slot="start">
              {showAssistant ? (
                <>
                  <IonButton onClick={addChat} aria-label="New conversation">
                    <IonIcon slot="icon-only" icon={add} />
                  </IonButton>
                  <IonButton onClick={removeChat} aria-label="Delete this conversation">
                    <IonIcon slot="icon-only" icon={trashOutline} />
                  </IonButton>
                </>
              ) : (
                isMainChannel && (
                  <IonButton
                    className="bots-toggle"
                    color={includeBots ? "primary" : "medium"}
                    onClick={() => setBotsToggle(!includeBots)}
                  >
                    <IonIcon
                      slot="start"
                      icon={includeBots ? hardwareChip : hardwareChipOutline}
                    />
                    Bots
                  </IonButton>
                )
              )}
            </IonButtons>
            <IonTitle>{sourceId ?? "Assistant"}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setIsOpen(false)}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
          {showAssistant
            ? chats.length > 1 && (
                <IonToolbar>
                  <IonSegment
                    className="channel-segment"
                    scrollable
                    value={openedChat}
                    onIonChange={(e) => setChat(String(e.detail.value))}
                  >
                    {chats.map((name) => (
                      <IonSegmentButton key={name} value={name}>
                        <IonLabel>{name}</IonLabel>
                      </IonSegmentButton>
                    ))}
                  </IonSegment>
                </IonToolbar>
              )
            : sourceId && (
                <CommentChannels
                  sourceId={sourceId}
                  isOpen={isOpen}
                  channel={channel}
                  onChange={setChannel}
                />
              )}
        </IonHeader>
        {showAssistant ? (
          <AssistantThread
            key={openedChat}
            sourceId={sourceId}
            channel={openedChat}
            isOpen={isOpen}
          />
        ) : (
          sourceId && (
            <CommentThread
              key={channel}
              sourceId={sourceId}
              channel={isMainChannel ? undefined : channel}
              origin={origin}
              isOpen={isOpen}
              includeBots={includeBots}
            />
          )
        )}
      </IonModal>
    </>
  );
};
