import axios from "axios"
const baseUrl = import.meta.env.VITE_BACKEND_URL

const createRide = async (data) => {
    try{
        const url = `${baseUrl}/rides/request`
        const response = await axios.post(url, data)
        return response
    }catch(error){
        return error
    }
}

export {
    createRide,
}