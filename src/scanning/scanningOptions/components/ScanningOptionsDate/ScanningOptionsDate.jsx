import "./ScanningOptionsDate.scss";
import { IonDatetimeButton, IonItem, IonLabel, IonList, IonModal } from "@ionic/react";
import moment from "moment-timezone";
import { ControlledDateTime } from "../../../../common/components/ControlledDateTime/ControlledDateTime.jsx";
import { ErrorMessageContainer } from "../../../../common/components/ErrorMessageContainer/ErrorMessageContainer.jsx";

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
    <div className="form-section">
      <IonLabel className="form-list-header">Dates (local time)</IonLabel>
      <IonList inset lines="full" color="light">
        <IonItem color="light">
          <IonLabel>Start date:</IonLabel>
          <IonDatetimeButton datetime="datetime-start"></IonDatetimeButton>
        </IonItem>
        <IonItem className="end-date-container">
          <IonLabel>End date:</IonLabel>
          <IonDatetimeButton datetime="datetime-end"></IonDatetimeButton>
        </IonItem>
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
      </IonList>
      <ErrorMessageContainer
        errors={errors}
        errorNames={["startDate", "endDate"]}
      />
    </div>
  );
};
