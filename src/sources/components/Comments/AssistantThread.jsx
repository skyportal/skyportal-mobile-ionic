import {
  IonButton,
  IonContent,
  IonFooter,
  IonIcon,
  IonSpinner,
  IonText,
  IonTextarea
} from "@ionic/react";
import { send } from "ionicons/icons";
import Markdown from "react-markdown";
import { useContext, useState } from "react";
import { AppContext } from "../../../common/common.context.js";
import { isActuallyDarkMode } from "../../../common/common.lib.js";
import {
  useAskAssistant,
  useAssistantMessages,
  useScrollToBottom
} from "../../../common/common.hooks.js";

/**
 * @param {Object} props
 * @param {string} [props.sourceId] - Source the assistant is told the user is looking at
 * @param {string} props.channel - Conversation to read and ask in
 * @param {boolean} props.isOpen - Whether the panel holding the thread is open
 * @returns {JSX.Element}
 */
export const AssistantThread = ({ sourceId, channel, isOpen }) => {
  const [question, setQuestion] = useState("");
  const { darkMode } = useContext(AppContext);
  const { messages = [], status } = useAssistantMessages(channel, isOpen);
  const askAssistant = useAskAssistant();

  const answered = messages.at(-1)?.system ?? true;
  const content = useScrollToBottom(isOpen, [messages.length, answered]);

  const ask = () => {
    const text = question.trim();
    setQuestion("");
    askAssistant.mutate(
      { text, channel, ...(sourceId ? { contextType: "source", contextId: sourceId } : {}) },
      { onError: () => setQuestion(text) },
    );
  };

  return (
    <>
      <IonContent ref={content} className="comment-thread">
        {status === "pending" ? (
          <div className="thread-placeholder">
            <IonSpinner />
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="thread-placeholder">
                <IonText color="secondary">
                  {sourceId
                    ? `ask anything, the assistant knows you are on ${sourceId}...`
                    : "ask anything..."}
                </IonText>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message run-start run-end ${message.system ? "theirs" : "mine"}`}
              >
                <div className="bubble-column">
                  {message.system && <div className="author">Assistant</div>}
                  <div className="bubble markdown">
                    <Markdown>{message.text}</Markdown>
                  </div>
                </div>
              </div>
            ))}
            {!answered && (
              <div className="thread-thinking">
                <img
                  className="thinking-logo"
                  alt=""
                  src={
                    isActuallyDarkMode(darkMode)
                      ? "/images/skyportal_logo_dark.png"
                      : "/images/skyportal_logo.png"
                  }
                />
                <IonText color="secondary">thinking...</IonText>
              </div>
            )}
          </>
        )}
      </IonContent>
      <IonFooter className="comment-composer">
        <div className="composer-row">
          <IonTextarea
            rows={1}
            autoGrow
            placeholder="Ask the assistant"
            value={question}
            onIonInput={(e) => setQuestion(String(e.detail.value ?? ""))}
          />
          <IonButton
            fill="clear"
            shape="round"
            disabled={!question.trim() || !answered}
            onClick={ask}
            aria-label="Ask the assistant"
          >
            <IonIcon slot="icon-only" icon={send} />
          </IonButton>
        </div>
      </IonFooter>
    </>
  );
};
