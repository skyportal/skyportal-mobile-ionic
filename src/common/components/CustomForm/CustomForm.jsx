import "./CustomForm.scss"
import {
  IonDatetime,
  IonDatetimeButton,
  IonInput,
  IonItem,
  IonLabel, IonModal,
  IonNote,
  IonSelect,
  IonSelectOption
} from "@ionic/react";
import React from "react";


/**
 * @param {object} props
 * @param {string} props.id - The id of the widget
 * @param {{ enumOptions: { label: string, value: string }[] }} props.options - The options for the widget
 * @param {any} props.value - The value of the widget
 * @param {boolean} props.required - Whether the widget is required
 * @param {boolean} props.disabled - Whether the widget is disabled
 * @param {boolean} props.readonly - Whether the widget is readonly
 * @param {string} props.label - The label of the widget
 * @param {function} props.onChange - The function to call when the value changes
 */
export const SelectWidget = ({id, options, value, required, disabled, readonly, label, onChange}) => {
  const { enumOptions } = options;

  return (
    <IonSelect
      id={id}
      label={label}
      labelPlacement="stacked"
      value={value}
      onIonChange={(e) => onChange(e.detail.value)}
      disabled={disabled || readonly}
      interface="popover"
      required={required}
    >
      {enumOptions.map((opt) => (
        <IonSelectOption key={opt.value} value={opt.value}>
          {opt.label}
        </IonSelectOption>
      ))}
    </IonSelect>
  );
};

/**
 * @param {object} props
 * @param {any} props.value - The value of the widget
 * @param {function} props.onChange - The function to call when the value changes
 * @param {{ title: string }} props.schema - The schema of the widget with the placeholder
 * @param {string} props.id - The id of the widget
 * @param {string} props.label - The label of the widget
 */
export const TextWidget = ({ value, onChange, schema, id, label }) => {
  return (
    <IonInput
      label={label}
      labelPlacement="stacked"
      id={id}
      value={value || ''}
      onIonChange={(e) => onChange(e.detail.value)}
      placeholder={schema?.title || ''}
    />
  );
};


/**
 * @param {object} props
 * @param {any} props.value - The value of the widget
 * @param {function} props.onChange - The function to call when the value changes
 * @param {string} props.id - The id of the widget
 * @param {string} props.label - The label of the widget
 */
export const DateWidget = ({ value, onChange, id, label }) => {
  return (
    <>
      <IonLabel position="stacked">{label}</IonLabel>
      <IonDatetimeButton datetime={id + "_datetime"}/>
      <IonModal keepContentsMounted={true}>
        <IonDatetime
          id={id + "_datetime"}
          value={value || ""}
          onIonChange={(e) => onChange(e.detail.value)}
          presentation="date"
        />
      </IonModal>
    </>
  );
};

/**
 * @param {object} props
 * @param {string} props.id - The id of the field
 * @param {string} props.classNames - The class names of the field
 * @param {string} props.label - The label of the field
 * @param {string} props.errors - The errors of the field
 * @param {React.ReactNode} props.children - The children of the field
 */
export const FieldTemplate = ({ id, classNames, label, errors, children }) => {
  const isArray = classNames.includes("field-array");
  return id === "root" ? (
    <div className={classNames} id={id}>
      {children}
    </div>
  ) : (
      <IonItem className={classNames} id={id} color="light">
        <div className="field-template-item">
          {isArray && <IonLabel position="stacked">{label}</IonLabel>}
          {children}
          {errors && <IonNote color="danger">{errors}</IonNote>}
        </div>
      </IonItem>
  );
};

export const ErrorListTemplate = () => null;