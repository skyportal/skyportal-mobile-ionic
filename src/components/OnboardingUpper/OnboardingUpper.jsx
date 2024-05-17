import "./OnboardingUpper.scss";

const OnboardingUpper = ({ page }) => {
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
        <img src="/images/logo.png" alt="logo" />
        <h1>SkyPortal</h1>
      </div>
      <div className="tagline">{getTagline()}</div>
    </div>
  );
};

export default OnboardingUpper;
