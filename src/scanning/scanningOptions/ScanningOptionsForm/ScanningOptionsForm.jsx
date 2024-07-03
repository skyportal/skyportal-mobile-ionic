import "./ScanningOptionsForm.scss";
import { ScanningOptionsDate } from "../ScanningOptionsDate/ScanningOptionsDate.jsx";
import { ScanningOptionsProgram } from "../ScanningOptionsProgram/ScanningOptionsProgram.jsx";
import { ScanningOptionsDiscarding } from "../ScanningOptionsDiscarding/ScanningOptionsDiscarding.jsx";
import { IonButton } from "@ionic/react";
import { useForm } from "react-hook-form";
import moment from "moment-timezone";
import { useRef, useState } from "react";
import { useUserAccessibleGroups } from "../../../common/hooks.js";

export const ScanningOptionsForm = () => {
  const defaultValues = {
    startDate: moment().subtract(1, "day").format(),
    endDate: moment().format(),
    filterCandidates: false,
    filteringType: "include",
    filteringAnyOrAll: "all",
    selectedGroups: [],
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
    control,
  } = useForm({ defaultValues });

  /**
   * @param {Object} data
   */
  const onSubmit = (data) => {
    console.log(data);
    // history.push("/app/scanning/main");
  };

  /** @type {React.MutableRefObject<any>} */
  const groupSelectionModal = useRef(null);
  /** @type {React.MutableRefObject<any>} */
  const junkGroupSelectionModal = useRef(null);
  const { userAccessibleGroups } = useUserAccessibleGroups();
  /** @type {[import("../../scanning.js").Group[], function]} */
  const [selectedGroups, setSelectedGroups] = useState([]);
  /** @type {[any, function]} */
  const [junkGroup, setJunkGroup] = useState(null);

  if (!userAccessibleGroups) {
    return <p>Loading...</p>;
  }

  return (
    <form className="scanning-options-form" onSubmit={handleSubmit(onSubmit)}>
      <ScanningOptionsDate
        register={register}
        getValues={getValues}
        errors={errors}
      />
      <ScanningOptionsProgram
        register={register}
        control={control}
        errors={errors}
        modal={groupSelectionModal}
        userAccessibleGroups={userAccessibleGroups}
        selectedGroups={selectedGroups}
        onSelectedGroupsChange={(selectedItems) => {
          setSelectedGroups(
            userAccessibleGroups.filter((group) =>
              selectedItems.includes(`${group.id}`),
            ),
          );
        }}
        watch={watch}
      />

      <ScanningOptionsDiscarding
        modal={junkGroupSelectionModal}
        junkGroup={junkGroup}
        userAccessibleGroups={userAccessibleGroups}
        junkGroupSelectionChange={(selectedGroupId) => {
          setJunkGroup(
            userAccessibleGroups.find((group) =>
              selectedGroupId.includes(`${group.id}`),
            ),
          );
          junkGroupSelectionModal.current?.dismiss();
        }}
      />
      <div className="form-footer">
        <IonButton type="submit" shape="round">
          Scan
        </IonButton>
      </div>
    </form>
  );
};
