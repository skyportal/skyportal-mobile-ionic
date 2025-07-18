import "./OnboardingUpper.scss";
import { useContext } from "react";
import { AppContext } from "../../../common/common.context.js";
import { isActuallyDarkMode } from "../../../common/common.lib.js";

/**
 * @param {Object} props
 * @param {import("../../onboarding.lib.js").OnboardingPage} props.page
 * @returns {JSX.Element}
 */
const OnboardingUpper = ({ page }) => {
  const { darkMode } = useContext(AppContext);

  function getTagline() {
    switch (page) {
      case "login":
        return <p>Select an instance<br />and a login method</p>;
      case "type_token":
        return <p>Enter your token to<br />access SkyPortal Mobile</p>;
      default:
        return (
          <p>
            Welcome to SkyPortal Mobile
            <br />
            An Astronomical Data Platform
          </p>
        );
    }
  }

  return (
    <div className="upper">
      <div className="logo-n-text">
        <img
          src={
            isActuallyDarkMode(darkMode)
              ? "/images/logo_n_text_dark.png"
              : "/images/logo_n_text.png"
          }
          alt="logo"
        />
      </div>
      <div className="tagline">{getTagline()}</div>
    </div>
  );
};

export default OnboardingUpper;
