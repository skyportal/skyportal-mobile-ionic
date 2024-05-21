import "./SourceListScreen.scss";
import {
  IonContent,
  IonHeader,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSources } from "../../lib/sources.js";
import { AppContext } from "../../lib/context.js";
import { Capacitor } from "@capacitor/core";

export const SourceListScreen = () => {
  const { userInfo } = useContext(AppContext);
  const [page, setPage] = useState(1);
  const [numPerPage, setNumPerPage] = useState(10);
  const {
    data: sources,
    status,
    error,
  } = useQuery({
    queryKey: ["sources", page, numPerPage, userInfo.token],
    queryFn: () =>
      fetchSources(page, numPerPage, userInfo.token, Capacitor.getPlatform()),
  });
  return (
    <IonPage>
      <IonContent>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Sources</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          {status === "loading" && <p>Loading...</p>}
          {status === "error" && (
            <p>
              Error: {error.message}{" "}
              <button onClick={() => refetch()}>Retry</button>
            </p>
          )}
          {status === "success" &&
            sources.map((source) => (
              <div key={source.id}>
                <p>{source.id}</p>
                <p>{source.ra}</p>
                <p>{source.dec}</p>
              </div>
            ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};
