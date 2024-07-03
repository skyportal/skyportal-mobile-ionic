import { MultiSearchSelect } from "./MultiSearchSelect.jsx";
import { Controller } from "react-hook-form";

/**
 * MultiSearchSelect component wrapped in a Controller for use with react-hook-form
 * @param {Object} props
 * @param {import("react-hook-form").Control<any,any>} props.control
 * @param {string} props.name
 * @param {React.MutableRefObject<import("@ionic/react").IonModal<any> | undefined>} props.modal
 * @param {Array<{text: string, value: string}>} props.items
 * @returns {JSX.Element}
 */
export const ControlledMultiSearchSelect = ({
  control,
  name,
  modal,
  items,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: true,
        validate: (value) => {
          if (value.length === 0) {
            return "At least one group must be selected";
          }
          return true;
        },
      }}
      render={({ field: { onChange, value } }) => (
        <MultiSearchSelect
          modal={modal}
          title="Select groups"
          items={items}
          selectedItems={value}
          onSelectionChange={onChange}
        ></MultiSearchSelect>
      )}
    />
  );
};
