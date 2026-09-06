import { supabaseAdmin } from '../config/supabase.js';
import { USER_ROLES } from '../utils/constants.js';

let memoryUsers = [
  { id: 'usr-001', auth_user_id: '00000000-0000-0000-0000-000000000001', full_name: 'Alok Yadav', email: 'admin@hydrapure.gov.in', phone: '+91 94310 99999', role: USER_ROLES.SUPER_ADMIN, district: 'Dhanbad', block: 'Dhanbad Urban', is_active: true, created_at: new Date().toISOString() },
  { id: 'usr-002', auth_user_id: '00000000-0000-0000-0000-000000000002', full_name: 'Rajesh Kumar', email: 'operator.jharia@hydrapure.gov.in', phone: '+91 94310 11111', role: USER_ROLES.STATION_OPERATOR, district: 'Dhanbad', block: 'Jharia', is_active: true, created_at: new Date().toISOString() },
  { id: 'usr-003', auth_user_id: '00000000-0000-0000-0000-000000000003', full_name: 'Sunita Sharma', email: 'officer.dhanbad@hydrapure.gov.in', phone: '+91 94311 22222', role: USER_ROLES.DISTRICT_OFFICER, district: 'Dhanbad', block: 'Govindpur', is_active: true, created_at: new Date().toISOString() },
];

export class UserRepository {
  async findByAuthId(authUserId) {
    const user = memoryUsers.find(u => u.auth_user_id === authUserId || u.id === authUserId);
    return user || null;
  }

  async findByEmail(email) {
    const user = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  async findById(id) {
    const user = memoryUsers.find(u => u.id === id || u.auth_user_id === id);
    return user || null;
  }

  async createProfile(profileData) {
    const profile = {
      id: crypto.randomUUID ? crypto.randomUUID() : `usr-${Date.now()}`,
      role: USER_ROLES.VIEWER,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...profileData,
    };
    memoryUsers.push(profile);
    return profile;
  }

  async updateProfile(id, updates) {
    const idx = memoryUsers.findIndex(u => u.id === id || u.auth_user_id === id);
    if (idx === -1) return null;
    memoryUsers[idx] = { ...memoryUsers[idx], ...updates, updated_at: new Date().toISOString() };
    return memoryUsers[idx];
  }

  async findAll({ role, district, limit = 20, offset = 0 }) {
    let list = [...memoryUsers];
    if (role) list = list.filter(u => u.role === role);
    if (district) list = list.filter(u => u.district === district);
    const total = list.length;
    const data = list.slice(offset, offset + limit);
    return { data, total };
  }
}

export const userRepository = new UserRepository();
