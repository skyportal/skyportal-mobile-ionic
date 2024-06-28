import "./SourceListScreen.scss";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useState } from "react";
import { SourceListItem } from "../SourceListItem/SourceListItem.jsx";
import { useFetchSources } from "../../util/hooks.js";

export const SourceListScreen = () => {
  const [page, setPage] = useState(1);
  const [numPerPage, setNumPerPage] = useState(10);
  const { sources, status, error } = useFetchSources({ page, numPerPage });
  if (!sources) {
    return <p>Loading...</p>;
  }
  return (
    <IonPage>
      <IonContent>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Sources</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="source-list">
          {status === "pending" && <p>Loading...</p>}
          {status === "error" && <p>Error: {error.message} </p>}
          {status === "success" &&
            sources.map((source) => (
              <SourceListItem key={source.id} source={source} />
            ))}
        </div>
      </IonContent>
    </IonPage>
  );
};
