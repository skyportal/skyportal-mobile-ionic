import { MultiSearchSelect } from "./MultiSearchSelect.jsx";
import { Controller } from "react-hook-form";

/**
 * MultiSearchSelect component wrapped in a Controller for use with react-hook-form
 * @param {Object} props
 * @param {import("react-hook-form").Control<any,any>} props.control
 * @param {Omit<import("react-hook-form").RegisterOptions<any, string>, "setValueAs" | "disabled" | "valueAsNumber" | "valueAsDate"> | undefined} [props.rules]
 * @param {string} props.name
 * @param {React.MutableRefObject<import("@ionic/react").IonModal<any> | undefined>} props.modal
 * @param {Array<{text: string, value: string}>} props.items
 * @param {string} props.title
 * @returns {JSX.Element}
 */
export const ControlledMultiSearchSelect = ({
  control,
  rules,
  name,
  modal,
  items,
  title,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <MultiSearchSelect
          modal={modal}
          title={title}
          items={items}
          selectedItems={value}
          onSelectionChange={onChange}
        ></MultiSearchSelect>
      )}
    />
  );
};
