import { Router } from "express";
import { validateBody, validateParams, validateQuery } from "../middleware/validation.ts";
import {z} from 'zod'
import { authenticateToken } from "../middleware/auth.ts";
import { createHabit, deleteHabit, getHabitById, getUserHabits, updateHabit } from "../controllers/habitController.ts";

const createHabitSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    frequency: z.string(),
    targetCount: z.number(),
    tagIds: z.array(z.string()).optional()
})

const completeParamsSchema = z.object({
    id: z.string(),
})

const router = Router()
router.use(authenticateToken)

router.get('/', getUserHabits)

router.get('/:id', getHabitById)

router.post('/', validateBody(createHabitSchema), createHabit) 
router.put('/:id', updateHabit)
    

router.delete('/:id', deleteHabit)

router.post('/:id/complete', validateParams(completeParamsSchema), validateBody(createHabitSchema),(req, res) => {
    res.json({ messge: 'completed habit' })
})

export default router