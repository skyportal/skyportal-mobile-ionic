import "./Comments.scss"
import { IonAccordion, IonAccordionGroup, IonItem, IonLabel, IonText } from "@ionic/react";

/**
 * @param {Object} props
 * @param {import("../../../scanning.lib.js").Comment[]} props.comments
 */
export const Comments = ({comments}) => {
  const getDateDiff = (/** @type {string} */stringUTCDate) => {
    const date = new Date(stringUTCDate + "Z"); // Add 'Z' to indicate that the date is in UTC
    if (isNaN(date.getTime())) {
      return "...";
    }
    const diff = new Date().getTime() - date.getTime();
    const diffInMinutes = Math.floor(diff / (1000 * 60));
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 365) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
  }

  return (
    <div className="comments section">
      <div className="section-title section-padding">
        Comments
      </div>
      <IonAccordionGroup>
        {comments.length > 0 ? (
          <IonAccordion value="first">
            {comments.map((comment, index) => (
              <IonItem key={comment.id} color="light" slot={index > 0 ? "content" : "header"}>
              <div className="comment">
                  <IonLabel color="primary">
                    {comment.author.username}
                    <span className="date">{" - " + getDateDiff(comment.created_at)}</span>
                  </IonLabel>
                  <div className="text">
                    {comment.text}
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
    </div>
  );
}