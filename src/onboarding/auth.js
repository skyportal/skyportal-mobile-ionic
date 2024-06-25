import { CapacitorHttp } from "@capacitor/core";
import { mockUser } from "../../config.js";

export const checkToken = async (token, instance, platform) => {
  // const response = await axios.get(`${instance.url}/api/internal/profile`, {
  //   headers: {
  //     Authorization: `token ${token}`,
  //   },
  // });
  // return response.data.data;
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
