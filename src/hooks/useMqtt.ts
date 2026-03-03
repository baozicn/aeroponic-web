import { useState, useEffect, useCallback, useRef } from 'react';
import mqtt from 'mqtt';
import { AppState, AppConfig, AlertEvent, HistoryPoint, AppPreferences } from '../types';
import { safeJsonParse, num, bool } from '../lib/utils';

const DEFAULT_CFG: AppConfig = {
  broker: 'wss://broker.emqx.io:8084/mqtt',
  subTopic: 'home/data',
  pubTopic: 'home/control',
  clientId: 'aero-web-' + Math.random().toString(16).slice(2, 10),
  deviceFilter: ''
};

const INITIAL_STATE: AppState = {
  connected: false,
  deviceOnline: false,
  deviceId: '',
  lastUpdateTs: null,
  stm32Online: null,
  rxOk: null,
  crcErr: null,
  ageMs: null,
  temp: null,
  hum: null,
  lux: null,
  ec: null,
  ph: null,
  waterVolume: null,
  runtime: null,
  waterLevel: null,
  waterLevelState: null,
  lvRssi: null,
  mist: null,
  mistOnSec: null,
  mistOffSec: null,
  fan: null,
  fanSpeed: null,
  heater: null,
  light: null,
  lightPWM: null,
  sensorState: null,
  leak: null,
  raw: {},
  rawText: '{}'
};

export function useMqtt() {
  const [cfg, setCfg] = useState<AppConfig>(() => {
    try {
      const j = JSON.parse(localStorage.getItem('aero_web_cfg') || 'null');
      return { ...DEFAULT_CFG, ...(j || {}) };
    } catch (e) {
      return { ...DEFAULT_CFG };
    }
  });

  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [history, setHistory] = useState<HistoryPoint[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('aero_web_history') || '[]') || [];
    } catch (e) {
      return [];
    }
  });

  const clientRef = useRef<mqtt.MqttClient | null>(null);

  const saveCfg = useCallback((newCfg: AppConfig) => {
    setCfg(newCfg);
    localStorage.setItem('aero_web_cfg', JSON.stringify(newCfg));
  }, []);

  const addAlert = useCallback((event: string, level: 'info' | 'warn' | 'bad') => {
    setAlerts(prev => {
      const newAlerts = [{ id: Math.random().toString(36).slice(2), time: Date.now(), event, level }, ...prev];
      return newAlerts.slice(0, 12);
    });
  }, []);

  const connect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end(true);
      clientRef.current = null;
    }

    setState(prev => ({ ...prev, connected: false }));

    const client = mqtt.connect(cfg.broker, {
      clientId: cfg.clientId,
      keepalive: 30,
      clean: true,
      reconnectPeriod: 800,
      connectTimeout: 6000
    });

    clientRef.current = client;

    client.on('connect', () => {
      setState(prev => ({ ...prev, connected: true }));
      client.subscribe(cfg.subTopic, { qos: 0 });
    });

    client.on('reconnect', () => {
      setState(prev => ({ ...prev, connected: false }));
    });

    client.on('close', () => {
      setState(prev => ({ ...prev, connected: false }));
    });

    client.on('error', (err) => {
      setState(prev => ({ ...prev, connected: false }));
      console.error('MQTT Error:', err);
    });

    client.on('message', (topic, payload) => {
      const text = payload.toString();
      const obj = safeJsonParse(text);
      if (!obj) {
        setState(prev => ({ ...prev, rawText: text }));
        return;
      }

      const data = obj.data || obj.payload || obj;
      const deviceId = String(data.deviceId || data.devid || data.clientId || data.device || '');

      if (cfg.deviceFilter && deviceId && deviceId !== cfg.deviceFilter) {
        return;
      }

      setState(prev => {
        const next = { ...prev };
        next.raw = data;
        next.rawText = JSON.stringify(data, null, 2);
        if (deviceId && !next.deviceId) next.deviceId = deviceId;

        const maybeSet = (key: keyof AppState, val: any) => {
          if (val !== null && val !== undefined) {
            (next as any)[key] = val;
          }
        };

        maybeSet('temp', num(data.temp ?? data.temperature ?? data.EnvTemperature));
        maybeSet('hum', num(data.hum ?? data.humidity ?? data.EnvHumidity));
        maybeSet('lux', num(data.lux ?? data.LightIntensity));
        maybeSet('ec', num(data.ec ?? data.EC));
        maybeSet('ph', num(data.ph ?? data.PH ?? data.pH));
        maybeSet('waterVolume', num(data.waterVolume ?? data.CurrentWaterVolume));
        maybeSet('runtime', num(data.runtime ?? data.uptime_h ?? data.UptimeHours ?? data.RuntimeHours));

        maybeSet('waterLevel', num(data.waterLevel ?? data.WaterLevel));
        maybeSet('waterLevelState', num(data.waterLevelState ?? data.WaterLevelState));
        maybeSet('lvRssi', num(data.lvRssi ?? data.LvRssi ?? data.rssi));

        maybeSet('stm32Online', bool(data.stm32Online ?? data.stm32_online ?? data.online));
        maybeSet('rxOk', num(data.rxOk));
        maybeSet('crcErr', num(data.crcErr));
        maybeSet('ageMs', num(data.ageMs));

        maybeSet('mist', bool(data.mistEnable ?? data.mist));
        maybeSet('mistOnSec', num(data.mistOnSec ?? data.mist_on ?? data.mistOn));
        maybeSet('mistOffSec', num(data.mistOffSec ?? data.mist_off ?? data.mistOff));
        maybeSet('fan', bool(data.fan));
        maybeSet('fanSpeed', num(data.fanSpeed ?? data.fanPwm));
        maybeSet('heater', bool(data.heater));
        maybeSet('light', bool(data.light));
        maybeSet('lightPWM', num(data.lightPWM ?? data.lightPwm));
        maybeSet('sensorState', bool(data.sensorState));
        maybeSet('leak', bool(data.leak));

        next.lastUpdateTs = Date.now();

        // History
        setHistory(h => {
          const newH = [...h, {
            t: Date.now(),
            temp: next.temp,
            hum: next.hum,
            lux: next.lux,
            ec: next.ec,
            ph: next.ph,
            wls: next.waterLevelState
          }];
          const trimmed = newH.slice(-300);
          localStorage.setItem('aero_web_history', JSON.stringify(trimmed));
          return trimmed;
        });

        // Alerts
        if (next.leak && !prev.leak) {
          addAlert('检测到漏水信号，请检查水路与接头。', 'bad');
        }
        if (next.waterLevelState === 0 && prev.waterLevelState !== 0) {
          addAlert('水位偏低（0），建议补水。', 'warn');
        }

        return next;
      });
    });
  }, [cfg, addAlert]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end(true);
      clientRef.current = null;
    }
    setState(prev => ({ ...prev, connected: false }));
  }, []);

  const publish = useCallback((obj: any) => {
    if (!clientRef.current || !state.connected) {
      return false;
    }
    const payload = JSON.stringify({
      ...obj,
      ts: Date.now(),
      source: 'web'
    });
    clientRef.current.publish(cfg.pubTopic, payload, { qos: 0, retain: false });
    return true;
  }, [cfg.pubTopic, state.connected]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => {
        const now = Date.now();
        const isOnline = prev.connected && prev.lastUpdateTs !== null && (now - prev.lastUpdateTs < 60000);
        if (prev.deviceOnline !== isOnline) {
          return { ...prev, deviceOnline: isOnline };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return { cfg, saveCfg, state, alerts, history, connect, disconnect, publish, setHistory };
}
