import "./Comments.scss"
import { IonAccordion, IonAccordionGroup, IonItem, IonLabel, IonText } from "@ionic/react";
import { getDateDiff } from "../../../scanning.lib.js";

/**
 * @param {Object} props
 * @param {import("../../../scanning.lib.js").Comment[]} props.comments
 */
export const Comments = ({comments}) => {
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
                    {comment.author?.username}
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