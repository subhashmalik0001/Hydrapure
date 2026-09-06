let memoryMaintenance = [
  {
    id: 'maint-001',
    station_id: '11111111-1111-1111-1111-111111110001',
    type: 'Filter Replacement & Sensor Calibration',
    description: 'Routine quarterly media backwash and pH glass bulb buffer recalibration',
    performed_by: '00000000-0000-0000-0000-000000000002',
    scheduled_date: '2026-08-28',
    completed_at: '2026-08-28T14:30:00.000Z',
    status: 'COMPLETED',
    filter_replaced: true,
    sensor_calibrated: true,
    notes: 'Turbidity nephelometric cell cleaned with 0.02 NTU standard.',
    created_at: new Date().toISOString(),
  },
];

export class MaintenanceRepository {
  async findAll({ stationId, status, limit = 20, offset = 0 }) {
    let list = [...memoryMaintenance];
    if (stationId) list = list.filter(m => m.station_id === stationId);
    if (status) list = list.filter(m => m.status === status);
    const total = list.length;
    const data = list.slice(offset, offset + limit);
    return { data, total };
  }

  async findById(id) {
    return memoryMaintenance.find(m => m.id === id) || null;
  }

  async create(recordData) {
    const record = {
      id: crypto.randomUUID ? crypto.randomUUID() : `maint-${Date.now()}`,
      status: 'SCHEDULED',
      created_at: new Date().toISOString(),
      ...recordData,
    };
    memoryMaintenance.unshift(record);
    return record;
  }

  async update(id, updates) {
    const idx = memoryMaintenance.findIndex(m => m.id === id);
    if (idx === -1) return null;
    memoryMaintenance[idx] = { ...memoryMaintenance[idx], ...updates };
    return memoryMaintenance[idx];
  }
}

export const maintenanceRepository = new MaintenanceRepository();
