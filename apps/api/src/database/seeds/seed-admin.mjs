/**
 * Seed an admin user in Supabase Auth + local users table.
 *
 * Usage: node apps/api/src/database/seeds/seed-admin.mjs
 * Run from project root with .env loaded.
 */
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '..', '..', '..', '..', '.env') });

const ADMIN_EMAIL = 'admin@maewinphoto.com';
const ADMIN_PASSWORD = 'Admin123!';
const ADMIN_NAME = 'Mae Win';

const { Client } = pg;

async function seedAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  if (!supabaseUrl || !supabaseKey || !databaseUrl) {
    console.error('Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Create admin in Supabase Auth
  console.log(`Creating admin user: ${ADMIN_EMAIL}`);

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === ADMIN_EMAIL);

  let supabaseUserId;
  if (existing) {
    console.log('Admin already exists in Supabase Auth, skipping creation.');
    supabaseUserId = existing.id;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: ADMIN_NAME, role: 'admin' },
    });

    if (error) {
      console.error('Failed to create admin in Supabase:', error.message);
      process.exit(1);
    }

    supabaseUserId = data.user.id;
    console.log(`Created admin in Supabase Auth: ${supabaseUserId}`);
  }

  // 2. Create admin in local users table
  const dbClient = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await dbClient.connect();

    // Check if already exists
    const check = await dbClient.query('SELECT id FROM users WHERE supabase_id = $1', [supabaseUserId]);

    if (check.rows.length > 0) {
      console.log('Admin already exists in local DB, skipping.');
    } else {
      await dbClient.query(
        `INSERT INTO users (supabase_id, email, full_name, role, is_active)
         VALUES ($1, $2, $3, 'admin', true)`,
        [supabaseUserId, ADMIN_EMAIL, ADMIN_NAME],
      );
      console.log('Created admin in local users table.');
    }

    console.log('\n--- Admin Account ---');
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('Role:     admin');
    console.log('\nChange the password after first login!');
  } finally {
    await dbClient.end();
  }
}

seedAdmin().catch(console.error);
