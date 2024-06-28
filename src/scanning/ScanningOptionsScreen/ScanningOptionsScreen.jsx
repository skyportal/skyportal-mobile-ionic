import "./ScanningOptionsScreen.scss";
import {
  IonButton,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader,
  IonModal,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { searchCandidates } from "../scanning.js";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router";

export const ScanningOptionsScreen = () => {
  const history = useHistory();
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const {
    data: candidates,
    status,
    error,
  } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => searchCandidates(),
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
  } = useForm();
  /**
   * @param {Object} data
   */
  const onSubmit = (data) => {
    console.log(data);
    history.push("/app/scanning/main");
  };
  const savedStatusSelectOptions = [
    { value: "all", label: "regardless of saved status" },
    { value: "savedToAllSelected", label: "saved to all selected groups" },
    {
      value: "savedToAnySelected",
      label: "saved to at least one of the selected groups",
    },
    {
      value: "savedToAnyAccessible",
      label: "saved to at least one group I have access to",
    },
    {
      value: "notSavedToAnyAccessible",
      label: "not saved to any of group I have access to",
    },
    {
      value: "notSavedToAnySelected",
      label: "not saved to any of the selected groups",
    },
    {
      value: "notSavedToAllSelected",
      label: "not saved to all of the selected groups",
    },
  ];
  return (
    <IonPage>
      <IonContent>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Scanning options</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="scanning-options-container">
          <form
            className="scanning-options-form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <section className="dates-section">
              <label htmlFor="start-date">Start date:</label>
              <IonDatetimeButton datetime="datetime"></IonDatetimeButton>
              <label htmlFor="end-date">End date:</label>
              <IonDatetimeButton datetime="datetime"></IonDatetimeButton>
            </section>

            <section className="filtering-section">
              <IonModal keepContentsMounted={true}>
                <IonDatetime id="datetime"></IonDatetime>
              </IonModal>
              <div className="saved-status-container">
                <label htmlFor="saved-status">Show candidates...</label>
                <IonSelect
                  id="saved-status"
                  label="Filter"
                  placeholder="Select a filtering option"
                >
                  {savedStatusSelectOptions.map((option) => (
                    <IonSelectOption key={option.value} value={option.value}>
                      {option.label}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>
              <IonToggle>Hide rejected</IonToggle>
            </section>

            <section className="project-section">
              <IonSearchbar placeholder="Search project"></IonSearchbar>
              <IonSelect
                label="Junk group"
                placeholder="Select a junk group"
              ></IonSelect>
            </section>
            <IonButton type="submit">Start</IonButton>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};
