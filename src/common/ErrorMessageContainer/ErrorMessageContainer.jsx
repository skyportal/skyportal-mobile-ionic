import { ErrorMessage } from "../ErrorMessage/ErrorMessage.jsx";

/**
 * Container for error messages
 * @param {Object} props
 * @param {Partial<import("react-hook-form").FieldErrorsImpl<import("react-hook-form").DeepRequired<import("react-hook-form").FieldValues>>> & {root?: Record<string, import("react-hook-form").GlobalError> & import("react-hook-form").GlobalError}} props.errors
 * @param {string[]} props.errorNames
 * @returns {JSX.Element|undefined}
 */
export const ErrorMessageContainer = ({ errors, errorNames }) => {
  if (errorNames.some((name) => errors[name])) {
    return (
      <div className="error-message-container">
        {errorNames.map((name) => (
          <ErrorMessage key={name} errors={errors} name={name} />
        ))}
      </div>
    );
  }
};
