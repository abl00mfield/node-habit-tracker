import { db } from '../../src/db/connection.ts'
import { users, habits, entries, tags, habitTags } from '../../src/db/schema.ts'
import { sql } from 'drizzle-orm'
import { execSync } from 'child_process'

export default async function setup() {
    console.log('Setting up the test DB')
    try {
        await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`)
        await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`)
        await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`)
        await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`)
        await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`)

        console.log('Pushing scheme using drizzle-kit')
        execSync(
            `npx drizzle-kit push --url="${process.env.DATABASE_URL}" --schema="./src/db/schema.ts" --dialect="postgresql"`,
            {
                stdio: 'inherit',
                cwd: process.cwd(),
            }
        )
        console.log('Test DB created')
    } catch (e) {
        console.error('failed to set up tst DB', e)
        throw e
    }

    return async () => {
        try {
            await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`)
            await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`)
            await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`)
            await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`)
            await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`)
            process.exit(0)
        } catch (e) {
            console.error('failed to set up tst DB', e)
            throw e
        }
    }
}