import React, { useState } from 'react'
import { FaRegEyeSlash } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';
import fetchUserDetails from '../utils/fetchUserDetails';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';

const AdminLogin = () => {
    const [data, setData] = useState({
        email: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleChange = (e) => {
        const { name, value } = e.target

        setData((preve) => {
            return {
                ...preve,
                [name]: value
            }
        })
    }

    const valideValue = Object.values(data).every(el => el)


    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await Axios({
                ...SummaryApi.admin_login,
                data: data
            })

            if (response.data.error) {
                toast.error(response.data.message)
            }

            if (response.data.success) {
                toast.success(response.data.message)
                localStorage.setItem('accesstoken', response.data.data.accesstoken)
                localStorage.setItem('refreshToken', response.data.data.refreshToken)

                const userDetails = await fetchUserDetails()
                dispatch(setUserDetails(userDetails.data))

                setData({
                    email: "",
                    password: "",
                })
                navigate("/dashboard/profile")
            }

        } catch (error) {
            AxiosToastError(error)
        }



    }
    return (
        <section className="flex items-center justify-center min-h-screen bg-black">
            <div className="bg-gray-900 my-4 w-full max-w-lg mx-auto rounded-lg p-7 shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-6 text-white">
                    Admin Login
                </h2>

                <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="grid gap-1">
                        <label htmlFor="email" className="text-gray-300">Email :</label>
                        <input
                            type="email"
                            id="email"
                            className="bg-gray-800 text-white placeholder-gray-400 p-2 border border-gray-700 rounded outline-none focus:border-green-500"
                            name="email"
                            value={data.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                        />
                    </div>

                    {/* Password */}
                    <div className="grid gap-1">
                        <label htmlFor="password" className="text-gray-300">Password :</label>
                        <div className="bg-gray-800 text-white p-2 border border-gray-700 rounded flex items-center focus-within:border-green-500">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className="w-full outline-none bg-transparent placeholder-gray-400"
                                name="password"
                                value={data.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                            />
                            <div
                                onClick={() => setShowPassword(prev => !prev)}
                                className="cursor-pointer text-gray-400 ml-2"
                            >
                                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                            </div>
                        </div>
                        <Link
                            to={"/forgot-password"}
                            className="block ml-auto text-sm text-gray-400 hover:text-green-500"
                        >
                            Forgot password ?
                        </Link>
                    </div>

                    {/* Button */}
                    <button
                        disabled={!valideValue}
                        className={`${valideValue
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-600 cursor-not-allowed"
                            } text-white py-2 rounded-lg font-semibold my-3 tracking-wide transition duration-200`}
                    >
                        Login
                    </button>
                </form>
            </div>
        </section>

    )
}

export default AdminLogin

