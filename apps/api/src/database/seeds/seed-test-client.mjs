/**
 * Seed a test client user in Supabase Auth + local users table.
 *
 * Usage: node apps/api/src/database/seeds/seed-test-client.mjs
 * Run from project root with .env loaded.
 */
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '..', '..', '..', '..', '.env') });

const CLIENT_EMAIL = 'client@test.com';
const CLIENT_PASSWORD = 'Client123!';
const CLIENT_NAME = 'Sarah Chen';

const { Client } = pg;

async function seedClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  if (!supabaseUrl || !supabaseKey || !databaseUrl) {
    console.error('Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Create client in Supabase Auth
  console.log(`Creating test client user: ${CLIENT_EMAIL}`);

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === CLIENT_EMAIL);

  let supabaseUserId;
  if (existing) {
    console.log('Test client already exists in Supabase Auth, skipping creation.');
    supabaseUserId = existing.id;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: CLIENT_EMAIL,
      password: CLIENT_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: CLIENT_NAME, role: 'client' },
    });

    if (error) {
      console.error('Failed to create client in Supabase:', error.message);
      process.exit(1);
    }

    supabaseUserId = data.user.id;
    console.log(`Created client in Supabase Auth: ${supabaseUserId}`);
  }

  // 2. Create client in local users table
  const dbClient = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await dbClient.connect();

    const check = await dbClient.query('SELECT id FROM users WHERE supabase_id = $1', [supabaseUserId]);

    if (check.rows.length > 0) {
      console.log('Test client already exists in local DB, skipping.');
    } else {
      await dbClient.query(
        `INSERT INTO users (supabase_id, email, full_name, role, is_active)
         VALUES ($1, $2, $3, 'client', true)`,
        [supabaseUserId, CLIENT_EMAIL, CLIENT_NAME],
      );
      console.log('Created test client in local users table.');
    }

    console.log('\n--- Test Client Account ---');
    console.log(`Email:    ${CLIENT_EMAIL}`);
    console.log(`Password: ${CLIENT_PASSWORD}`);
    console.log('Role:     client');
  } finally {
    await dbClient.end();
  }
}

seedClient().catch(console.error);
