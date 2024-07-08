import "./ScanningOptionsDate.scss";
import { IonDatetimeButton, IonModal } from "@ionic/react";
import moment from "moment-timezone";
import { ErrorMessage } from "../../../common/ErrorMessage/ErrorMessage.jsx";
import { ControlledDateTime } from "../../../common/ControlledDateTime/ControlledDateTime.jsx";

/**
 * Date selection section of the scanning options
 * @param {Object} props
 * @param {import("react-hook-form").UseFormGetValues<any>} props.getValues
 * @param {import("react-hook-form").Control<any,any>} props.control
 * @param {Partial<import("react-hook-form").FieldErrorsImpl<import("react-hook-form").DeepRequired<import("react-hook-form").FieldValues>>> & {root?: Record<string, import("react-hook-form").GlobalError> & import("react-hook-form").GlobalError}} props.errors
 * @returns {JSX.Element}
 */
export const ScanningOptionsDate = ({ getValues, control, errors }) => {
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
        <ControlledDateTime
          name="startDate"
          dateTimeId="datetime-start"
          control={control}
          maxDate={moment().format()}
          rules={{
            required: "Start date is required",
            max: {
              value: moment().format(),
              message: "Start date must be before now",
            },
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
          }}
        />
      </IonModal>
      <IonModal keepContentsMounted={true}>
        {
          <ControlledDateTime
            name="endDate"
            dateTimeId="datetime-end"
            control={control}
            maxDate={moment().format()}
            rules={{
              required: "End date is required",
              max: {
                value: moment().format(),
                message: "End date must be before now",
              },
              validate: (value) => {
                if (
                  moment.tz(value, userTimeZone).toDate() > moment().toDate()
                ) {
                  return "End date must be in the past";
                }
                return true;
              },
            }}
          />
        }
      </IonModal>
      <div className="error-container">
        <ErrorMessage errors={errors} name="startDate" />
        <ErrorMessage errors={errors} name="endDate" />
      </div>
    </fieldset>
  );
};
