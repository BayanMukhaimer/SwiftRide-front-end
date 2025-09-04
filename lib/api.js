import axios from "axios"
const baseUrl = import.meta.env.VITE_BACKEND_URL


const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};


const createRide = async (data) => {
  try {
    const url = `${baseUrl}/rides/request`;
    const response = await axios.post(url, data, { headers: authHeader() })
    return response.data; // return the actual data
  } catch (error) {
    return error.response?.data || error;
  }

}

const getAllRide = async () => {
    try {
        const url = `${baseUrl}/rides/myrides`
        const response = await axios.get(url, { headers: authHeader() })
        return response
    } catch (error) {
        return error
    }
}

const cancelRide = async (id) => {
    try {
        const url = `${baseUrl}/${id}/cancel`
        const response = await axios.delete(url)
        return response
    } catch (error) {
        return error
    }
}



export {
  createRide,
  getAllRide,
  cancelRide,
    
}