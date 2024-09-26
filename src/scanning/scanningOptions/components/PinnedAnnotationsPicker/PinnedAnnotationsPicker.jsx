import {
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonSearchbar,
  IonText,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { useCallback, useState } from "react";
import { getAnnotationId } from "../../../scanning.lib.js";

/**
 * @param {Object} props
 * @param {import("../../../scanning.requests.js").AnnotationsInfo} props.annotationsInfo
 * @param {string[]} props.selectedAnnotationKeys
 * @param {React.MutableRefObject<any>} props.modal
 * @param {number} [props.limit=3]
 * @param {(keys: string[]) => void} props.onDismiss
 * @returns {JSX.Element}
 */
export const PinnedAnnotationsPicker = ({
  annotationsInfo,
  modal,
  selectedAnnotationKeys,
  limit = 3,
  onDismiss,
}) => {
  const [localSelected, setLocalSelected] = useState(selectedAnnotationKeys);
  const [filteredSelected, setFilteredSelected] = useState(annotationsInfo);

  const selectedIndex = useCallback(
    /**
     * @param {string} group
     * @param {string} annotationKey
     * @returns {number}
     */
    (group, annotationKey) =>
      localSelected.findIndex(
        (key) => key === getAnnotationId(group, annotationKey),
      ),
    [localSelected],
  );

  const togglePinAnnotation = useCallback(
    /**
     * @param {string} group
     * @param {string} annotationKey
     */
    (group, annotationKey) => {
      const annotationId = getAnnotationId(group, annotationKey);
      if (selectedIndex(group, annotationKey) !== -1) {
        setLocalSelected((prev) =>
          prev.filter((item) => item !== annotationId),
        );
      } else {
        if (localSelected.length < limit) {
          setLocalSelected((prev) => [...prev, annotationId]);
        }
      }
    },
    [localSelected],
  );

  const onDone = () => {
    onDismiss(localSelected);
    modal.current?.dismiss();
  };

  /**
   * @param {string} searchQuery
   */
  const filterList = (searchQuery) => {
    if (searchQuery === "") {
      setFilteredSelected(annotationsInfo);
    } else {
      const normalizedQuery = searchQuery.toLowerCase();
      setFilteredSelected(
        Object.entries(annotationsInfo)
          .map(([group, annotationInfoItem]) => ({
            group,
            annotationInfoItem: annotationInfoItem.filter((keyInfo) =>
              Object.keys(keyInfo)[0].toLowerCase().includes(normalizedQuery),
            ),
          }))
          .filter(({ annotationInfoItem }) => annotationInfoItem.length > 0)
          .reduce((previousValue, currentValue) => {
            previousValue[currentValue.group] = currentValue.annotationInfoItem;
            return previousValue;
          }, Object.create({})),
      );
    }
  };

  /**
   * @param {any} e
   */
  const onSearchQuery = (e) => {
    filterList(e.target.value ?? "");
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => modal.current?.dismiss()}>
              Cancel
            </IonButton>
          </IonButtons>
          <IonTitle>Select pinned annotations</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDone}>Done</IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            onIonInput={onSearchQuery}
            debounce={300}
          ></IonSearchbar>
        </IonToolbar>
        <IonToolbar>
          <IonText className="ion-padding">
            {localSelected.length} selected
          </IonText>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {Object.entries(filteredSelected).map(([group, annotationInfoItem]) => (
          <IonItemGroup key={group}>
            <IonItemDivider>
              <IonLabel>{group}</IonLabel>
            </IonItemDivider>
            {annotationInfoItem.map((annotationKeyInfo) => {
              const annotationKey = Object.keys(annotationKeyInfo)[0];
              return (
                <IonItem
                  key={annotationKey}
                  onClick={() => togglePinAnnotation(group, annotationKey)}
                  detail={false}
                  color="light"
                  button
                >
                  <IonLabel>{annotationKey}</IonLabel>
                  {selectedIndex(group, annotationKey) !== -1 && (
                    <IonBadge>
                      {selectedIndex(group, annotationKey) + 1}
                    </IonBadge>
                  )}
                </IonItem>
              );
            })}
          </IonItemGroup>
        ))}
      </IonContent>
    </>
  );
};
