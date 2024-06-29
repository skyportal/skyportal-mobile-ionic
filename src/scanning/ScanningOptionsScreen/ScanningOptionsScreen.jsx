import "./ScanningOptionsScreen.scss";
import {
  IonButton,
  IonChip,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader,
  IonIcon,
  IonLabel,
  IonModal,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router";
import {
  useSearchCandidates,
  useUserAccessibleGroups,
} from "../../util/hooks.js";
import { add } from "ionicons/icons";
import { AppTypeAhead } from "../TypeAhead/AppTypeAhead.jsx";

export const ScanningOptionsScreen = () => {
  const history = useHistory();
  const { userAccessibleGroups } = useUserAccessibleGroups();
  /** @type {[import("../scanning").Group[], function]} */
  const [selectedGroups, setSelectedGroups] = useState([]);
  const { candidates, status, error } = useSearchCandidates();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
  } = useForm();
  /** @type {React.MutableRefObject<any>} */
  const modal = useRef(null);

  if (!userAccessibleGroups) {
    return <p>Loading...</p>;
  }

  /**
   * @param {string[]} selectedGroupIds
   */
  function groupSelectionChange(selectedGroupIds) {
    setSelectedGroups(
      userAccessibleGroups?.filter((group) =>
        selectedGroupIds.includes(`${group.id}`),
      ),
    );
    modal.current?.dismiss();
  }

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
                <div className="selected-groups">
                  <IonChip id="add-group" color="primary" outline={true}>
                    <IonLabel>Add</IonLabel>
                    <IonIcon icon={add}></IonIcon>
                  </IonChip>
                  {selectedGroups.map((group) => (
                    <IonChip key={group.id}>{group.name}</IonChip>
                  ))}
                </div>
                <IonModal
                  ref={modal}
                  trigger="add-group"
                  isOpen={false}
                  onDidDismiss={() => {}}
                >
                  <AppTypeAhead
                    title="Select groups"
                    items={userAccessibleGroups.map((group) => ({
                      value: `${group.id}`,
                      text: group.name,
                    }))}
                    onSelectionCancel={() => modal.current?.dismiss()}
                    onSelectionChange={groupSelectionChange}
                    selectedItems={selectedGroups.map((group) => `${group.id}`)}
                  ></AppTypeAhead>
                </IonModal>
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
