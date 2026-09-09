import { supabaseAdmin } from '../src/config/supabase.js';

async function createAdmin() {
  console.log('Creating or verifying default admin user in live Supabase Auth...');

  // List of initial accounts to seed/verify
  const defaultAccounts = [
    {
      email: 'admin@gmail.com',
      password: '123456',
      fullName: 'Demo Super Admin',
      role: 'SUPER_ADMIN',
      district: 'Ranchi',
      block: 'Kanke',
      phone: '+919876543210',
    },
    {
      email: 'admin@hydrapure.gov.in',
      password: 'Password123!',
      fullName: 'Dr. A. K. Sharma (State Director)',
      role: 'SUPER_ADMIN',
      district: 'Statewide',
      block: 'Central',
      phone: '+919431100001',
    },
    {
      email: 'operator@hydrapure.gov.in',
      password: '123456',
      fullName: 'Ramesh Kumar (Station Operator)',
      role: 'STATION_OPERATOR',
      district: 'Dhanbad',
      block: 'Jharia',
      phone: '+919876543211',
    },
  ];

  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const userList = existingUsers?.users || [];

  for (const acc of defaultAccounts) {
    let authUser = userList.find((u) => u.email === acc.email);

    if (!authUser) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true,
        user_metadata: { full_name: acc.fullName, role: acc.role },
      });

      if (error) {
        console.warn(`Could not create auth user for ${acc.email}:`, error.message);
      } else {
        authUser = data.user;
        console.log(`✅ Created auth user: ${acc.email}`);
      }
    } else {
      // Update password to ensure it matches
      await supabaseAdmin.auth.admin.updateUserById(authUser.id, { password: acc.password });
      console.log(`ℹ️ Updated/Verified auth user: ${acc.email}`);
    }

    if (authUser) {
      await supabaseAdmin.from('profiles').upsert(
        {
          auth_user_id: authUser.id,
          email: acc.email,
          full_name: acc.fullName,
          role: acc.role,
          district: acc.district,
          block: acc.block,
          phone: acc.phone,
          is_active: true,
        },
        { onConflict: 'email' }
      );
    }
  }

  console.log('\nDefault Demo Credentials Ready:');
  console.log('  1. Email: admin@gmail.com           Password: 123456');
  console.log('  2. Email: admin@hydrapure.gov.in    Password: Password123!');
  console.log('  3. Email: operator@hydrapure.gov.in Password: 123456');
}

createAdmin().catch(console.error);
