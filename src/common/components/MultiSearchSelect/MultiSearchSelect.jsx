// From the Ionic website: https://ionicframework.com/docs/api/select#typeahead-component
import { useState } from "react";
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonSearchbar,
  IonTitle,
  IonToolbar
} from "@ionic/react";

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {React.MutableRefObject<any>} props.modal
 * @param {Array<{text: string, value: string}>} props.items
 * @param {Array<string>} props.selectedItems
 * @param {(selectedItems: Array<string>) => void} props.onSelectionChange
 * @param {() => any} [props.onSelectionCancel]
 * @returns {JSX.Element}
 */
export const MultiSearchSelect = ({
  title,
  modal,
  items,
  selectedItems,
  onSelectionCancel = () => modal.current?.dismiss(),
  onSelectionChange,
}) => {
  const [filteredItems, setFilteredItems] = useState([...items]);
  const [workingSelectedValues, setWorkingSelectedValues] = useState([
    ...selectedItems,
  ]);

  /**
   * @param {string} value
   * @returns {boolean}
   */
  const isChecked = (value) => {
    return workingSelectedValues.find((item) => item === value) !== undefined;
  };

  const cancelChanges = () => {
    if (onSelectionCancel !== undefined) {
      onSelectionCancel();
    }
  };

  const confirmChanges = () => {
    onSelectionChange(workingSelectedValues);
    modal.current?.dismiss();
  };

  /**
   * @param {any} ev
   */
  const searchbarInput = (ev) => {
    filterList(ev.target.value);
  };

  /**
   * Update the rendered view with
   * the provided search query. If no
   * query is provided, all data
   * will be rendered.
   * @param {string | null | undefined} searchQuery
   */
  const filterList = (searchQuery) => {
    /**
     * If no search query is defined,
     * return all options.
     */
    if (searchQuery === undefined || searchQuery === null) {
      setFilteredItems([...items]);
    } else {
      /**
       * Otherwise, normalize the search
       * query and check to see which items
       * contain the search query as a substring.
       */
      const normalizedQuery = searchQuery.toLowerCase();
      setFilteredItems(
        items.filter((item) => {
          return item.text.toLowerCase().includes(normalizedQuery);
        }),
      );
    }
  };

  /**
   *
   * @param {import("@ionic/react").CheckboxCustomEvent} ev
   */
  const checkboxChange = (ev) => {
    const { checked, value } = ev.detail;

    if (checked) {
      setWorkingSelectedValues([...workingSelectedValues, value]);
    } else {
      setWorkingSelectedValues(
        workingSelectedValues.filter((item) => item !== value),
      );
    }
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={cancelChanges}>Cancel</IonButton>
          </IonButtons>
          <IonTitle>{title}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={confirmChanges}>Done</IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar onIonInput={searchbarInput}></IonSearchbar>
        </IonToolbar>
      </IonHeader>

      <IonContent color="light" class="ion-padding">
        <IonList id="modal-list" inset={true}>
          {filteredItems.map((item) => (
            <IonItem key={item.value}>
              <IonCheckbox
                value={item.value}
                checked={isChecked(item.value)}
                onIonChange={checkboxChange}
              >
                {item.text}
              </IonCheckbox>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </>
  );
};
