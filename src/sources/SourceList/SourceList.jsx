import "./SourceList.scss";
import { SourceListItem } from "../SourceListItem/SourceListItem.jsx";
import { useContext, useState } from "react";
import { useFetchSources } from "../../common/hooks.js";
import { UserContext } from "../../common/context.js";

export const SourceList = () => {
  const userInfo = useContext(UserContext);
  const [page, setPage] = useState(1);
  const [numPerPage, setNumPerPage] = useState(10);
  const { sources, status, error } = useFetchSources({
    page,
    numPerPage,
    userInfo,
  });

  return (
    <div className="source-list">
      {sources?.map((source) => (
        <SourceListItem key={source.id} source={source} />
      ))}
    </div>
  );
};
