import "./ErrorMessage.scss";

/**
 * Helper component for displaying form errors
 * @param {Object} props
 * @param {Partial<import("react-hook-form").FieldErrorsImpl<import("react-hook-form").DeepRequired<import("react-hook-form").FieldValues>>> & {root?: Record<string, import("react-hook-form").GlobalError> & import("react-hook-form").GlobalError}} props.errors
 * @param {string} props.name
 * @returns {JSX.Element|undefined}
 */
export const ErrorMessage = ({ errors, name }) => {
  if (errors[name]?.type) {
    if (errors[name]?.message) {
      return <p className="error">{`${errors[name]?.message}`}</p>;
    }
    switch (errors[name]?.type) {
      case "required":
        return <p className="error">This field is required</p>;
      default:
        return <p className="error">This field is invalid</p>;
    }
  }
};
