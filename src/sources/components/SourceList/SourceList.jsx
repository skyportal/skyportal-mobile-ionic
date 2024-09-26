import "./SourceList.scss";
import { SourceListItem } from "../SourceListItem/SourceListItem.jsx";
import { useState } from "react";
import { useFetchSources } from "../../../common/common.hooks.js";

export const SourceList = () => {
  const [page, setPage] = useState(1);
  const [numPerPage, setNumPerPage] = useState(10);
  const { sources, status, error } = useFetchSources({
    page,
    numPerPage,
  });

  return (
    <div className="source-list">
      {sources?.map((source) => (
        <SourceListItem key={source.id} source={source} />
      ))}
    </div>
  );
};
