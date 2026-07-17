import { http } from './api';
import type {
  CompanySettings,
  Preferences,
  EmailSettings,
  SettingUpdateRequest,
} from '../types/setting.types';

export const settingService = {
  async getCompany(): Promise<CompanySettings> {
    return http.get<CompanySettings>('/settings/company');
  },
  async getPreferences(): Promise<Preferences> {
    return http.get<Preferences>('/settings/preferences');
  },
  async getEmail(): Promise<EmailSettings> {
    return http.get<EmailSettings>('/settings/email');
  },
  async update(payload: SettingUpdateRequest): Promise<SettingUpdateRequest> {
    return http.put<SettingUpdateRequest>('/settings', payload);
  },
};
