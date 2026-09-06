let memoryAuditLogs = [];

export class AuditRepository {
  async log({ userId, stationId, action, entityType, entityId, oldValue, newValue, ipAddress, userAgent }) {
    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `audit-${Date.now()}`,
      user_id: userId || null,
      station_id: stationId || null,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      old_value: oldValue || null,
      new_value: newValue || null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      created_at: new Date().toISOString(),
    };
    memoryAuditLogs.unshift(entry);
    return entry;
  }

  async findAll({ userId, stationId, action, limit = 50, offset = 0 }) {
    let list = [...memoryAuditLogs];
    if (userId) list = list.filter(l => l.user_id === userId);
    if (stationId) list = list.filter(l => l.station_id === stationId);
    if (action) list = list.filter(l => l.action === action);
    const total = list.length;
    const data = list.slice(offset, offset + limit);
    return { data, total };
  }
}

export const auditRepository = new AuditRepository();
