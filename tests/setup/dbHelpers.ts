import { db } from '../../src/db/connection.ts'
import { users, habits, entries, tags, type NewUser, type NewHabit, habitTags} from '../../src/db/schema.ts'
import { generateToken } from '../../src/utils/jwt.ts'
import { hashPassword } from '../../src/utils/passwords.ts'

export const createTestUser = async (userData: Partial<NewUser> = {}) => {
    const defaultUser = {
        email: `test-${Math.random()}@example.com`,
        username: `testUser-${Math.random()}`,
        password: 'adminpassword1234',
        firstName: 'Test',
        lastName: 'User',
        ...userData,
    }

    const hashedPassword = await hashPassword(defaultUser.password)
    const [user] = await db
        .insert(users)
        .values({ ...defaultUser, password: hashedPassword })
        .returning()
    
    const token = generateToken({
        id: user.id,
        email: user.email,
        username: user.username,
    })

    return {token, user, rawPassword: defaultUser.password}

}

export const createTestHabit = async (userId: string, habitData: Partial<NewHabit> = {}) => {
    const defaultData = {
        name: `Test habit ${Date.now()}`,
        description: 'A test habit',
        frequency: 'daily',
        targetCount: 1,
        ...habitData
    }

    const [habit] = await db.insert(habits).values({
        userId,
        ...defaultData,
    }).returning()

    return habit
}

export const cleanupDatabase = async () => {
    await db.delete(entries)
    await db.delete(habits)
    await db.delete(users)   
    await db.delete(habitTags)
    await db.delete(tags)

}