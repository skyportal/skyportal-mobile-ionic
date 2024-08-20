import { IonItem, IonList } from "@ionic/react";

/**
 * @param {Object} props
 * @param {React.MutableRefObject<import("../../scanningLib").ScanningRecap>} props.recap
 * @returns {JSX.Element}
 */
export const ScanningRecap = ({ recap }) => {
  return (
    <div>
      <h1>Saved sources</h1>
      <IonList>
        {recap.current.assigned.length > 0 ? (
          recap.current.assigned.map((source) => (
            <IonItem key={source.id}>
              <h2>{source.id}</h2>
            </IonItem>
          ))
        ) : (
          <p>No saved sources</p>
        )}
      </IonList>
    </div>
  );
};
