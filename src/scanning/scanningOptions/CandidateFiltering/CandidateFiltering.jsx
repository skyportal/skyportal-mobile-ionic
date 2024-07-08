import "./CandidateFiltering.scss";
import { IonSelect, IonSelectOption } from "@ionic/react";

/**
 * Candidate filter options displayed in the scanning options
 * @param {Object} props
 * @param {import("react-hook-form").UseFormRegister<any>} props.register
 * @returns {JSX.Element}
 */
export const CandidateFiltering = ({ register }) => {
  return (
    <div className="filtering-lines">
      <div className="filtering-line">
        <IonSelect
          {...register("filteringType", { required: true })}
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
          {...register("filteringAnyOrAll", { required: true })}
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
  );
};
