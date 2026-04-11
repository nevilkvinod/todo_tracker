import { Client } from 'pg';

async function main() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_DYwztUiB41Jp@ep-icy-sea-a1hafgez.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
  });
  await client.connect();
  const res = await client.query(`
    select indexname, indexdef 
    from pg_indexes 
    where tablename = 'User';
  `);
  console.log("Indexes:");
  console.table(res.rows);

  const users = await client.query(`SELECT id, email, "deletedAt" FROM "User"`);
  console.log("Users:");
  console.table(users.rows);

  process.exit(0);
}
main();
