import axios from "axios";
const baseUrl = import.meta.env.VITE_BACKEND_URL;

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const createRide = async (data) => {
  try {
    const url = `${baseUrl}/rides/request`;
    const response = await axios.post(url, data, { headers: authHeader() });
    return response.data; // return the actual data
  } catch (error) {
    return error;
  }
};

const getAllRide = async () => {
  try {
    const url = `${baseUrl}/rides/myrides`;
    const response = await axios.get(url, { headers: authHeader() });
    return response;
  } catch (error) {
    return error;
  }
};

const cancelRide = async (id) => {
  try {
    const url = `${baseUrl}/rides/${id}/cancel`;
    const response = await axios.delete(url, { headers: authHeader() });
    return response.data;
  } catch (error) {
    return error;
  }
};
const updateacceptRide = async (id, data) => {
  try {
    const url = `${baseUrl}/rides/${id}/accept`;
    const response = await axios.put(url, {}, { headers: authHeader() });
    return response;
  } catch (error) {
    return error;
  }
};

export { createRide, getAllRide, cancelRide, authHeader, updateacceptRide };
