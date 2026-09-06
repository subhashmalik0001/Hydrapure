import { deviceRepository } from '../repositories/device.repository.js';
import { stationRepository } from '../repositories/station.repository.js';
import { waterQualityRepository } from '../repositories/waterQuality.repository.js';
import { alertRepository } from '../repositories/alert.repository.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { riskScoreService } from './riskScore.service.js';
import { anomalyService } from './anomaly.service.js';
import { notificationService } from './notification.service.js';
import { broadcastEvent } from '../sockets/socket.js';
import { verifySecret } from '../utils/helpers.js';
import { IoTAuthenticationError, NotFoundError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { CONTROL_ACTIONS, ACTION_SOURCES, STATION_STATUSES } from '../utils/constants.js';

// Cache for sequence tracking to prevent duplicate ingestion of buffered packets
const processedPacketKeys = new Set();

export class IoTService {
  /**
   * Authenticates an ESP32 device
   */
  async authenticateDevice(deviceId, deviceKey) {
    if (!deviceId || !deviceKey) {
      throw new IoTAuthenticationError('Device ID and Device Key are required');
    }

    const device = await deviceRepository.findByDeviceId(deviceId);
    if (!device) {
      // In dev fallback, allow DEV-WS-* devices with default dev key
      if (process.env.NODE_ENV === 'development' && deviceKey === process.env.IOT_API_KEY) {
        return { device_id: deviceId, station_id: '11111111-1111-1111-1111-111111110001', is_active: true };
      }
      throw new IoTAuthenticationError(`Device '${deviceId}' not recognized`);
    }

    const isValid = verifySecret(deviceKey, device.api_key_hash);
    if (!isValid && process.env.NODE_ENV !== 'development') {
      throw new IoTAuthenticationError('Invalid device authentication credentials');
    }

    await deviceRepository.updateLastSeen(deviceId);
    return device;
  }

  /**
   * Processes an incoming telemetry reading from an ESP32 node
   */
  async processTelemetry(payload, device) {
    const {
      station_code,
      timestamp,
      sequence_number,
      pH,
      tds,
      conductivity,
      turbidity,
      temperature,
      flow_rate = 0.0,
      residual_chlorine = 0.0,
      measurement_stage = 'TREATED',
    } = payload;

    // 1. Packet Idempotency Check (supports offline buffer replay without duplication)
    const packetKey = `${device.device_id}_${timestamp}_${sequence_number || 0}`;
    if (processedPacketKeys.has(packetKey)) {
      logger.info(`Duplicate IoT telemetry packet ignored: ${packetKey}`);
      return { status: 'DUPLICATE_IGNORED', duplicate: true, packetKey };
    }
    processedPacketKeys.add(packetKey);
    // Limit memory size of packet cache
    if (processedPacketKeys.size > 10000) {
      const first = processedPacketKeys.values().next().value;
      processedPacketKeys.delete(first);
    }

    // 2. Validate Station
    let station = null;
    if (station_code) {
      station = await stationRepository.findById(station_code);
    }
    if (!station && device.station_id) {
      station = await stationRepository.findById(device.station_id);
    }
    if (!station) {
      throw new NotFoundError(`Water Station for device '${device.device_id}'`);
    }

    // 3. Compute Risk Score
    const riskAssessment = riskScoreService.calculateScore({
      ph: pH,
      tds,
      turbidity,
      temperature,
      residual_chlorine,
    });

    // 4. Check for Anomalies against prior reading
    const previousReading = await waterQualityRepository.getLatestReading(station.id, measurement_stage);
    const anomalyAssessment = anomalyService.detectAnomalies(
      {
        recorded_at: timestamp || new Date().toISOString(),
        ph: pH,
        tds,
        turbidity,
        temperature,
        flow_rate,
      },
      previousReading
    );

    // 5. Store Reading in Supabase
    const savedReading = await waterQualityRepository.createReading({
      station_id: station.id,
      recorded_at: timestamp || new Date().toISOString(),
      measurement_stage,
      ph: pH,
      tds,
      conductivity: conductivity || tds * 1.5,
      turbidity,
      temperature,
      flow_rate,
      residual_chlorine,
      water_risk_score: riskAssessment.riskScore,
      risk_level: riskAssessment.riskLevel,
      source_type: 'IOT_SENSOR',
      is_valid: true,
    });

    // 6. AUTOMATED FAIL-SAFE DECISION ENGINE
    // Fail-Safe Principle: If water cannot be confirmed safe, block supply immediately.
    let controlInstruction = 'MAINTAIN';
    let newStationStatus = station.status;

    let alertReason = '';
    const isCriticalTds = tds > 500;
    const isCriticalTurbidity = turbidity > 5.0;
    const isCriticalPh = pH < 5.5 || pH > 9.5;
    const isCriticalHazard = (isCriticalTds || isCriticalTurbidity || isCriticalPh) && measurement_stage === 'TREATED';

    if (isCriticalHazard) {
      newStationStatus = STATION_STATUSES.BLOCKED;
      controlInstruction = 'CLOSE_VALVE';

      // Create Critical Incident Alert
      alertReason = isCriticalTds
        ? `High TDS detected (${tds} ppm > 500 ppm)`
        : isCriticalTurbidity
        ? `Turbidity limit exceeded (${turbidity} NTU > 5.0 NTU)`
        : `Hazardous pH deviation (${pH})`;

      const alert = await alertRepository.create({
        station_id: station.id,
        reading_id: savedReading.id,
        alert_type: 'CRITICAL_WATER_QUALITY_BLOCK',
        severity: 'CRITICAL',
        parameter: isCriticalTds ? 'TDS' : isCriticalTurbidity ? 'Turbidity' : 'pH',
        value: isCriticalTds ? tds : isCriticalTurbidity ? turbidity : pH,
        threshold: isCriticalTds ? 500 : isCriticalTurbidity ? 5.0 : 8.5,
        message: `Automatic fail-safe block engaged at ${station.name}: ${alertReason}. Solenoid valve shut down.`,
      });

      // Execute & Log Control Action
      await alertRepository.recordControlAction({
        station_id: station.id,
        action: CONTROL_ACTIONS.BLOCK_SUPPLY,
        reason: `Automated fail-safe response: ${alertReason}`,
        source: ACTION_SOURCES.AUTOMATIC,
      });

      // Update Station Status
      await stationRepository.update(station.id, {
        status: STATION_STATUSES.BLOCKED,
        last_seen_at: new Date().toISOString(),
      });

      // Audit Log
      await auditRepository.log({
        stationId: station.id,
        action: 'AUTOMATIC_SUPPLY_BLOCK',
        entityType: 'WATER_STATION',
        entityId: station.id,
        oldValue: { status: station.status },
        newValue: { status: STATION_STATUSES.BLOCKED, reading: savedReading },
      });

      // Notify Responsible Stakeholders
      await notificationService.notifyAlert(alert, station);

      // Broadcast Realtime Event to Web Dashboard & Mobile App
      broadcastEvent('station:status-changed', {
        stationId: station.id,
        stationCode: station.station_code,
        status: STATION_STATUSES.BLOCKED,
        reason: alertReason,
      });

      broadcastEvent('alert:new', alert);
      broadcastEvent('control:executed', {
        stationId: station.id,
        action: CONTROL_ACTIONS.BLOCK_SUPPLY,
        reason: alertReason,
      });
    } else {
      // Station is either SAFE or CAUTION
      if (riskAssessment.riskLevel === 'CAUTION' || riskAssessment.riskLevel === 'HIGH') {
        newStationStatus = STATION_STATUSES.CAUTION;
      } else {
        newStationStatus = STATION_STATUSES.SAFE;
      }

      await stationRepository.update(station.id, {
        status: newStationStatus,
        last_seen_at: new Date().toISOString(),
      });

      // Broadcast reading
      broadcastEvent('water-quality:new-reading', {
        stationId: station.id,
        reading: savedReading,
      });
    }

    // 7. Update Last Seen
    await stationRepository.update(station.id, { last_seen_at: new Date().toISOString() });

    const actuation_required = isCriticalHazard;
    const recommended_valve_action = isCriticalHazard ? 'BLOCK_SUPPLY' : 'ALLOW_SUPPLY';
    const actuation_command = isCriticalHazard ? 'BLOCK_SUPPLY' : 'MAINTAIN';

    return {
      status: 'PROCESSED',
      readingId: savedReading.id,
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel,
      anomaliesDetected: anomalyAssessment.hasAnomalies,
      command: controlInstruction,
      stationStatus: newStationStatus,
      station_status: newStationStatus,
      actuation_required,
      recommended_valve_action,
      actuation_command,
      reason: isCriticalHazard ? alertReason : undefined,
    };
  }

  /**
   * Handles batch buffered packet ingestion from devices recovering from offline periods
   */
  async processBufferedBatch(packets, device, station) {
    if (!Array.isArray(packets)) {
      throw new ValidationError('Expected an array of telemetry packets');
    }

    const results = [];
    let skipped_duplicates = 0;

    for (const packet of packets) {
      try {
        const res = await this.processTelemetry(packet, device, station);
        if (res.duplicate) {
          skipped_duplicates++;
        }
        results.push(res);
      } catch (err) {
        results.push({ status: 'ERROR', error: err.message, packetTimestamp: packet.timestamp });
      }
    }

    return {
      totalProcessed: results.length,
      processed_count: results.length,
      skipped_duplicates,
      successCount: results.filter((r) => r.status === 'PROCESSED').length,
      results,
    };
  }

  async processBatchTelemetry(packets, device, station) {
    return this.processBufferedBatch(packets, device, station);
  }

  async recordHeartbeat(data, device, station) {
    if (device?.id) {
      await deviceRepository.updateLastSeen(device.id);
    }
    if (station?.id) {
      await stationRepository.update(station.id, { last_seen_at: new Date().toISOString() });
    }

    const currentStation = station?.id ? await stationRepository.findById(station.id) : null;
    const valveStatus = currentStation?.status === 'BLOCKED' ? 'CLOSED' : 'OPEN';

    return {
      acknowledged: true,
      timestamp: new Date().toISOString(),
      current_valve_status: valveStatus,
      device_id: device?.device_id || data?.device_id,
      status: 'ONLINE',
    };
  }

  async getPendingCommands(deviceId) {
    return [];
  }
}

export const iotService = new IoTService();
