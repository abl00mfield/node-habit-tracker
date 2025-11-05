import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { db } from '../db/connection.ts'
import { habits, entries, habitTags, tags } from '../db/schema.ts'
import { eq, and, desc, inArray } from 'drizzle-orm'

export const createHabit = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, description, frequency, targetCount, tagIds } = 
            req.body
        
        const result = await db.transaction(async (tx) => {
            const [newHabit] = await tx.insert(habits).values({
                userId: req.user.id,
                name,
                description,
                frequency,
                targetCount,
            }).returning()

            if (tagIds && tagIds.length > 0) {
                const habitTagValues = tagIds.map((tagId) => ({
                    habitId: newHabit.id,
                    tagId
                }))
                await tx.insert(habitTags).values(habitTagValues)
            }

            return newHabit
        })
        res.status(201).json({
            message: 'Habit Created',
            habit: result,
        })
    } catch (e) {
        console.error('Create Habit Error', e)
        res.status(500).json({error: 'Failed to create Habit'})
    }
}

export const getUserHabits = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userHabitWithTags = await db.query.habits.findMany({
            where: eq(habits.userId, req.user.id),
            with: {
                habitTags: {
                    with: {
                        tag: true,
                    }
                }
            },
            orderBy: [desc(habits.createdAt)],
        })

        const habitsWithTags = userHabitWithTags.map(habit => ({
            ...habit,
            tags: habit.habitTags.map((ht) => ht.tag),
            habitTags: undefined,
        }))

        res.json({
            habits: habitsWithTags
        })

    } catch (e) {
        console.error('Get Habits Error', e)
        res.status(500).json({error: 'Failed to get Habits'})
    }
}

export const updateHabit = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id
        const { tagIds, ...updates } = req.body
        
        const result = await db.transaction(async (tx) => {
            const [updatedHabit] = await tx
                .update(habits)
                .set({...updates, updateAt: new Date() })
                .where(and(eq(habitTags.id, id), eq(habits.userId, req.user.id)))
                .returning()            
            
            if (!updatedHabit) {
                return res.status(401).end()
            }

            if (tagIds != undefined) {
                await tx.delete(habitTags).where(eq(habitTags.habitId, id))

                if (tagIds.length > 0) {
                    const habitTagValues = tagIds.map((tagId) => ({
                        habitId: id,
                        tagId,
                    }))
                    await tx.insert(habitTags).values(habitTagValues)
                }
            }
            return updatedHabit
        })

        res.json({
            message: 'Habit was updated',
            habit: result,
        })
    } catch (e) {
        console.error('Update habits error', e)
        res.status(500).json({error: 'Failed to fetch habits'})

    }
}