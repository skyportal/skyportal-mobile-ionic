import "./SourceList.scss";
import { SourceListItem } from "../SourceListItem/SourceListItem.jsx";
import { useState } from "react";
import { useFetchFavoriteSourceIds, useFetchSources } from "../../sources.hooks.js";

/**
 * @param {Object} props
 * @param {string} props.filter - filter for the source list (all or favorites)
 * @param {string} props.searchName - search term for filtering sources by name
 * @returns {JSX.Element}
 */
export const SourceList = ({ filter, searchName }) => {
  const [page] = useState(1);
  const [numPerPage] = useState(10);
  const { favoriteSourceIds } = useFetchFavoriteSourceIds()
  const { sources } = useFetchSources({
    page,
    numPerPage,
    params: {
      ...searchName.trim() !== "" ? { sourceID: searchName } : {},
      ...filter === "favorites" ? { listName: "favorites" } : {}
    }
  });

  return (
    <div className="source-list">
      {sources?.map((source) => (
        <SourceListItem
          key={source.id}
          source={source}
          isFavorite={favoriteSourceIds?.includes(source.id)} />
      ))}
    </div>
  );
};
