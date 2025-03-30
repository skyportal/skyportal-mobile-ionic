
/**
 * @param {Object} props
 * @param {import("../../../scanning.lib.js").Comment[]} props.comments
 */
export const Comments = ({comments}) => {
  return (
    <div className="comments">
      <div className="section-title">
        Comments
      </div>
      {comments.map((comment) => (
        <div key={comment.id} className="comment">
          <div className="author">
            {comment.author.username}
          </div>
          <div className="text">
            {comment.text}
          </div>
        </div>
      ))}
    </div>
  );
}