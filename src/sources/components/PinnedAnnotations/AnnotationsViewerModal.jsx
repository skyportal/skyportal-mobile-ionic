import { IonContent, IonHeader, IonModal, IonSearchbar } from "@ionic/react";
import { Annotations } from "../Annotations/Annotations.jsx";

/**
 * @param {Object} props
 * @param {import("../../../scanning/scanning.lib.js").Candidate | import("../../sources.lib.js").Source} props.source
 * @param {React.RefObject<HTMLIonModalElement>} props.modal
 * @returns {JSX.Element}
 */
export const AnnotationsViewerModal = ({ source, modal }) => {
  return (
    <IonModal
      ref={modal}
      initialBreakpoint={0.75}
      breakpoints={[0.75, 1]}
    >
      <IonHeader>
        <IonSearchbar />
      </IonHeader>
      <IonContent style={{ "--padding-bottom": "2rem"}}>
        <Annotations source={source} />
      </IonContent>
    </IonModal>
  );
};
