import "./ScanningOptionsScreen.scss";
import {
  IonButton,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader,
  IonModal,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router";
import { useSearchCandidates } from "../../util/hooks.js";

export const ScanningOptionsScreen = () => {
  const history = useHistory();
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const { candidates, status, error } = useSearchCandidates();
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
            <fieldset className="dates-section">
              <legend>Dates</legend>
              <label htmlFor="start-date">Start date:</label>
              <IonDatetimeButton datetime="datetime-start"></IonDatetimeButton>
              <label htmlFor="end-date">End date:</label>
              <IonDatetimeButton datetime="datetime-end"></IonDatetimeButton>
              <IonModal keepContentsMounted={true}>
                <IonDatetime id="datetime-start"></IonDatetime>
              </IonModal>
              <IonModal keepContentsMounted={true}>
                <IonDatetime id="datetime-end"></IonDatetime>
              </IonModal>
            </fieldset>

            <fieldset className="filtering-section">
              <legend>Filtering</legend>
              <div className="filtering-lines">
                <div className="filtering-line">
                  <IonSelect
                    name="includeOrExclude"
                    aria-label="include or exclude"
                    interface="popover"
                    value="include"
                  >
                    <IonSelectOption value="include">Include</IonSelectOption>
                    <IonSelectOption value="exclude">Exclude</IonSelectOption>
                  </IonSelect>
                  candidates
                </div>
                <div className="filtering-line">
                  saved to
                  <IonSelect
                    name="anyOrAll"
                    aria-label="filtering option"
                    interface="popover"
                    value="all"
                  >
                    <IonSelectOption value="all">all</IonSelectOption>
                    <IonSelectOption value="any">any</IonSelectOption>
                  </IonSelect>
                  of the selected groups
                </div>
              </div>
            </fieldset>

            <fieldset className="discarding-section">
              <legend>Discarding</legend>
            </fieldset>
            <IonButton type="submit">Start</IonButton>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};
