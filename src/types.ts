export interface AppConfig {
  broker: string;
  subTopic: string;
  pubTopic: string;
  clientId: string;
  deviceFilter: string;
}

export interface AppState {
  connected: boolean;
  deviceOnline: boolean;
  deviceId: string;
  lastUpdateTs: number | null;
  stm32Online: boolean | null;
  rxOk: number | null;
  crcErr: number | null;
  ageMs: number | null;

  // Environment
  temp: number | null;
  hum: number | null;
  lux: number | null;
  ec: number | null;
  ph: number | null;
  waterVolume: number | null;
  runtime: number | null;

  // Water
  waterLevel: number | null;
  waterLevelState: number | null;
  lvRssi: number | null;

  // System
  mist: boolean | null;
  mistOnSec: number | null;
  mistOffSec: number | null;
  fan: boolean | null;
  fanSpeed: number | null;
  heater: boolean | null;
  light: boolean | null;
  lightPWM: number | null;
  sensorState: boolean | null;
  leak: boolean | null;

  raw: any;
  rawText: string;
}

export interface AlertEvent {
  id: string;
  time: number;
  event: string;
  level: 'info' | 'warn' | 'bad';
}

export interface HistoryPoint {
  t: number;
  temp: number | null;
  hum: number | null;
  lux: number | null;
  ec: number | null;
  ph: number | null;
  wls: number | null;
}

export interface AppPreferences {
  theme: 'light' | 'dark';
  ranges: {
    ecMin: number;
    ecMax: number;
    phMin: number;
    phMax: number;
  };
  targets: {
    temp: number;
    hum: number;
  };
  schedule: {
    lightStart: string;
    lightEnd: string;
    mistOn: number;
    mistOff: number;
  };
  history: HistoryPoint[];
}
