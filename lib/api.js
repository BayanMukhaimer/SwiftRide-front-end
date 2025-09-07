import axios from "axios";
const baseUrl = import.meta.env.VITE_BACKEND_URL;

const authHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please log in.");
  return { Authorization: `Bearer ${token}` };
};

const createRide = async (data) => {
  try {
    const url = `${baseUrl}/rides/request`;
    const response = await axios.post(url, data, { headers: authHeader() });
    return response.data; // return the actual data
  } catch (error) {
    return error.response?.data || error;
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

const updateAcceptRide = async (rideId, data, token) => {
  try {
    const url = `${baseUrl}/rides/${rideId}/accept`;
    const response = await axios.put(url, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
     throw (error.response?.data || error);
  }
};


const getRideById = async (id) => {
  try {
    const url = `${baseUrl}/rides/${id}`;
    const response = await axios.get(url, { headers: authHeader() });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


export { createRide, getAllRide, updateAcceptRide, cancelRide, getRideById  };
