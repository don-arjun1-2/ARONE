import React, { useState, useEffect } from 'react';
import { DailyInsightCard } from './DailyInsightCard';
import { DailyInsightResult } from '../utils/telemetryInsight';
import { formatBatteryStatus, GatewayBatteryStatus } from '../utils/batteryTelemetry';
import {
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  Zap,
  Smartphone,
  Cpu,
} from 'lucide-react';

interface SystemTelemetryProps {
  activeDevicesCount: number;
  totalDevicesCount: number;
  activeScene: string;
  meetingsCount: number;
  tasksTokenAvailable: boolean;
  encryptedLogsCount: number;
  dailyInsight: DailyInsightResult;
}

export const SystemTelemetry: React.FC<SystemTelemetryProps> = ({
  activeDevicesCount,
  totalDevicesCount,
  activeScene,
  meetingsCount,
  tasksTokenAvailable,
  encryptedLogsCount,
  dailyInsight,
}) => {
  // Mobile Gateway Battery State
  const [batteryStatus, setBatteryStatus] = useState<GatewayBatteryStatus>({
    level: 94,
    charging: true,
  });

  useEffect(() => {
    let batteryApi: any = null;

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((battery: any) => {
          batteryApi = battery;
          const update = () => {
            setBatteryStatus({
              level: Math.round(battery.level * 100),
              charging: battery.charging,
              chargingTime: battery.chargingTime,
              dischargingTime: battery.dischargingTime,
            });
          };

          update();
          battery.addEventListener('levelchange', update);
          battery.addEventListener('chargingchange', update);
        })
        .catch(() => {
          // Fallback to local engine auxiliary battery state
          setBatteryStatus({ level: 94, charging: true });
        });
    }

    return () => {
      if (batteryApi) {
        try {
          batteryApi.removeEventListener('levelchange', () => {});
          batteryApi.removeEventListener('chargingchange', () => {});
        } catch {}
      }
    };
  }, []);

  const formattedBattery = formatBatteryStatus(batteryStatus);

  const renderBatteryIcon = () => {
    if (batteryStatus.charging) {
      return <BatteryCharging className="w-4 h-4 text-emerald-400" />;
    }
    if (batteryStatus.level > 70) {
      return <BatteryFull className="w-4 h-4 text-cyan-400" />;
    }
    if (batteryStatus.level > 25) {
      return <BatteryMedium className="w-4 h-4 text-sky-400" />;
    }
    return <BatteryLow className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div
      data-testid="system-telemetry-container"
      className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs font-mono space-y-2.5 shadow-xl"
    >
      {/* Telemetry Header */}
      <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>SYSTEM TELEMETRY</span>
        </div>
        <span className="text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ONLINE
        </span>
      </div>

      {/* Operational rows */}
      <div className="flex justify-between text-slate-400">
        <span>Smart Devices Active:</span>
        <span className="text-cyan-300 font-bold">
          {activeDevicesCount} / {totalDevicesCount}
        </span>
      </div>

      <div className="flex justify-between text-slate-400">
        <span>Active Environmental Scene:</span>
        <span className="text-cyan-300 font-bold">{activeScene}</span>
      </div>

      <div className="flex justify-between text-slate-400">
        <span>Scheduled Meetings Today:</span>
        <span className="text-cyan-300 font-bold">{meetingsCount}</span>
      </div>

      <div className="flex justify-between text-slate-400">
        <span>Google Tasks Sync:</span>
        <span className={tasksTokenAvailable ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
          {tasksTokenAvailable ? 'AUTHENTICATED' : 'STANDBY'}
        </span>
      </div>

      <div className="flex justify-between text-slate-400">
        <span>Encrypted Logs Stored:</span>
        <span className="text-cyan-300 font-bold">{encryptedLogsCount} Records</span>
      </div>

      {/* Local Mobile Gateway Battery Indicator Row & Gauge */}
      <div
        data-testid="mobile-gateway-battery"
        className="pt-2 border-t border-slate-800/80 space-y-1.5"
      >
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mobile Gateway Battery:</span>
          </span>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {renderBatteryIcon()}
              <span className={`font-bold font-mono ${formattedBattery.colorClass}`}>
                {batteryStatus.level}%
              </span>
            </div>

            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border ${
                batteryStatus.charging
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                  : 'bg-slate-950 text-cyan-300 border-cyan-800/50'
              }`}
            >
              {formattedBattery.statusBadge}
            </span>
          </div>
        </div>

        {/* Visual Battery Bar */}
        <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 p-0.5 flex overflow-hidden">
          <div
            style={{ width: `${Math.max(5, batteryStatus.level)}%` }}
            className={`h-full rounded-full transition-all duration-500 ${
              batteryStatus.charging
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                : batteryStatus.level > 30
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                : 'bg-gradient-to-r from-amber-500 to-rose-500'
            }`}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            {batteryStatus.charging && <Zap className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />}
            <span>{formattedBattery.displayText}</span>
          </span>
          <span className="text-slate-500">Node // BT-WiFi Link Active</span>
        </div>
      </div>

      {/* Daily Insight Sub-Card */}
      <DailyInsightCard insight={dailyInsight} />
    </div>
  );
};
