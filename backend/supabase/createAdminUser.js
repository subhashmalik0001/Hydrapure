import { supabaseAdmin } from '../src/config/supabase.js';

async function createAdmin() {
  console.log('Creating or verifying default admin user in live Supabase Auth...');

  const email = 'admin@hydrapure.gov.in';
  const password = 'Password123!';

  // Check if user already exists
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  let adminUser = users?.users?.find((u) => u.email === email);

  if (!adminUser) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: 'Dr. A. K. Sharma (State Water Director)',
        role: 'SUPER_ADMIN',
      },
    });

    if (error) {
      console.error('Failed to create admin in auth.users:', error);
      process.exit(1);
    }
    adminUser = data.user;
    console.log('✅ Created auth.users record:', adminUser.id);
  } else {
    console.log('ℹ️ Admin auth user already exists:', adminUser.id);
  }

  // Ensure record exists in public.profiles
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      auth_user_id: adminUser.id,
      email,
      full_name: 'Dr. A. K. Sharma',
      role: 'SUPER_ADMIN',
      district: 'Statewide',
      phone: '+919431100001',
      is_active: true,
    }, { onConflict: 'email' })
    .select()
    .single();

  if (profileError) {
    console.error('Failed to upsert profile:', profileError);
    process.exit(1);
  }

  console.log('✅ Upserted admin profile into public.profiles:', profile);
  console.log('\nDefault credentials ready:');
  console.log('  Email:    admin@hydrapure.gov.in');
  console.log('  Password: Password123!');
}

createAdmin().catch(console.error);
