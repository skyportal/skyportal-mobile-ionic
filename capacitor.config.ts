import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.skyportal.app",
  appName: "SkyPortal",
  webDir: "dist",
  ...(process.env.LIVE_RELOAD && {
    server: {
      url: "http://localhost:8100",
      cleartext: true,
    },
  }),
};

export default config;
