import { Router } from 'express'
import { login, register } from '../controllers/authController.ts'
import { validateBody } from '../middleware/validation.ts'
import { insertUserSchema } from '../db/schema.ts'
import {z} from 'zod'
const router = Router()

const loginSchema = z.object({
    email: z.email('Invalid email'),
    password: z.string().min(1, 'Password required'),
})

router.post('/register', validateBody(insertUserSchema), register)


router.post('/login', validateBody(loginSchema), login)


export default router