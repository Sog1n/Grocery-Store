import { Router } from 'express'
import { AdminloginController, AdminlogoutController } from '../controllers/admin.controller.js'
import auth from '../middleware/auth.js'
import { admin as requireAdmin } from '../middleware/Admin.js'

const adminRouter = Router()

adminRouter.post('/login',AdminloginController) //admin login
adminRouter.get('/logout',auth,requireAdmin,AdminlogoutController) //admin logout



export default adminRouter