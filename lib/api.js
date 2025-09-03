import axios from "axios"
const baseUrl = import.meta.env.VITE_BACKEND_URL

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};


const createRide = async (data) => {
    try{
        const url = `${baseUrl}/rides/request`
        const response = await axios.post(url, data, { headers: authHeader() })
        return response
    }catch(error){
        return error
    }
}

const getAllRide = async () => {
    try {
        const url = `${baseUrl}/api/rides/myrides`
        const response = await axios.get(url, { headers: authHeader() })
        return response
    } catch (error) {
        return error
    }
}



export {
    createRide,
    getAllRide,
    
}