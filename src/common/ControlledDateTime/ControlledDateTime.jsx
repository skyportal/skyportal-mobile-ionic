import { IonDatetime } from "@ionic/react";
import { Controller } from "react-hook-form";

/**
 * IonDatetime component wrapped in a Controller for use with react-hook-form
 * @param {Object} props
 * @param {import("react-hook-form").Control<any,any>} props.control
 * @param {string} props.name
 * @param {Omit<import("react-hook-form").RegisterOptions<any, string>, "setValueAs" | "disabled" | "valueAsNumber" | "valueAsDate"> | undefined} props.rules
 * @param {string} props.dateTimeId
 * @param {string} [props.maxDate]
 * @returns {JSX.Element}
 */
export const ControlledDateTime = ({
  control,
  name,
  rules,
  dateTimeId,
  maxDate,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value } }) => (
        <IonDatetime
          id={dateTimeId}
          value={value}
          onIonChange={(e) => onChange(e.detail.value)}
          onIonBlur={onBlur}
          max={maxDate}
          showDefaultButtons={true}
        />
      )}
    />
  );
};
