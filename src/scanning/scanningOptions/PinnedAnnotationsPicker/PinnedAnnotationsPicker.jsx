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
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useCallback, useState } from "react";
import { getAnnotationId } from "../../scanningLib.js";

/**
 * @param {Object} props
 * @param {import("../../scanningRequests").AnnotationsInfo} props.annotationsInfo
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
        if (localSelected.length <= limit) {
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
      </IonHeader>
      <IonContent>
        {Object.entries(annotationsInfo).map(([group, annotationInfoItem]) => (
          <IonItemGroup key={group}>
            <IonItemDivider>
              <IonLabel>{group}</IonLabel>
            </IonItemDivider>
            {annotationInfoItem
              // @ts-ignore
              .map(
                (
                  /** @type {import("../../scanningRequests").AnnotationKeyInfo} */ annotationKeyInfo,
                ) => {
                  const annotationKey = Object.keys(annotationKeyInfo)[0];
                  return (
                    <IonItem
                      key={annotationKey}
                      onClick={() => togglePinAnnotation(group, annotationKey)}
                      detail={false}
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
                },
              )}
          </IonItemGroup>
        ))}
      </IonContent>
    </>
  );
};
