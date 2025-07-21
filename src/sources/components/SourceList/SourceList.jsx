import "./SourceList.scss";
import { SourceListItem } from "../SourceListItem/SourceListItem.jsx";
import React, { useState } from "react";
import { useFetchFavoriteSourceIds, useFetchSources } from "../../sources.hooks.js";
import { IonLoading, IonText } from "@ionic/react";

/**
 * @param {Object} props
 * @param {string} props.filter - filter for the source list (all or favorites)
 * @param {string} props.searchName - search term for filtering sources by name
 * @returns {JSX.Element}
 */
export const SourceList = ({ filter, searchName }) => {
  const [page] = useState(1);
  const [numPerPage] = useState(25);
  const { favoriteSourceIds } = useFetchFavoriteSourceIds()
  const { sources, status } = useFetchSources({
    page,
    numPerPage,
    params: {
      ...searchName.trim() !== "" && { sourceID: searchName },
      ...filter === "favorites" && { listName: "favorites" },
    },
  });

  if (status === "pending") return <IonLoading isOpen />

  return (
    <div className="source-list">
      {sources?.length ? sources?.map((source) => (
        <SourceListItem
          key={source.id}
          source={source}
          isFavorite={favoriteSourceIds?.includes(source.id)} />
      )) : <div className="no-sources">
        <IonText color="secondary">
          No sources found...
        </IonText>
      </div>
      }
    </div>
  );
};
