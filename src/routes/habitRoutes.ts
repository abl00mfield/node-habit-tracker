import { Router } from "express";
import { validateBody, validateParams, validateQuery } from "../middleware/validation.ts";
import {z} from 'zod'
import { authenticateToken } from "../middleware/auth.ts";
import { createHabit, getUserHabits } from "../controllers/habitController.ts";

const createHabitSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    frequency: z.string(),
    targetCount: z.string(),
    tagIds: z.array(z.string()).optional()
})

const completeParamsSchema = z.object({
    id: z.string(),
})

const router = Router()
router.use(authenticateToken)

router.get('/', getUserHabits)

router.get('/:id', (req, res) => {
    res.json({ message: 'got one habit' })
})

router.post('/', validateBody(createHabitSchema), createHabit) 
    

router.delete('/:id', (req, res) => {
    res.json({ message: 'deleted habit' })
})

router.post('/:id/complete', validateParams(completeParamsSchema), validateBody(createHabitSchema),(req, res) => {
    res.json({ messge: 'completed habit' })
})

export default router