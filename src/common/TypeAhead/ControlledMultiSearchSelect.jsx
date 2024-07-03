import { MultiSearchSelect } from "./MultiSearchSelect.jsx";
import { Controller } from "react-hook-form";

/**
 * MultiSearchSelect component wrapped in a Controller for use with react-hook-form
 * @param {Object} props
 * @param {import("react-hook-form").Control<any,any>} props.control
 * @param {React.MutableRefObject<import("@ionic/react").IonModal<any> | undefined>} props.modal
 * @param {Array<{text: string, value: string}>} props.items
 * @param {Array<string>} props.selectedItems
 * @param {(selectedItems: Array<string>) => void} props.onSelectedItemsChange
 * @returns {JSX.Element}
 */
export const ControlledMultiSearchSelect = ({
  control,
  modal,
  items,
  onSelectedItemsChange,
  selectedItems,
}) => {
  return (
    <Controller
      name="selectedGroups"
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
      render={({ field: { ref, onChange, value } }) => (
        <MultiSearchSelect
          modal={modal}
          title="Select groups"
          items={items}
          selectedItems={selectedItems}
          onSelectionChange={(selectedItems) => {
            onChange(selectedItems);
            onSelectedItemsChange(selectedItems);
          }}
        ></MultiSearchSelect>
      )}
    />
  );
};
