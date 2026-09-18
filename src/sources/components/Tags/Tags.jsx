import "./Tags.scss";
import { IonChip } from "@ionic/react";
import { useTagOptions } from "../../sources.hooks.js";
import { DEFAULT_TAG_COLOR, getContrastColor } from "../../sources.lib.js";

/**
 * @param {Object} props
 * @param {import("../../sources.lib.js").Tag[]} [props.tags]
 * @param {string} props.sourceId
 * @returns {JSX.Element|null}
 */
export const Tags = ({ tags, sourceId }) => {
  const { tagOptions } = useTagOptions();

  if (!tags?.length) {
    return null;
  }

  return (
    <div className="tags">
      {tags.map((tag) => {
        const color =
          tagOptions?.find((option) => option.id === tag.objtagoption_id)
            ?.color || DEFAULT_TAG_COLOR;
        const fromLinkedObj = tag.obj_id && tag.obj_id !== sourceId;
        return (
          <IonChip
            key={tag.id}
            className="tag"
            style={{ backgroundColor: color, color: getContrastColor(color) }}
          >
            {fromLinkedObj ? `${tag.name} (${tag.obj_id})` : tag.name}
          </IonChip>
        );
      })}
    </div>
  );
};
