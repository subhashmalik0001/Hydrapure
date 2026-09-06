import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'vbtnhqghlsnuhfhirpoo';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';

async function executeSql(query, description = '') {
  console.log(`\n⏳ Executing: ${description || 'SQL Query'}...`);

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ Execution failed (${res.status}): ${errorText}`);
    throw new Error(errorText);
  }

  const result = await res.json();
  console.log(`✅ Success: ${description || 'Completed'}`);
  return result;
}

async function runAll() {
  try {
    const migration1Path = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const migration1Sql = fs.readFileSync(migration1Path, 'utf8');
    await executeSql(migration1Sql, '001_initial_schema.sql (Tables, Types, Triggers)');

    const migration2Path = path.join(__dirname, 'migrations', '002_rls_policies.sql');
    const migration2Sql = fs.readFileSync(migration2Path, 'utf8');
    await executeSql(migration2Sql, '002_rls_policies.sql (Row Level Security Policies)');

    const migration3Path = path.join(__dirname, 'migrations', '003_indexes_and_views.sql');
    const migration3Sql = fs.readFileSync(migration3Path, 'utf8');
    await executeSql(migration3Sql, '003_indexes_and_views.sql (Time-Series Indexes & Views)');

    const seedPath = path.join(__dirname, 'seed', 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await executeSql(seedSql, 'seed.sql (Realistic Jharkhand Stations, Devices & Telemetry)');

    console.log('\n======================================================');
    console.log('🎉 ALL SUPABASE MIGRATIONS & SEED DATA APPLIED CLEANLY!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('Fatal migration error:', err);
    process.exit(1);
  }
}

runAll();
