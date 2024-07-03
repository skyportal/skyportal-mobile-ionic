import "./ScanningOptionsDate.scss";
import { IonDatetime, IonDatetimeButton, IonModal } from "@ionic/react";
import moment from "moment-timezone";

/**
 * Date selection section of the scanning options
 * @param {Object} props
 * @param {import("react-hook-form").UseFormRegister<any>} props.register
 * @param {import("react-hook-form").UseFormGetValues<any>} props.getValues
 * @param {Partial<import("react-hook-form").FieldErrorsImpl<import("react-hook-form").DeepRequired<import("react-hook-form").FieldValues>>> & {root?: Record<string, import("react-hook-form").GlobalError> & import("react-hook-form").GlobalError}} props.errors
 * @returns {JSX.Element}
 */
export const ScanningOptionsDate = ({ register, getValues, errors }) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <fieldset className="dates-section">
      <legend>Dates (local time)</legend>
      <div className="start-date-container">
        <label htmlFor="start-date">Start date:</label>
        <IonDatetimeButton datetime="datetime-start"></IonDatetimeButton>
      </div>

      <div className="end-date-container">
        <label htmlFor="end-date">End date:</label>
        <IonDatetimeButton datetime="datetime-end"></IonDatetimeButton>
      </div>
      <IonModal keepContentsMounted={true}>
        {
          // @ts-ignore
          <IonDatetime
            {...register("startDate", {
              required: true,
              setValueAs: (value) => moment.tz(value, userTimeZone),
              validate: (value) => {
                if (
                  moment.tz(value, userTimeZone) >
                  moment.tz(getValues("endDate"), userTimeZone)
                ) {
                  return "Start date must be before end date";
                } else if (moment.tz(value, userTimeZone) > moment()) {
                  return "Start date must be in the past";
                }
                return true;
              },
            })}
            id="datetime-start"
          ></IonDatetime>
        }
      </IonModal>
      <IonModal keepContentsMounted={true}>
        {
          // @ts-ignore
          <IonDatetime
            {...register("endDate", {
              required: true,
              validate: (value) => {
                if (moment.tz(value, userTimeZone) > moment()) {
                  return "End date must be in the past";
                }
                return true;
              },
            })}
            id="datetime-end"
          ></IonDatetime>
        }
      </IonModal>
      <div className="error-container">
        {errors["startDate"] && (
          <p className="error">
            {/* @ts-ignore */}
            {errors["startDate"].message || "start date is required"}
          </p>
        )}
        {errors["endDate"] && (
          // @ts-ignore
          <p className="error">{errors["endDate"].message}</p>
        )}
      </div>
    </fieldset>
  );
};
