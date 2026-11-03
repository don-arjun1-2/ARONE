import React, { useState } from 'react';
import {
  Lightbulb,
  Thermometer,
  Lock,
  Unlock,
  Camera,
  Tv,
  Power,
  Shield,
  Sun,
  Moon,
  Zap,
  Volume2,
  Sliders,
  CheckCircle,
} from 'lucide-react';

export interface SmartDeviceState {
  id: string;
  name: string;
  room: string;
  type: 'light' | 'thermostat' | 'lock' | 'camera' | 'media' | 'socket';
  isOn: boolean;
  value?: string | number;
  battery?: string;
  colorTemp?: 'warm' | 'cool' | 'daylight';
}

interface SmartHomeHubProps {
  devices: SmartDeviceState[];
  onToggleDevice: (deviceId: string) => void;
  onUpdateDeviceValue: (deviceId: string, value: any) => void;
  onActivateScene: (sceneName: string) => void;
  activeScene: string;
}

export const SmartHomeHub: React.FC<SmartHomeHubProps> = ({
  devices,
  onToggleDevice,
  onUpdateDeviceValue,
  onActivateScene,
  activeScene,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string>('All');

  const rooms = ['All', 'Living Room', 'Executive Office', 'Master Suite', 'Security Perimeter', 'Kitchen'];

  const filteredDevices =
    selectedRoom === 'All'
      ? devices
      : devices.filter((d) => d.room.toLowerCase() === selectedRoom.toLowerCase());

  const scenes = [
    { id: 'Home', label: 'Home Protocol', icon: Sun, desc: 'Comfort lighting, 72°F, perimeter standby' },
    { id: 'Away', label: 'Away / Secure', icon: Shield, desc: 'All lights off, 68°F, perimeter armed' },
    { id: 'Night', label: 'Night Protocol', icon: Moon, desc: 'Subdued lighting, vault locked, night vision' },
    { id: 'Focus', label: 'Deep Focus', icon: Zap, desc: 'Cool daylight, noise cancellation, dnd on' },
    { id: 'Party', label: 'Entertaining', icon: Volume2, desc: 'Ambient lights, media speakers active' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Scene Presets */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-cyan-900/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider font-mono">
                Smart Home Automation Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Voice-integrated IoT environmental controls & perimeter surveillance
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Current Scene:</span>
            <span className="px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
              {activeScene || 'Home Protocol'}
            </span>
          </div>
        </div>

        {/* Scene Selector Buttons */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {scenes.map((sc) => {
            const Icon = sc.icon;
            const isCurrent = activeScene === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => onActivateScene(sc.id)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-b from-cyan-950/90 to-blue-950/90 border-cyan-400 shadow-md shadow-cyan-500/20 text-cyan-200'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {isCurrent && <CheckCircle className="w-3.5 h-3.5 text-cyan-300" />}
                </div>
                <span className="font-semibold text-xs leading-tight">{sc.label}</span>
                <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">{sc.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Room Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {rooms.map((room) => (
          <button
            key={room}
            onClick={() => setSelectedRoom(room)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
              selectedRoom === room
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                : 'bg-slate-900/70 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {room}
          </button>
        ))}
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((device) => {
          const isLight = device.type === 'light';
          const isThermostat = device.type === 'thermostat';
          const isLock = device.type === 'lock';
          const isCamera = device.type === 'camera';
          const isMedia = device.type === 'media';

          return (
            <div
              key={device.id}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                device.isOn
                  ? 'bg-slate-900/90 border-cyan-500/40 shadow-sm shadow-cyan-950'
                  : 'bg-slate-950/70 border-slate-800/70 opacity-85'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg border ${
                      device.isOn
                        ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    {isLight && <Lightbulb className="w-5 h-5" />}
                    {isThermostat && <Thermometer className="w-5 h-5" />}
                    {isLock && (device.isOn ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5 text-amber-400" />)}
                    {isCamera && <Camera className="w-5 h-5" />}
                    {isMedia && <Tv className="w-5 h-5" />}
                    {device.type === 'socket' && <Power className="w-5 h-5" />}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">{device.name}</h4>
                    <span className="text-[11px] font-mono text-cyan-400/80">{device.room}</span>
                  </div>
                </div>

                {/* Primary Toggle */}
                <button
                  onClick={() => onToggleDevice(device.id)}
                  aria-label={`Toggle ${device.name}`}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    device.isOn ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-slate-950 shadow-md" />
                </button>
              </div>

              {/* Specific Device Controls */}
              <div className="mt-4 pt-3 border-t border-slate-800/70 text-xs">
                {isLight && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-cyan-400" /> Brightness:
                      </span>
                      <span className="font-mono text-cyan-300 font-bold">{device.value || '80'}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Number(device.value || 80)}
                      onChange={(e) => onUpdateDeviceValue(device.id, e.target.value)}
                      disabled={!device.isOn}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
                    />
                  </div>
                )}

                {isThermostat && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Target Temperature:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          onUpdateDeviceValue(device.id, Math.max(60, Number(device.value || 72) - 1))
                        }
                        className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-cyan-300 text-sm">
                        {device.value || '72'}°F
                      </span>
                      <button
                        onClick={() =>
                          onUpdateDeviceValue(device.id, Math.min(85, Number(device.value || 72) + 1))
                        }
                        className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {isLock && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        device.isOn ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {device.isOn ? 'SECURE & LOCKED' : 'UNLOCKED / ACCESS GRANTED'}
                    </span>
                  </div>
                )}

                {isCamera && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Feed:</span>
                      <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        1080p 60fps // ONLINE
                      </span>
                    </div>
                    <div className="h-20 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-80" />
                      <div className="text-center z-10">
                        <Camera className="w-5 h-5 text-cyan-500/60 mx-auto mb-1 animate-pulse" />
                        <span className="text-[10px] font-mono text-cyan-400/80">
                          PERIMETER MOTION: NOMINAL
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {isMedia && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Volume:</span>
                    <span className="font-mono text-cyan-300">{device.value || '45'}%</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
