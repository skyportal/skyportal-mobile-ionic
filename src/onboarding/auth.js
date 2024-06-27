import { CapacitorHttp } from "@capacitor/core";
import mockUser from "../../mock/user.json";

export const checkToken = async (token, instance, platform) => {
  if (platform === "web") {
    return mockUser;
  }
  const response = await CapacitorHttp.get({
    url: `${instance.url}/api/internal/profile`,
    headers: {
      Authorization: `token ${token}`,
    },
  });
  return response.data.data;
};
