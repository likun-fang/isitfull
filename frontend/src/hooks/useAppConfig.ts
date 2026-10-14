import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import appConfig from '../../app.config';
import { appConfigService, AppConfig } from '../services/appConfigService';
import { isVersionOutdated } from '../utils/version';

const CONFIG_VERSION = appConfig({ config: {} } as any).version || '1.0.0';

interface AppConfigState {
  isLoading: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  needsUpdate: boolean;
  retry: () => void;
}

function getAppVersion(): string {
  if (Platform.OS === 'web') {
    return CONFIG_VERSION;
  }
  return Application.nativeApplicationVersion || CONFIG_VERSION;
}

export function useAppConfig(): AppConfigState {
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<AppConfig | null>(null);

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await appConfigService.getConfig();
      setConfig(result);
    } catch {
      setConfig(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const appVersion = getAppVersion();
  const needsUpdate = config ? isVersionOutdated(appVersion, config.minVersion) : false;

  return {
    isLoading,
    maintenanceMode: config?.maintenanceMode ?? false,
    maintenanceMessage: config?.maintenanceMessage ?? '',
    needsUpdate,
    retry: fetchConfig,
  };
}
