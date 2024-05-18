import { CapacitorHttp } from "@capacitor/core";

export const checkToken = async (token, instance) => {
  // const response = await axios.get(`${instance.url}/api/internal/profile`, {
  //   headers: {
  //     Authorization: `token ${token}`,
  //   },
  // });
  // return response.data.data;
  const response = await CapacitorHttp.get({
    url: `${instance.url}/api/internal/profile`,
    headers: {
      Authorization: `token ${token}`,
    },
  });
  return response.data;
};
