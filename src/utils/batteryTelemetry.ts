/**
 * Telemetry and formatting utilities for ARONE Engine's Local Mobile Gateway Battery
 */

export interface GatewayBatteryStatus {
  level: number; // 0 to 100
  charging: boolean;
  chargingTime?: number;
  dischargingTime?: number;
}

export function formatBatteryStatus(status: GatewayBatteryStatus): {
  displayText: string;
  statusBadge: string;
  colorClass: string;
} {
  const level = Math.max(0, Math.min(100, Math.round(status.level)));
  const isCharging = status.charging;

  if (isCharging) {
    return {
      displayText: `${level}% Charging (PD Auxiliary Active)`,
      statusBadge: 'CHARGING',
      colorClass: 'text-emerald-400',
    };
  }

  if (level > 60) {
    return {
      displayText: `${level}% Nominal`,
      statusBadge: 'OPTIMAL',
      colorClass: 'text-cyan-300',
    };
  }

  if (level > 25) {
    return {
      displayText: `${level}% Moderate`,
      statusBadge: 'ADEQUATE',
      colorClass: 'text-sky-300',
    };
  }

  return {
    displayText: `${level}% Low Power Mode`,
    statusBadge: 'LOW POWER',
    colorClass: 'text-amber-400',
  };
}

export function getBatteryStatusMetrics(customLevel = 84, isCharging = true) {
  const formatted = formatBatteryStatus({ level: customLevel, charging: isCharging });
  return {
    level: customLevel,
    isCharging,
    statusLabel: formatted.statusBadge,
    displayText: formatted.displayText,
    voltage: '4.18V DC',
    colorClass: formatted.colorClass,
  };
}
