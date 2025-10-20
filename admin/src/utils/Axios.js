import axios from "axios";
import SummaryApi , { baseURL } from "../common/SummaryApi";

const Axios = axios.create({
    baseURL : baseURL,
    withCredentials : true
})

//sending access token in the header
Axios.interceptors.request.use(
    async(config)=>{
        const admin_accessToken = localStorage.getItem('admin_accesstoken')

        if(admin_accessToken){
            config.headers.Authorization = `Bearer ${admin_accessToken}`
        }

        return config
    },
    (error)=>{
        return Promise.reject(error)
    }
)

//extend the life span of access token with 
// the help refresh
Axios.interceptors.request.use(
    (response)=>{
        return response
    },
    async(error)=>{
        let originRequest = error.config 

        if(error.response.status === 401 && !originRequest.retry){
            originRequest.retry = true

            const admin_refreshToken = localStorage.getItem("admin_refreshToken")

            if(admin_refreshToken){
                const newAccessToken = await refreshAccessToken(admin_refreshToken)

                if(newAccessToken){
                    originRequest.headers.Authorization = `Bearer ${newAccessToken}`
                    return Axios(originRequest)
                }
            }
        }
        
        return Promise.reject(error)
    }
)


const refreshAccessToken = async(refreshToken)=>{
    try {
        const response = await Axios({
            ...SummaryApi.refreshToken,
            headers : {
                Authorization : `Bearer ${refreshToken}`
            }
        })

        const admin_accessToken = response.data.data.admin_accessToken
        localStorage.setItem('admin_accesstoken',admin_accessToken)
        return admin_accessToken
    } catch (error) {
        console.log(error)
    }
}

export default Axios