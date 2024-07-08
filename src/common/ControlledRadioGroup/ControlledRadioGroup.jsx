import { Controller } from "react-hook-form";
import { IonRadioGroup } from "@ionic/react";

/**
 * Radio group with controlled state
 * @param {Object} props
 * @param {string} props.name
 * @param {import("react-hook-form").Control<any, any>} props.control
 * @param {import("react-hook-form").RegisterOptions} [props.rules]
 * @param {import("react").ReactNode} props.children
 * @returns {JSX.Element}
 */
export const ControlledRadioGroup = ({ name, control, rules, children }) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <IonRadioGroup
          value={value}
          onIonChange={(e) => onChange(e.detail.value)}
        >
          {children}
        </IonRadioGroup>
      )}
    />
  );
};
