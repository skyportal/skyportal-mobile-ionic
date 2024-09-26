import { Controller } from "react-hook-form";
import { IonInput } from "@ionic/react";

/**
 * Input with controlled state
 * @param {Object} props
 * @param {string} props.name
 * @param {import("react-hook-form").Control<any, any>} props.control
 * @param {import("react-hook-form").RegisterOptions} [props.rules]
 * @param {import("react").ReactNode} [props.children]
 * @returns {JSX.Element}
 */
export const ControlledInput = ({
  name,
  control,
  rules,
  children,
  ...rest
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value } }) => (
        <IonInput
          value={value}
          onIonBlur={onBlur}
          onIonChange={(e) => onChange(e.detail.value)}
          {...rest}
        >
          {children}
        </IonInput>
      )}
    />
  );
};
