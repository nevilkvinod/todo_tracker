const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_DYwztUiB41Jp@ep-icy-sea-a1hafgez.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to Neon DB.");
    await client.query(`DROP INDEX IF EXISTS "User_email_key";`);
    console.log("Dropped standard index.");
    await client.query(`CREATE UNIQUE INDEX "User_email_key" ON "User"("email") WHERE "deletedAt" IS NULL;`);
    console.log("Created partial unique index.");
  } catch (err) {
    console.error("Error executing SQL:", err.message);
  } finally {
    await client.end();
  }
}

run();
