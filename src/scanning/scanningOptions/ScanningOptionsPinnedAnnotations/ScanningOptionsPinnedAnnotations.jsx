import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
} from "@ionic/react";
import { useAnnotationsInfo } from "../../scanningHooks.js";
import { pencil } from "ionicons/icons";
import { PinnedAnnotationsPicker } from "../PinnedAnnotationsPicker/PinnedAnnotationsPicker.jsx";
import { Controller } from "react-hook-form";

/**
 * @param {Object} props
 * @param {import("react-hook-form").Control<any,any>} props.control
 * @param {import("react-hook-form").UseFormWatch<any>} props.watch
 * @param {React.MutableRefObject<any>} props.modal
 * @returns {JSX.Element}
 */
export const ScanningOptionsPinnedAnnotations = ({ control, watch, modal }) => {
  const { annotationsInfo } = useAnnotationsInfo();
  /** @type {string[]} */
  const pinnedAnnotations = watch("pinnedAnnotations");
  return (
    <div className="form-section">
      <IonList lines="full" color="light" inset>
        <IonItem>
          <IonLabel>
            Pinned annotations
            <p>{pinnedAnnotations.length} selected (select up to 3)</p>
          </IonLabel>
          <IonButton id="select-pinned-annotations" fill="clear">
            Edit<IonIcon slot="end" icon={pencil}></IonIcon>
          </IonButton>
        </IonItem>
        {pinnedAnnotations.map((annotationKey) => (
          <IonItem key={annotationKey}>{annotationKey}</IonItem>
        ))}
      </IonList>
      {annotationsInfo && (
        <IonModal
          ref={modal}
          trigger="select-pinned-annotations"
          isOpen={false}
        >
          <Controller
            name="pinnedAnnotations"
            control={control}
            render={({ field: { onChange, value } }) => (
              <PinnedAnnotationsPicker
                annotationsInfo={annotationsInfo}
                modal={modal}
                selectedAnnotationKeys={value}
                onDismiss={onChange}
              />
            )}
          />
        </IonModal>
      )}
    </div>
  );
};
