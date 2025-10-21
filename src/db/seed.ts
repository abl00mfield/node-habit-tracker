import { db } from './connection.ts'
import { users, habits, entries, tags, habitTags } from './schema.ts'

const seed = async () => {
    console.log('starting database seed')

    try {
        console.log('clearing existing data...')
        await db.delete(entries)
        await db.delete(habitTags)
        await db.delete(habits)
        await db.delete(tags)
        await db.delete(users)

        console.log('creating demo users')
        const [demoUser] = await db.insert(users).values({
            email: 'demo@app.com',
            password: 'password',
            firstName: 'demo',
            lastName: 'person',
            username: 'demo',
        }).returning()

        console.log('creating tags...')

        const [healthTag] = await db.insert(tags).values({
            name: 'Health',
            color: '#fff'
        }).returning()

        const [exerciseHabit] = await db.insert(habits).values({
            userId: demoUser.id,
            name: 'Exercise',
            description: 'Daily workout',
            frequency: 'daily',
            targetCount: 1,
        }).returning()

        await db.insert(habitTags).values({
            habitId: exerciseHabit.id,
            tagId: healthTag.id,
        })
        
        console.log('Adding completion entries')

        const today = new Date()
        today.setHours(12, 0, 0)
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            await db.insert(entries).values({
                habitId: exerciseHabit.id,
                completionDate: date,
            })
        }

        console.log('database seeded sucessfully')
        console.log(`username: ${demoUser.username}`)
        console.log(`password: ${demoUser.password}`)
        console.log(`email: ${demoUser.email}`)        

    } catch (e) {
        console.error('seed failed', e)
        process.exit(1)

    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    seed()
        .then(() => process.exit(0))
        .catch((e) => process.exit(1))
}

export default seed
