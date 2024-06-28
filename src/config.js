const mode = import.meta.env.MODE;

export default {
  SKIP_ONBOARDING:
    mode === "development" && import.meta.env.VITE_SKIP_ONBOARDING,
  TOKEN: import.meta.env.VITE_SKYPORTAL_TOKEN,
  INSTANCE_URL: import.meta.env.VITE_INSTANCE_URL,
  INSTANCE_NAME: import.meta.env.VITE_INSTANCE_NAME,
};
