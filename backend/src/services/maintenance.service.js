import { maintenanceRepository } from '../repositories/maintenance.repository.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { NotFoundError } from '../utils/errors.js';

export class MaintenanceService {
  async getRecords(filters) {
    return maintenanceRepository.findAll(filters);
  }

  async getRecordById(id) {
    const record = await maintenanceRepository.findById(id);
    if (!record) {
      throw new NotFoundError(`Maintenance record '${id}'`);
    }
    return record;
  }

  async createRecord(data, user) {
    const record = await maintenanceRepository.create({
      ...data,
      performed_by: user?.id,
    });

    await auditRepository.log({
      userId: user?.id,
      stationId: data.station_id,
      action: 'MAINTENANCE_SCHEDULED',
      entityType: 'MAINTENANCE',
      entityId: record.id,
      newValue: record,
    });

    return record;
  }

  async completeRecord(id, { notes, filterReplaced, sensorCalibrated }, user) {
    const updated = await maintenanceRepository.update(id, {
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
      notes,
      filter_replaced: filterReplaced,
      sensor_calibrated: sensorCalibrated,
    });

    if (!updated) {
      throw new NotFoundError(`Maintenance record '${id}'`);
    }

    await auditRepository.log({
      userId: user?.id,
      stationId: updated.station_id,
      action: 'MAINTENANCE_COMPLETED',
      entityType: 'MAINTENANCE',
      entityId: id,
      newValue: updated,
    });

    return updated;
  }
}

export const maintenanceService = new MaintenanceService();
