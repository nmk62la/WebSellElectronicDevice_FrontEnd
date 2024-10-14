import { get } from "@/lib/httpClient";

export const getAllUser = (page, tab, sortDate, sortName) => {
  try {
    const response = get(`/api/v1/users/customers?page=${page}&size=8&tab=${tab}&date=${sortDate}&name=${sortName}`);
    return response;
  } catch (error) {
    console.error("Error during authentication:", error);
    throw error;
  }
};


export const getUserById = (userId) => {
  try {
    const response = get(`/api/v1/users/${userId}`);
    return response;
  } catch (error) {
    console.error("Error during authentication:", error);
    throw error;
  }
}