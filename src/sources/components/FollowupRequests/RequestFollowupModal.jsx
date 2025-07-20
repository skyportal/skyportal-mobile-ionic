import "./RequestFollowupModal.scss";

import React, { useEffect, useRef, useState } from "react";

import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";

import {
  useAllocationsApiClassname,
  useInstrumentForms,
  useUserAccessibleGroups,
  useUserProfile
} from "../../../common/common.hooks.js";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  useIonToast
} from "@ionic/react";
import {
  TextWidget,
  SelectWidget,
  FieldTemplate,
  ErrorListTemplate,
  DateWidget,
  CheckboxesWidget,
  CheckboxWidget,
  getSchemaOrder,
} from "../../../common/components/FormWidgets/FormWidgets.jsx";
import { warningOutline } from "ionicons/icons";
import { useSubmitFollowupRequest } from "../../sources.hooks.js";
import { formatIsoDateString } from "../../../common/common.lib.js";

/**
 * @param {object} props - The component props.
 * @param {string | undefined} props.sourceId - The object ID.
 * @param {function} props.submitRequestCallback - The callback function to handle when the request is submitted.
 * @param {React.MutableRefObject<any>} props.modal - The modal reference.
 */
export const RequestFollowupModal = ({ sourceId, submitRequestCallback, modal }) => {
  const { allocationsApiClassname } = useAllocationsApiClassname();
  const { userAccessibleGroups } = useUserAccessibleGroups();
  const { instrumentForms } = useInstrumentForms();
  const { userProfile } = useUserProfile();
  const defaultAllocationId = userProfile?.preferences?.followupDefault;

  const [selectedRequestType, setSelectedRequestType] = useState("triggered");
  /** @type {[number | undefined, React.Dispatch<React.SetStateAction<number | undefined>>]} */
  // @ts-ignore
  const [selectedAllocationId, setSelectedAllocationId] = useState(defaultAllocationId);
  /** @type {[number[], React.Dispatch<React.SetStateAction<number[]>>]} */
  // @ts-ignore
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [loading, setLoading] = useState(false);
  /** @type {[import("../../../common/common.lib.js").AllocationApiClassname[], React.Dispatch<React.SetStateAction<import("../../../common/common.lib.js").AllocationApiClassname[]>>]} */
  // @ts-ignore
  const [filteredAllocations, setFilteredAllocations] = useState([]);
  const [settingFilteredList, setSettingFilteredList] = useState(false);
  /** @type {React.MutableRefObject<any>} */
  const formRef = useRef(null);
  const submitFollowupRequestMutation = useSubmitFollowupRequest();

  let schema = null;
  let uiSchema = null;

  const [presentToast] = useIonToast();

  const noAllocationToast = async () => {
    await presentToast({
      message: "No allocation selected, please select one.",
      duration: 2000,
      position: "top",
      color: "danger",
      icon: warningOutline,
    });
  };

  // Set default group ids based on the selected allocation
  useEffect(() => {
    const getAllocations = async () => {
      if (!allocationsApiClassname) return;
      /** @type {Record<string, import("../../../common/common.lib.js").AllocationApiClassname>} */
      const tempAllocationLookUp = {};
      allocationsApiClassname?.forEach((allocation) => {
        tempAllocationLookUp[allocation.id] = allocation;
      });

      if (!selectedAllocationId) return;

      if ( tempAllocationLookUp[selectedAllocationId]?.default_share_group_ids?.length > 0
      ) {
        setSelectedGroupIds(
          tempAllocationLookUp[selectedAllocationId]?.default_share_group_ids,
        );
      } else {
        setSelectedGroupIds([
          tempAllocationLookUp[selectedAllocationId]?.group_id,
        ]);
      }
    };

    getAllocations().then();
  }, [setSelectedAllocationId, setSelectedGroupIds, allocationsApiClassname]);

  // Filter allocations based on the selected request type
  useEffect(() => {
    async function filterAllocations() {
      setSettingFilteredList(true);
      if (selectedRequestType === "triggered") {
        const filtered = (allocationsApiClassname || []).filter(
          (allocation) =>
            instrumentForms[allocation.instrument_id]?.formSchema !== null &&
            instrumentForms[allocation.instrument_id]?.formSchema !==
              undefined &&
            allocation.types.includes("triggered"),
        );
        setFilteredAllocations(filtered);
      } else if (selectedRequestType === "forced_photometry") {
        const filtered = (allocationsApiClassname || []).filter(
          (allocation) =>
            instrumentForms[allocation.instrument_id]
              ?.formSchemaForcedPhotometry !== null &&
            instrumentForms[allocation.instrument_id]
              ?.formSchemaForcedPhotometry !== undefined &&
            allocation.types.includes("forced_photometry"),
        );
        setFilteredAllocations(filtered);
      }
      setSettingFilteredList(false);
    }
    if (settingFilteredList === false && instrumentForms) {
      filterAllocations();
    }
  }, [allocationsApiClassname, instrumentForms, settingFilteredList, selectedRequestType]);

  /** @type {Record<string, import("../../../common/common.lib.js").Group>} */
  const groupLookUp = {};
  userAccessibleGroups?.forEach((group) => {
    groupLookUp[group.id] = group;
  });

  /** @type {Record<string, import("../../../common/common.lib.js").AllocationApiClassname>} */
  const allocationLookUp = {};
  allocationsApiClassname?.forEach((allocation) => {
    allocationLookUp[allocation.id] = allocation;
  });

  /** @param {number} allocationId */
  const handleSelectedAllocationChange = (allocationId) => {
    setSelectedAllocationId(allocationId);
    if (allocationLookUp[allocationId]?.default_share_group_ids?.length > 0) {
      setSelectedGroupIds(
        allocationLookUp[allocationId]?.default_share_group_ids,
      );
    } else {
      setSelectedGroupIds([allocationLookUp[allocationId]?.group_id]);
    }
  };

  /**
   * @param {object} props
   * @param {object} props.formData
   */
  const handleSubmit = async ({ formData }) => {
    setLoading(true);
    if (sourceId && selectedAllocationId) {
      await submitFollowupRequestMutation.mutateAsync({
        sourceId: sourceId,
        allocationId: selectedAllocationId,
        groupIds: selectedGroupIds,
        payload: formData,
      });
      submitRequestCallback(true);
    } else {
      noAllocationToast().then();
      submitRequestCallback(false);
    }
    setLoading(false);
  };

  /**
   * @param {{start_date: string, end_date: string}} formData
   * @param {{start_date: {addError: function}, end_date: {addError: function}}} errors
   */
  const validate = (formData, errors) => {
    if (formData?.start_date && formData?.end_date) {
      if (formData.start_date > formData.end_date) {
        errors.start_date.addError("Start Date must come before End Date");
      }
    }

    return errors;
  };

  // Set the schema and uiSchema based on the selected allocation
  if (selectedAllocationId) {
    schema =
      selectedRequestType === "forced_photometry"
        ? instrumentForms[allocationLookUp[selectedAllocationId].instrument_id]
            .formSchemaForcedPhotometry
        : instrumentForms[allocationLookUp[selectedAllocationId].instrument_id]
            .formSchema;
    uiSchema =
      instrumentForms[allocationLookUp[selectedAllocationId].instrument_id]
        .uiSchema;

    if (schema && schema.properties) {
      if (selectedRequestType === "forced_photometry") {
        const endDate = new Date();
        const startDate = new Date(
          endDate.getTime() - 30 * 24 * 60 * 60 * 1000,
        );
        if (schema.properties.start_date) {
          schema.properties.start_date.default = formatIsoDateString(startDate)
        }
        if (schema.properties.end_date) {
          schema.properties.end_date.default = formatIsoDateString(endDate)
        }
      } else {
        const { start_date, end_date } = schema.properties;
        if (start_date) {
          schema.properties.start_date.default = formatIsoDateString(new Date(), start_date.format);

          if (end_date) {
            const range =
              new Date(end_date.default).getTime() -
              new Date(start_date.default).getTime();
            schema.properties.end_date.default = formatIsoDateString(
              new Date(new Date().getTime() + range),
              end_date.format
            );
          }
        }
      }
    }
  }

  const noAllocations = (
    <IonList>
      <IonItem lines="none">
        <IonLabel color="secondary">
          {`No allocations with an API class ${
            selectedRequestType === "forced_photometry"
              ? "(forced photometry) "
              : ""
          } where found..`}
          .
        </IonLabel>
      </IonItem>
    </IonList>
  );

  const requestFollowupForm = (
    <div className="request-followup">
      <IonList>
        <IonItem color="light">
          <IonSelect
            label="Request Type"
            labelPlacement="stacked"
            interface="popover"
            value={selectedRequestType}
            onIonChange={(e) => {
              setSelectedRequestType(e.target.value);
              setSelectedAllocationId(defaultAllocationId);
              setFilteredAllocations([]);
            }}
          >
            <IonSelectOption value="triggered">Followup</IonSelectOption>
            <IonSelectOption value="forced_photometry">
              Forced Photometry
            </IonSelectOption>
          </IonSelect>
        </IonItem>
        {filteredAllocations.length === 0 ? (
          <IonItem lines="none">
            <IonLabel color="secondary">
              {`No allocations with an API class ${
                selectedRequestType === "forced_photometry"
                  ? "(forced photometry) "
                  : ""
              } where found..`}
              .
            </IonLabel>
          </IonItem>
        ) : (
          <>
            <IonItem color="light">
              <IonSelect
                label="Allocation"
                labelPlacement="stacked"
                placeholder="Select allocation"
                interface="modal"
                interfaceOptions={{
                  initialBreakpoint: 0.75,
                  breakpoints: [0, 0.25, 0.5, 0.75, 1],
                  expandToScroll: false,
                }}
                value={selectedAllocationId}
                onIonChange={(e) => handleSelectedAllocationChange(e.target.value)}
              >
                {filteredAllocations?.map((allocation) => (
                  <IonSelectOption
                    value={allocation.id}
                    key={allocation.id}
                    className="allocation-option"
                  >
                    {allocation.instrument?.telescope?.name + " / \n"}
                    {allocation.instrument?.name} -{" "}
                    {
                      userAccessibleGroups?.find(
                        (group) => group.id === allocation.group_id,
                      )?.name
                    }{" "}
                    (PI {allocation.pi})
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem color="light">
              <IonSelect
                label="Share Data With"
                multiple
                labelPlacement="stacked"
                interface="popover"
                value={selectedGroupIds}
                onIonChange={(e) => setSelectedGroupIds(e.detail.value)}
                selectedText={
                  selectedGroupIds.length > 3
                    ? selectedGroupIds.length + " groups"
                    : selectedGroupIds.map((id) => groupLookUp[id]?.name).join(", ")
                }
              >
                {userAccessibleGroups?.map((group) => (
                  <IonSelectOption value={group.id} key={group.id}>
                    {group.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            {selectedAllocationId && (
              <IonItem>
                <IonLabel color="secondary">
                  {allocationLookUp[selectedAllocationId].instrument.name} instrument form
                </IonLabel>
              </IonItem>
            )}
          </>
        )}
      </IonList>
      { selectedAllocationId && (!schema || !schema.properties ? (
        <IonList>
          <IonItem lines="none">
            <IonLabel color="secondary">
              {`No schema found for the selected allocation.`}
            </IonLabel>
          </IonItem>
        </IonList>
      ) : (
        <Form
          schema={schema || {}}
          validator={validator}
          uiSchema={{
            ...uiSchema,
            "ui:submitButtonOptions": { norender: true },
            "ui:order": getSchemaOrder(schema),
          }}
          // @ts-ignore
          customValidate={validate}
          // @ts-ignore
          onSubmit={handleSubmit}
          disabled={loading}
          className="form"
          widgets={{
            // @ts-ignore
            CheckboxesWidget: CheckboxesWidget,
            // @ts-ignore
            CheckboxWidget: CheckboxWidget,
            // @ts-ignore
            SelectWidget: SelectWidget,
            // @ts-ignore
            TextWidget: TextWidget,
            // @ts-ignore
            DateWidget: DateWidget,
          }}
          templates={{
            // @ts-ignore
            FieldTemplate: FieldTemplate,
            ErrorListTemplate: ErrorListTemplate,
          }}
          ref={formRef}
          onError={() => {
            presentToast({
              message: "Error on form submission, please check the fields.",
              duration: 3000,
              position: "top",
              color: "danger",
              icon: warningOutline,
            }).then();
            submitRequestCallback(false);
          }}
        />
      ))}
      <IonLoading isOpen={loading} message={"Submitting..."} />
    </div>
  );

  return (
    <IonModal
      ref={modal}
      isOpen={false}
      onDidDismiss={() => modal.current?.dismiss()}
      keepContentsMounted={true}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="secondary">
            <IonButton color="secondary" onClick={() => modal.current?.dismiss()}>Close</IonButton>
          </IonButtons>
          <IonTitle>Request Follow-Up</IonTitle>
          <IonButtons slot="primary">
            <IonButton
              fill="solid"
              color="primary"
              onClick={() => {
                if (selectedAllocationId) {
                  formRef.current?.submit();
                } else {
                  noAllocationToast().then();
                  submitRequestCallback(false);
                }
              }}>
              Submit
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {filteredAllocations.length > 0 ? requestFollowupForm : noAllocations}
      </IonContent>
    </IonModal>
  );
};
