import axios from "axios"

export const getEnv = () => {
    return axios.get('/env')
}