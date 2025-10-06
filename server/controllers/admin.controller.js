import UserModel from '../models/user.model.js'
import bcryptjs from 'bcryptjs'
import generatedAccessToken from '../utils/generatedAccessToken.js'
import genertedRefreshToken from '../utils/generatedRefreshToken.js'


export async function AdminloginController(request, response) {
    try {
        const { email, password } = request.body


        if (!email || !password) {
            return response.status(400).json({
                message: "provide email, password",
                error: true,
                success: false
            })
        }

        const admin = await UserModel.findOne({ email })

        if (!admin) {
            return response.status(400).json({
                message: "Admin not found",
                error: true,
                success: false
            })
        }

        if (admin.role !== "ADMIN") {
            return res.status(400).json({
                message: "You do not have admin rights",
                error: true,
                success: false,
            });
        }


        const checkPassword = await bcryptjs.compare(password, admin.password)

        if (!checkPassword) {
            return response.status(400).json({
                message: "Check your password",
                error: true,
                success: false
            })
        }

        const accesstoken = await generatedAccessToken(admin._id)
        const refreshToken = await genertedRefreshToken(admin._id)

        const updateUser = await UserModel.findByIdAndUpdate(admin?._id, {
            last_login_date: new Date()
        })

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }
        response.cookie('accessToken', accesstoken, cookiesOption)
        response.cookie('refreshToken', refreshToken, cookiesOption)

        return response.json({
            message: "Login successfully",
            error: false,
            success: true,
            data: {
                accesstoken,
                refreshToken
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: "Not Admin",
            error: true,
            success: false
        })
    }
}


//logout controller
export async function AdminlogoutController(request, response) {
    try {
        const userid = request.userId //middleware

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.clearCookie("accessToken", cookiesOption)
        response.clearCookie("refreshToken", cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, {
            refresh_token: ""
        })

        return response.json({
            message: "Logout successfully", //Nếu role ko phải Admin
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
