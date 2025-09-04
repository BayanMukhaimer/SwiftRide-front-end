import axios from "axios"
const baseUrl = import.meta.env.VITE_BACKEND_URL

const createRide = async (data, token) => {
  try {
    const url = `${baseUrl}/rides/request`;
    const response = await axios.post(url, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // return the actual data
  } catch (error) {
    return error.response?.data || error;
  }
}

export {
    createRide,
}