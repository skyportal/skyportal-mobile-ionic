import "./SourceListScreen.scss";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSources } from "../sources.js";
import { AppContext } from "../../util/context.js";
import { Capacitor } from "@capacitor/core";
import { SourceListItem } from "../SourceListItem/SourceListItem.jsx";

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
      fetchSources(
        page,
        numPerPage,
        userInfo.instance.url,
        userInfo.token,
        Capacitor.getPlatform(),
      ),
  });
  return (
    <IonPage>
      <IonContent>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Sources</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="source-list">
          {status === "loading" && <p>Loading...</p>}
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
