// From the Ionic website: https://ionicframework.com/docs/api/select#typeahead-component
import { useState } from "react";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {Array<{text: string, value: string}>} props.items
 * @param {string|null} [props.previouslySelectedItem=null]
 * @param {Function} props.onSelectionChange
 * @param {Function} props.onSelectionCancel
 * @returns {JSX.Element}
 */
export const SingleSearchSelect = ({
  title,
  items,
  previouslySelectedItem = null,
  onSelectionCancel,
  onSelectionChange,
}) => {
  const [filteredItems, setFilteredItems] = useState([...items]);
  console.log("previous", previouslySelectedItem);

  const cancelChanges = () => {
    if (onSelectionCancel !== undefined) {
      onSelectionCancel();
    }
  };

  /**
   * @param {{text: string, value: string}} item
   */
  const handleSelectItem = (item) => {
    if (onSelectionChange !== undefined) {
      onSelectionChange(item.value);
    }
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

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={cancelChanges}>Cancel</IonButton>
          </IonButtons>
          <IonTitle>{title}</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar onIonInput={searchbarInput}></IonSearchbar>
        </IonToolbar>
      </IonHeader>

      <IonContent color="light" class="ion-padding">
        <IonList id="modal-list" inset={true}>
          {filteredItems.map((item) => (
            <IonItem
              onClick={() => handleSelectItem(item)}
              key={item.value}
              color={previouslySelectedItem === item.value ? "primary" : ""}
              button
            >
              {item.text}
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </>
  );
};
