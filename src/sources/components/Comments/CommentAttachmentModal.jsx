import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { useCommentAttachment } from "../../sources.hooks.js";

/**
 * @param {Object} props
 * @param {string} props.sourceId
 * @param {import("../../sources.lib.js").Comment} props.comment
 * @returns {JSX.Element}
 */
const AttachmentPreview = ({ sourceId, comment }) => {
  const { attachment, status, error } = useCommentAttachment(sourceId, comment.id);

  if (status === "pending") {
    return <IonSpinner />;
  }
  if (status === "error" || !attachment) {
    return (
      <IonText color="secondary">
        {error?.message ?? "this attachment cannot be previewed..."}
      </IonText>
    );
  }
  if (!attachment.contentType.startsWith("image/")) {
    return (
      <IonText color="secondary">
        {`${attachment.contentType} files cannot be previewed in the app...`}
      </IonText>
    );
  }
  return <img alt={comment.attachment_name ?? ""} src={attachment.dataUrl} />;
};

/**
 * @param {Object} props
 * @param {string} props.sourceId
 * @param {import("../../sources.lib.js").Comment|null} props.comment - Comment to preview, none if null
 * @param {() => void} props.onClose
 * @returns {JSX.Element}
 */
export const CommentAttachmentModal = ({ sourceId, comment, onClose }) => (
  <IonModal
    className="comment-attachment-modal"
    isOpen={!!comment}
    onDidDismiss={onClose}
  >
    <IonHeader>
      <IonToolbar>
        <IonTitle>{comment?.attachment_name}</IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={onClose}>Close</IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
    <IonContent className="attachment-preview">
      {comment && <AttachmentPreview sourceId={sourceId} comment={comment} />}
    </IonContent>
  </IonModal>
);
