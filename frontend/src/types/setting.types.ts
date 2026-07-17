import type { BaseEntity } from './common.types';

export interface CompanySettings {
  name: string;
  legalName?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  logo?: string;
  currency: string;
  timezone: string;
}

export interface Preferences {
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  itemsPerPage: number;
  defaultTheme: 'light' | 'dark' | 'system';
}

export interface EmailSettings {
  provider: string;
  host?: string;
  port?: number;
  username?: string;
  fromAddress?: string;
  encryption: 'NONE' | 'SSL' | 'TLS';
}

export interface SettingUpdateRequest {
  company?: Partial<CompanySettings>;
  preferences?: Partial<Preferences>;
  email?: Partial<EmailSettings>;
}
