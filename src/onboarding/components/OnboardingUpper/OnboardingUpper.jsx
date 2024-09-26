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
      case "welcome":
        return (
          <p>
            Welcome back to SkyPortal Mobile
            <br />
            An Astronomical Data Platform
          </p>
        );
      case "login":
        return <p>Please select a SkyPortal instance and a login method</p>;
      default:
        return (
          <p>
            Welcome back to SkyPortal Mobile
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
